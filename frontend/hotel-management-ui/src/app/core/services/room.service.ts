import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Room } from '../models/room.models';

export interface CreateRoomRequest {
  roomNumber: string;
  name: string;
  floor: number;
  description: string;
  pricePerNight: number;
  capacity: number;
  imageUrl: string;
  status: string;
}

export interface UpdateRoomRequest {
  roomNumber: string;
  name: string;
  floor: number;
  description: string;
  pricePerNight: number;
  capacity: number;
  imageUrl: string;
  status: string;
}

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  private readonly apiUrl = 'http://localhost:5191/api/rooms';

  constructor(private http: HttpClient) {}

  getRooms(): Observable<Room[]> {
    return this.http.get<Room[]>(this.apiUrl);
  }

  getRoom(id: number): Observable<Room> {
    return this.http.get<Room>(`${this.apiUrl}/${id}`);
  }

  createRoom(data: CreateRoomRequest): Observable<Room> {
    return this.http.post<Room>(this.apiUrl, data);
  }

  updateRoom(id: number, data: UpdateRoomRequest): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/${id}`, data);
  }

  deleteRoom(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}