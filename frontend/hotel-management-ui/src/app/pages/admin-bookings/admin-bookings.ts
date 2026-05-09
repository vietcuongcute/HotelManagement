import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Booking } from '../../core/models/booking.models';
import { BookingService } from '../../core/services/booking.service';

@Component({
  selector: 'app-admin-bookings',
  standalone: true,
  imports: [DatePipe, FormsModule],
  templateUrl: './admin-bookings.html',
})
export class AdminBookings implements OnInit {
  bookings = signal<Booking[]>([]);
  isLoading = signal(true);
  errorMessage = signal('');
  successMessage = signal('');
  updatingId = signal<number | null>(null);

  statuses = ['Pending', 'Confirmed', 'Cancelled', 'Completed'];

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.bookingService.getAllBookings().subscribe({
      next: (bookings) => {
        this.bookings.set(this.sortBookings(bookings));
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Không thể tải danh sách đặt phòng.');
        this.isLoading.set(false);
      },
    });
  }

  updateStatus(booking: Booking, status: string): void {
    if (booking.status === status) {
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');
    this.updatingId.set(booking.id);

    this.bookingService.updateBookingStatus(booking.id, status).subscribe({
      next: (response) => {
        this.successMessage.set(response.message);
        this.updatingId.set(null);
        this.loadBookings();
      },
      error: (error) => {
        this.errorMessage.set(
          error?.error?.message || 'Cập nhật trạng thái thất bại.'
        );
        this.updatingId.set(null);
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

  private sortBookings(bookings: Booking[]): Booking[] {
    return [...bookings].sort((a, b) => {
      if (a.status === 'Cancelled' && b.status !== 'Cancelled') {
        return 1;
      }

      if (a.status !== 'Cancelled' && b.status === 'Cancelled') {
        return -1;
      }

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }
}