namespace HotelManagement.Api.DTOs;

public class CreateBookingDto
{
    public int RoomId { get; set; }

    public DateTime CheckInDate { get; set; }

    public DateTime CheckOutDate { get; set; }
}