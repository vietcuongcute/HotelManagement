import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Booking, CreateBookingRequest } from '../models/booking.models';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private readonly apiUrl = 'http://localhost:5191/api/bookings';

  constructor(private http: HttpClient) {}

  createBooking(data: CreateBookingRequest): Observable<Booking> {
    return this.http.post<Booking>(this.apiUrl, data);
  }

  getMyBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/my-bookings`);
  }

  getAllBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(this.apiUrl);
  }

  cancelMyBooking(id: number): Observable<{ message: string }> {
  return this.http.put<{ message: string }>(`${this.apiUrl}/${id}/cancel`, {});
}
  updateBookingStatus(id: number, status: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/${id}/status`, {
      status,
    });
  }
}