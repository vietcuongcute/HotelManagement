import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './login.html',
})
export class Login {
  email = 'admin@hotel.com';
  password = 'Admin123@';

  isLoading = signal(false);
  errorMessage = signal('');

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  submit(): void {
    this.errorMessage.set('');

    if (!this.email || !this.password) {
      this.errorMessage.set('Vui lòng nhập email và mật khẩu.');
      return;
    }

    this.isLoading.set(true);

    this.authService
      .login({
        email: this.email,
        password: this.password,
      })
      .subscribe({
        next: (response) => {
          this.isLoading.set(false);

          if (response.role === 'Admin') {
            this.router.navigateByUrl('/admin');
            return;
          }

          this.router.navigateByUrl('/rooms');
        },
        error: (error) => {
          this.isLoading.set(false);
          this.errorMessage.set(
            error?.error?.message || 'Đăng nhập thất bại. Vui lòng thử lại.'
          );
        },
      });
  }
}