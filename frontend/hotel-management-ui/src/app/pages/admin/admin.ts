import { Component, OnInit, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Room } from '../../core/models/room.models';
import { Booking } from '../../core/models/booking.models';
import { RoomService } from '../../core/services/room.service';
import { BookingService } from '../../core/services/booking.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './admin.html',
})
export class Admin implements OnInit {
  rooms = signal<Room[]>([]);
  bookings = signal<Booking[]>([]);
  isLoading = signal(true);
  errorMessage = signal('');

  totalRooms = computed(() => this.rooms().length);

  availableRooms = computed(() =>
    this.rooms().filter((room) => room.status === 'Available').length
  );

  totalBookings = computed(() =>
  this.bookings().filter((booking) => booking.status !== 'Cancelled').length
);

  pendingBookings = computed(() =>
    this.bookings().filter((booking) => booking.status === 'Pending').length
  );

  revenue = computed(() =>
    this.bookings()
      .filter((booking) => booking.status === 'Completed')
      .reduce((sum, booking) => sum + booking.totalPrice, 0)
  );

  recentBookings = computed(() =>
  [...this.bookings()]
    .filter((booking) => booking.status !== 'Cancelled')
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5)
);

  constructor(
    private roomService: RoomService,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.roomService.getRooms().subscribe({
      next: (rooms) => {
        this.rooms.set(rooms);
        this.loadBookings();
      },
      error: () => {
        this.errorMessage.set('Không thể tải dữ liệu phòng.');
        this.isLoading.set(false);
      },
    });
  }

  private loadBookings(): void {
    this.bookingService.getAllBookings().subscribe({
      next: (bookings) => {
        this.bookings.set(bookings);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Không thể tải dữ liệu booking.');
        this.isLoading.set(false);
      },
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-50 text-green-700 ring-green-100';
      case 'Cancelled':
        return 'bg-red-50 text-red-700 ring-red-100';
      case 'Completed':
        return 'bg-blue-50 text-blue-700 ring-blue-100';
      default:
        return 'bg-amber-50 text-amber-700 ring-amber-100';
    }
  }
}