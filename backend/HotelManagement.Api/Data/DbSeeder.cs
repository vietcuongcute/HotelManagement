using HotelManagement.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Api.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        await context.Database.MigrateAsync();

        if (!await context.Users.AnyAsync())
        {
            var users = new List<User>
            {
                new User
                {
                    FullName = "System Administrator",
                    Email = "admin@hotel.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123@"),
                    Role = "Admin"
                },
                new User
                {
                    FullName = "Demo User",
                    Email = "user@hotel.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("User123@"),
                    Role = "User"
                }
            };

            await context.Users.AddRangeAsync(users);
        }

        if (!await context.Rooms.AnyAsync())
        {
            var rooms = new List<Room>
            {
                new Room
                {
                    RoomNumber = "101",
                    Name = "Deluxe Ocean View",
                    Description = "Phòng cao cấp với view biển, ban công riêng và nội thất hiện đại.",
                    PricePerNight = 120,
                    Capacity = 2,
                    ImageUrl = "https://images.unsplash.com/photo-1566665797739-1674de7a421a",
                    Status = "Available"
                },
                new Room
                {
                    RoomNumber = "202",
                    Name = "Premium City Suite",
                    Description = "Suite rộng rãi, phù hợp cho gia đình nhỏ, view thành phố về đêm.",
                    PricePerNight = 180,
                    Capacity = 4,
                    ImageUrl = "https://images.unsplash.com/photo-1590490360182-c33d57733427",
                    Status = "Available"
                },
                new Room
                {
                    RoomNumber = "303",
                    Name = "Minimal Studio Room",
                    Description = "Phòng studio tối giản, sạch sẽ, tiện nghi cho khách đi công tác.",
                    PricePerNight = 90,
                    Capacity = 2,
                    ImageUrl = "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
                    Status = "Available"
                },
                new Room
                {
                    RoomNumber = "404",
                    Name = "Luxury King Room",
                    Description = "Phòng king sang trọng với bồn tắm, ánh sáng ấm và thiết kế hiện đại.",
                    PricePerNight = 250,
                    Capacity = 2,
                    ImageUrl = "https://images.unsplash.com/photo-1578683010236-d716f9a3f461",
                    Status = "Maintenance"
                }
            };

            await context.Rooms.AddRangeAsync(rooms);
        }

        await context.SaveChangesAsync();
    }
}