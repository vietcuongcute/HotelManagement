import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Room } from '../../core/models/room.models';
import { RoomService } from '../../core/services/room.service';
import { AuthService } from '../../core/services/auth.service';
import { BookingService } from '../../core/services/booking.service';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './rooms.html',
})
export class Rooms implements OnInit {
  rooms = signal<Room[]>([]);
  isLoading = signal(true);
  isBooking = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  selectedRoom = signal<Room | null>(null);

  checkInDate = '';
  checkOutDate = '';

  constructor(
    private roomService: RoomService,
    public authService: AuthService,
    private bookingService: BookingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRooms();
  }

  loadRooms(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.roomService.getRooms().subscribe({
      next: (rooms) => {
        this.rooms.set(rooms);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Không thể tải danh sách phòng. Vui lòng kiểm tra backend.');
        this.isLoading.set(false);
      },
    });
  }

  openBookingForm(room: Room): void {
    this.successMessage.set('');
    this.errorMessage.set('');

    if (!this.authService.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }

    if (this.authService.isAdmin()) {
      this.errorMessage.set('Admin không thể đặt phòng. Vui lòng dùng tài khoản User.');
      return;
    }

    if (room.status !== 'Available') {
      this.errorMessage.set('Phòng này hiện không khả dụng.');
      return;
    }

    this.selectedRoom.set(room);

    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    this.checkInDate = today.toISOString().split('T')[0];
    this.checkOutDate = tomorrow.toISOString().split('T')[0];
  }

  closeBookingForm(): void {
    this.selectedRoom.set(null);
    this.errorMessage.set('');
  }

  submitBooking(): void {
    const room = this.selectedRoom();

    if (!room) {
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');

    if (!this.checkInDate || !this.checkOutDate) {
      this.errorMessage.set('Vui lòng chọn ngày check-in và check-out.');
      return;
    }

    if (this.checkOutDate <= this.checkInDate) {
      this.errorMessage.set('Ngày check-out phải lớn hơn ngày check-in.');
      return;
    }

    this.isBooking.set(true);

    this.bookingService
      .createBooking({
        roomId: room.id,
        checkInDate: this.checkInDate,
        checkOutDate: this.checkOutDate,
      })
      .subscribe({
        next: (booking) => {
          this.isBooking.set(false);
          this.selectedRoom.set(null);
          this.successMessage.set(
            `Đặt phòng ${booking.roomNumber} thành công. Tổng tiền: $${booking.totalPrice}.`
          );
        },
        error: (error) => {
          this.isBooking.set(false);
          this.errorMessage.set(
            error?.error?.message || 'Đặt phòng thất bại. Vui lòng thử lại.'
          );
        },
      });
  }
}