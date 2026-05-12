using HotelManagement.Api.Data;
using HotelManagement.Api.DTOs;
using HotelManagement.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RoomsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public RoomsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<RoomDto>>> GetRooms()
    {
        var rooms = await _context.Rooms
            .OrderBy(r => r.RoomNumber)
            .Select(r => new RoomDto
            {
                Id = r.Id,
                RoomNumber = r.RoomNumber,
                Floor = r.Floor,
                Name = r.Name,
                Description = r.Description,
                PricePerNight = r.PricePerNight,
                Capacity = r.Capacity,
                ImageUrl = r.ImageUrl,
                Status = r.Status
            })
            .ToListAsync();

        return Ok(rooms);
    }

    [AllowAnonymous]
    [HttpGet("{id:int}")]
    public async Task<ActionResult<RoomDto>> GetRoom(int id)
    {
        var room = await _context.Rooms
            .Where(r => r.Id == id)
            .Select(r => new RoomDto
            {
                Id = r.Id,
                RoomNumber = r.RoomNumber,
                Name = r.Name,
                Floor = r.Floor,
                Description = r.Description,
                PricePerNight = r.PricePerNight,
                Capacity = r.Capacity,
                ImageUrl = r.ImageUrl,
                Status = r.Status
            })
            .FirstOrDefaultAsync();

        if (room == null)
        {
            return NotFound(new { message = "Không tìm thấy phòng." });
        }

        return Ok(room);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<RoomDto>> CreateRoom(CreateRoomDto dto)
    {
        var roomNumberExists = await _context.Rooms
            .AnyAsync(r => r.RoomNumber == dto.RoomNumber.Trim());

        if (roomNumberExists)
        {
            return BadRequest(new { message = "Số phòng đã tồn tại." });
        }
        if (dto.Floor <= 0)
{
    return BadRequest(new { message = "Tầng phải lớn hơn 0." });
}
        var room = new Room
        {
            RoomNumber = dto.RoomNumber.Trim(),
            Name = dto.Name.Trim(),
            Description = dto.Description.Trim(),
            Floor = dto.Floor,
            PricePerNight = dto.PricePerNight,
            Capacity = dto.Capacity,
            ImageUrl = dto.ImageUrl.Trim(),
            Status = dto.Status.Trim()
        };

        _context.Rooms.Add(room);
        await _context.SaveChangesAsync();

        var result = new RoomDto
        {
            Id = room.Id,
            RoomNumber = room.RoomNumber,
            Name = room.Name,
            Floor = room.Floor,
            Description = room.Description,
            PricePerNight = room.PricePerNight,
            Capacity = room.Capacity,
            ImageUrl = room.ImageUrl,
            Status = room.Status
        };

        return CreatedAtAction(nameof(GetRoom), new { id = room.Id }, result);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateRoom(int id, UpdateRoomDto dto)
    {
        var room = await _context.Rooms.FindAsync(id);

        if (room == null)
        {
            return NotFound(new { message = "Không tìm thấy phòng." });
        }
        if (dto.Floor <= 0)
{
    return BadRequest(new { message = "Tầng phải lớn hơn 0." });
}
        var duplicateRoomNumber = await _context.Rooms
            .AnyAsync(r => r.Id != id && r.RoomNumber == dto.RoomNumber.Trim());

        if (duplicateRoomNumber)
        {
            return BadRequest(new { message = "Số phòng đã tồn tại." });
        }

        room.RoomNumber = dto.RoomNumber.Trim();
        room.Name = dto.Name.Trim();
        room.Description = dto.Description.Trim();
        room.PricePerNight = dto.PricePerNight;
        room.Floor = dto.Floor;
        room.Capacity = dto.Capacity;
        room.ImageUrl = dto.ImageUrl.Trim();
        room.Status = dto.Status.Trim();

        await _context.SaveChangesAsync();

        return Ok(new { message = "Cập nhật phòng thành công." });
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteRoom(int id)
    {
        var room = await _context.Rooms.FindAsync(id);

        if (room == null)
        {
            return NotFound(new { message = "Không tìm thấy phòng." });
        }

        var hasBookings = await _context.Bookings.AnyAsync(b => b.RoomId == id);

        if (hasBookings)
        {
            return BadRequest(new { message = "Không thể xoá phòng đã có đặt phòng." });
        }

        _context.Rooms.Remove(room);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Xoá phòng thành công." });
    }
}