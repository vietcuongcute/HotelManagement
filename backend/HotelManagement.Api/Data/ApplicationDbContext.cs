using HotelManagement.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Api.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Room> Rooms => Set<Room>();
    public DbSet<Booking> Bookings => Set<Booking>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<User>()
            .Property(u => u.Role)
            .HasMaxLength(20);

        // Room
        // Room
modelBuilder.Entity<Room>()
    .HasIndex(r => r.RoomNumber)
    .IsUnique();

modelBuilder.Entity<Room>()
    .Property(r => r.Floor)
    .HasDefaultValue(1);

modelBuilder.Entity<Room>()
    .Property(r => r.PricePerNight)
    .HasColumnType("decimal(18,2)");

modelBuilder.Entity<Room>()
    .Property(r => r.Status)
    .HasMaxLength(30);

        // Booking
        modelBuilder.Entity<Booking>()
            .Property(b => b.TotalPrice)
            .HasColumnType("decimal(18,2)");

        modelBuilder.Entity<Booking>()
            .Property(b => b.Status)
            .HasMaxLength(30);

        modelBuilder.Entity<Booking>()
            .HasOne(b => b.User)
            .WithMany(u => u.Bookings)
            .HasForeignKey(b => b.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Booking>()
            .HasOne(b => b.Room)
            .WithMany(r => r.Bookings)
            .HasForeignKey(b => b.RoomId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}