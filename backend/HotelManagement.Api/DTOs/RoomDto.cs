namespace HotelManagement.Api.DTOs;

public class RoomDto
{
    public int Id { get; set; }

    public string RoomNumber { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public decimal PricePerNight { get; set; }

    public int Capacity { get; set; }

    public string ImageUrl { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;
}