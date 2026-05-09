export interface CreateBookingRequest {
  roomId: number;
  checkInDate: string;
  checkOutDate: string;
}

export interface Booking {
  id: number;
  userId: number;
  userFullName: string;
  userEmail: string;
  roomId: number;
  roomNumber: string;
  roomName: string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  status: string;
  createdAt: string;
}