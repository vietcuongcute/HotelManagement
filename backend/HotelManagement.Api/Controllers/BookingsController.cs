using System.Security.Claims;
using HotelManagement.Api.Data;
using HotelManagement.Api.DTOs;
using HotelManagement.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookingsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public BookingsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [Authorize(Roles = "User")]
    [HttpPost]
    public async Task<ActionResult<BookingDto>> CreateBooking(CreateBookingDto dto)
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(userIdValue, out var userId))
        {
            return Unauthorized(new { message = "Token không hợp lệ." });
        }

        if (dto.CheckInDate.Date < DateTime.UtcNow.Date)
        {
            return BadRequest(new { message = "Ngày check-in không được nhỏ hơn hôm nay." });
        }

        if (dto.CheckOutDate.Date <= dto.CheckInDate.Date)
        {
            return BadRequest(new { message = "Ngày check-out phải lớn hơn ngày check-in." });
        }

        var room = await _context.Rooms.FindAsync(dto.RoomId);

        if (room == null)
        {
            return NotFound(new { message = "Không tìm thấy phòng." });
        }

        if (room.Status != "Available")
        {
            return BadRequest(new { message = "Phòng này hiện không khả dụng." });
        }

        var isRoomBooked = await _context.Bookings.AnyAsync(b =>
            b.RoomId == dto.RoomId &&
            b.Status != "Cancelled" &&
            dto.CheckInDate.Date < b.CheckOutDate.Date &&
            dto.CheckOutDate.Date > b.CheckInDate.Date
        );

        if (isRoomBooked)
        {
            return BadRequest(new { message = "Phòng đã có người đặt trong khoảng thời gian này." });
        }

        var totalNights = (dto.CheckOutDate.Date - dto.CheckInDate.Date).Days;
        var totalPrice = totalNights * room.PricePerNight;

        var booking = new Booking
        {
            UserId = userId,
            RoomId = dto.RoomId,
            CheckInDate = dto.CheckInDate.Date,
            CheckOutDate = dto.CheckOutDate.Date,
            TotalPrice = totalPrice,
            Status = "Pending"
        };

        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();

        var createdBooking = await _context.Bookings
            .Include(b => b.User)
            .Include(b => b.Room)
            .Where(b => b.Id == booking.Id)
            .Select(b => new BookingDto
            {
                Id = b.Id,
                UserId = b.UserId,
                UserFullName = b.User!.FullName,
                UserEmail = b.User.Email,
                RoomId = b.RoomId,
                RoomNumber = b.Room!.RoomNumber,
                RoomName = b.Room.Name,
                CheckInDate = b.CheckInDate,
                CheckOutDate = b.CheckOutDate,
                TotalPrice = b.TotalPrice,
                Status = b.Status,
                CreatedAt = b.CreatedAt
            })
            .FirstAsync();

        return Ok(createdBooking);
    }

    [Authorize(Roles = "User")]
    [HttpGet("my-bookings")]
    public async Task<ActionResult<IEnumerable<BookingDto>>> GetMyBookings()
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(userIdValue, out var userId))
        {
            return Unauthorized(new { message = "Token không hợp lệ." });
        }

        var bookings = await _context.Bookings
            .Include(b => b.User)
            .Include(b => b.Room)
            .Where(b => b.UserId == userId)
            .OrderByDescending(b => b.CreatedAt)
            .Select(b => new BookingDto
            {
                Id = b.Id,
                UserId = b.UserId,
                UserFullName = b.User!.FullName,
                UserEmail = b.User.Email,
                RoomId = b.RoomId,
                RoomNumber = b.Room!.RoomNumber,
                RoomName = b.Room.Name,
                CheckInDate = b.CheckInDate,
                CheckOutDate = b.CheckOutDate,
                TotalPrice = b.TotalPrice,
                Status = b.Status,
                CreatedAt = b.CreatedAt
            })
            .ToListAsync();

        return Ok(bookings);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<BookingDto>>> GetAllBookings()
    {
        var bookings = await _context.Bookings
            .Include(b => b.User)
            .Include(b => b.Room)
            .OrderByDescending(b => b.CreatedAt)
            .Select(b => new BookingDto
            {
                Id = b.Id,
                UserId = b.UserId,
                UserFullName = b.User!.FullName,
                UserEmail = b.User.Email,
                RoomId = b.RoomId,
                RoomNumber = b.Room!.RoomNumber,
                RoomName = b.Room.Name,
                CheckInDate = b.CheckInDate,
                CheckOutDate = b.CheckOutDate,
                TotalPrice = b.TotalPrice,
                Status = b.Status,
                CreatedAt = b.CreatedAt
            })
            .ToListAsync();

        return Ok(bookings);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:int}/status")]
    public async Task<IActionResult> UpdateBookingStatus(int id, UpdateBookingStatusDto dto)
    {
        var booking = await _context.Bookings.FindAsync(id);

        if (booking == null)
        {
            return NotFound(new { message = "Không tìm thấy booking." });
        }

        var allowedStatuses = new[] { "Pending", "Confirmed", "Cancelled", "Completed" };

        if (!allowedStatuses.Contains(dto.Status))
        {
            return BadRequest(new { message = "Trạng thái không hợp lệ." });
        }

        booking.Status = dto.Status;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Cập nhật trạng thái booking thành công." });
    }
    [Authorize(Roles = "User")]
[HttpPut("{id:int}/cancel")]
public async Task<IActionResult> CancelMyBooking(int id)
{
    var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);

    if (!int.TryParse(userIdValue, out var userId))
    {
        return Unauthorized(new { message = "Token không hợp lệ." });
    }

    var booking = await _context.Bookings
        .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);

    if (booking == null)
    {
        return NotFound(new { message = "Không tìm thấy booking của bạn." });
    }

    if (booking.Status == "Cancelled")
    {
        return BadRequest(new { message = "Booking này đã được huỷ trước đó." });
    }

    if (booking.Status == "Completed")
    {
        return BadRequest(new { message = "Không thể huỷ booking đã hoàn thành." });
    }

    booking.Status = "Cancelled";

    await _context.SaveChangesAsync();

    return Ok(new { message = "Huỷ đặt phòng thành công." });
}
}