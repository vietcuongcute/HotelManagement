import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import {
  AuthResponse,
  CurrentUser,
  LoginRequest,
  RegisterRequest,
} from '../models/auth.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:5191/api/auth';
  private readonly storageKey = 'hotel_auth_user';

  currentUser = signal<CurrentUser | null>(this.getStoredUser());

  constructor(private http: HttpClient) {}

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
      tap((response) => {
        this.saveUser(response);
      })
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap((response) => {
        this.saveUser(response);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
    this.currentUser.set(null);
  }

  isLoggedIn(): boolean {
    return !!this.currentUser();
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'Admin';
  }

  isUser(): boolean {
    return this.currentUser()?.role === 'User';
  }

  getToken(): string | null {
    return this.currentUser()?.token ?? null;
  }

  private saveUser(response: AuthResponse): void {
    const user: CurrentUser = {
      token: response.token,
      role: response.role,
      fullName: response.fullName,
      email: response.email,
    };

    localStorage.setItem(this.storageKey, JSON.stringify(user));
    this.currentUser.set(user);
  }

  private getStoredUser(): CurrentUser | null {
    const raw = localStorage.getItem(this.storageKey);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as CurrentUser;
    } catch {
      localStorage.removeItem(this.storageKey);
      return null;
    }
  }
}