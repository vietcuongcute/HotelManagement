import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  CreateRoomRequest,
  RoomService,
  UpdateRoomRequest,
} from '../../core/services/room.service';
import { Room } from '../../core/models/room.models';


@Component({
  selector: 'app-admin-rooms',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-rooms.html',
})
export class AdminRooms implements OnInit {
  rooms = signal<Room[]>([]);
  isLoading = signal(true);
  isSaving = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  editingRoom = signal<Room | null>(null);
  showForm = signal(false);
  selectedFloor = signal<number | 'All'>('All');

  statuses = ['Available', 'Booked', 'Maintenance'];

  form: CreateRoomRequest = {
    roomNumber: '',
    name: '',
    floor: 1,
    description: '',
    pricePerNight: 0,
    capacity: 2,
    imageUrl: '',
    status: 'Available',
  };
  
  floors = computed(() => {
  const uniqueFloors = new Set(this.rooms().map((room) => room.floor));
  return [...uniqueFloors].sort((a, b) => a - b);
});

filteredRooms = computed(() => {
  const floor = this.selectedFloor();

  if (floor === 'All') {
    return this.rooms();
  }

  return this.rooms().filter((room) => room.floor === floor);
});
  constructor(private roomService: RoomService) {}

  ngOnInit(): void {
    this.loadRooms();
  }

  loadRooms(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.roomService.getRooms().subscribe({
      next: (rooms) => {
        this.rooms.set([...rooms].sort((a, b) => a.roomNumber.localeCompare(b.roomNumber)));
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Không thể tải danh sách phòng.');
        this.isLoading.set(false);
      },
    });
  }

  openCreateForm(): void {
    this.editingRoom.set(null);
    this.showForm.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.form = {
      roomNumber: '',
      name: '',
      floor: 1,
      description: '',
      pricePerNight: 0,
      capacity: 2,
      imageUrl: '',
      status: 'Available',
    };
  }

  openEditForm(room: Room): void {
    this.editingRoom.set(room);
    this.showForm.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.form = {
      roomNumber: room.roomNumber,
      name: room.name,
      floor: room.floor,
      description: room.description,
      pricePerNight: room.pricePerNight,
      capacity: room.capacity,
      imageUrl: room.imageUrl,
      status: room.status,
    };
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingRoom.set(null);
    this.errorMessage.set('');
  }

  saveRoom(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (!this.form.roomNumber || !this.form.name || !this.form.description) {
      this.errorMessage.set('Vui lòng nhập đầy đủ số phòng, tên phòng và mô tả.');
      return;
    }

    if (this.form.floor <= 0) {
  this.errorMessage.set('Tầng phải lớn hơn 0.');
  return;
}

    if (this.form.pricePerNight <= 0) {
      this.errorMessage.set('Giá phòng phải lớn hơn 0.');
      return;
    }

    if (this.form.capacity <= 0) {
      this.errorMessage.set('Sức chứa phải lớn hơn 0.');
      return;
    }

    this.isSaving.set(true);

    const editingRoom = this.editingRoom();

    if (editingRoom) {
      const data: UpdateRoomRequest = { ...this.form };

      this.roomService.updateRoom(editingRoom.id, data).subscribe({
        next: (response) => {
          this.successMessage.set(response.message);
          this.isSaving.set(false);
          this.showForm.set(false);
          this.editingRoom.set(null);
          this.loadRooms();
        },
        error: (error) => {
          this.errorMessage.set(error?.error?.message || 'Cập nhật phòng thất bại.');
          this.isSaving.set(false);
        },
      });

      return;
    }

    this.roomService.createRoom(this.form).subscribe({
      next: () => {
        this.successMessage.set('Thêm phòng thành công.');
        this.isSaving.set(false);
        this.showForm.set(false);
        this.loadRooms();
      },
      error: (error) => {
        this.errorMessage.set(error?.error?.message || 'Thêm phòng thất bại.');
        this.isSaving.set(false);
      },
    });
  }

  deleteRoom(room: Room): void {
    const confirmed = confirm(`Bạn có chắc muốn xoá phòng ${room.roomNumber}?`);

    if (!confirmed) {
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');

    this.roomService.deleteRoom(room.id).subscribe({
      next: (response) => {
        this.successMessage.set(response.message);
        this.loadRooms();
      },
      error: (error) => {
        this.errorMessage.set(
          error?.error?.message || 'Xoá phòng thất bại. Phòng có thể đã có booking.'
        );
      },
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Available':
        return 'bg-green-50 text-green-700 ring-green-100';
      case 'Booked':
        return 'bg-blue-50 text-blue-700 ring-blue-100';
      default:
        return 'bg-amber-50 text-amber-700 ring-amber-100';
    }
  }
}