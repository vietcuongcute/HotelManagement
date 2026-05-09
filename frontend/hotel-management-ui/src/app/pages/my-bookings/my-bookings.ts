import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Booking } from '../../core/models/booking.models';
import { BookingService } from '../../core/services/booking.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './my-bookings.html',
})
export class MyBookings implements OnInit {
  bookings = signal<Booking[]>([]);
  isLoading = signal(true);
  errorMessage = signal('');
  successMessage = signal('');
  cancellingId = signal<number | null>(null);

  constructor(
    private bookingService: BookingService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }

    if (!this.authService.isUser()) {
      this.router.navigateByUrl('/');
      return;
    }

    this.loadBookings();
  }

  loadBookings(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.bookingService.getMyBookings().subscribe({
      next: (bookings) => {
  const sortedBookings = bookings.sort((a, b) => {
    if (a.status === 'Cancelled' && b.status !== 'Cancelled') {
      return 1;
    }

    if (a.status !== 'Cancelled' && b.status === 'Cancelled') {
      return -1;
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  this.bookings.set(sortedBookings);
  this.isLoading.set(false);
},
      error: () => {
        this.errorMessage.set('Không thể tải lịch sử đặt phòng.');
        this.isLoading.set(false);
      },
    });
  }

  canCancel(status: string): boolean {
    return status === 'Pending' || status === 'Confirmed';
  }

  cancelBooking(booking: Booking): void {
    const confirmed = confirm(`Bạn có chắc muốn huỷ booking phòng ${booking.roomNumber}?`);

    if (!confirmed) {
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');
    this.cancellingId.set(booking.id);

    this.bookingService.cancelMyBooking(booking.id).subscribe({
      next: (response) => {
        this.successMessage.set(response.message);
        this.cancellingId.set(null);
        this.loadBookings();
      },
      error: (error) => {
        this.errorMessage.set(
          error?.error?.message || 'Huỷ đặt phòng thất bại. Vui lòng thử lại.'
        );
        this.cancellingId.set(null);
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