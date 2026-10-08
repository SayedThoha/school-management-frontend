import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-wrapper">
      <div class="login-card">
        <div class="login-header">
          <div class="login-brand-icon">
            <i class="ri-graduation-cap-fill"></i>
          </div>
          <h1>EduPulse Portal</h1>
          <p>School Management System Authentication</p>
        </div>

        <div *ngIf="errorMessage" class="alert alert-danger">
          <i class="ri-error-warning-line"></i>
          <span>{{ errorMessage }}</span>
        </div>

        <form (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <div class="input-with-icon">
              <i class="ri-mail-line"></i>
              <input
                type="email"
                [(ngModel)]="email"
                name="email"
                required
                class="form-control"
                placeholder="name@school.com"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <div class="input-with-icon">
              <i class="ri-lock-line"></i>
              <input
                type="password"
                [(ngModel)]="password"
                name="password"
                required
                class="form-control"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button type="submit" [disabled]="loading" class="btn btn-primary btn-block">
            <span *ngIf="loading"><i class="ri-loader-4-line ri-spin"></i> Signing in...</span>
            <span *ngIf="!loading">Sign In to Dashboard</span>
          </button>
        </form>

        <div class="demo-accounts">
          <div class="demo-title">QUICK ACCESS DEMO CREDENTIALS</div>
          <div class="demo-buttons">
            <button type="button" (click)="fillDemo('admin')" class="demo-btn">
              <i class="ri-shield-user-line"></i>
              <span>Fill Admin (Full Access)</span>
            </button>
            <button type="button" (click)="fillDemo('teacher')" class="demo-btn">
              <i class="ri-user-star-line"></i>
              <span>Fill Teacher (Academic Access)</span>
            </button>
          </div>
        </div>

        <div class="login-footer">
          <span>Protected with JWT & BCrypt | MEAN Stack</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
      padding: 1.5rem;
    }

    .login-card {
      background: #ffffff;
      width: 100%;
      max-width: 440px;
      border-radius: var(--radius-xl);
      padding: 2.5rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .login-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .login-brand-icon {
      width: 58px;
      height: 58px;
      background: var(--primary-gradient);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      color: #ffffff;
      margin: 0 auto 1rem;
      box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);
    }

    .login-header h1 {
      font-size: 1.6rem;
      color: var(--slate-900);
      margin-bottom: 0.25rem;
    }

    .login-header p {
      font-size: 0.875rem;
      color: var(--slate-500);
    }

    .input-with-icon {
      position: relative;
    }

    .input-with-icon i {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--slate-400);
      font-size: 1.1rem;
    }

    .input-with-icon input {
      padding-left: 2.75rem;
    }

    .btn-block {
      width: 100%;
      padding: 0.8rem;
      font-size: 0.95rem;
      margin-top: 0.75rem;
    }

    .demo-accounts {
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px dashed var(--slate-200);
    }

    .demo-title {
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: var(--slate-400);
      text-align: center;
      margin-bottom: 0.75rem;
    }

    .demo-buttons {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .demo-btn {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.6rem 0.85rem;
      background: var(--slate-50);
      border: 1px solid var(--slate-200);
      border-radius: var(--radius-md);
      color: var(--slate-700);
      font-size: 0.8rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: left;
    }

    .demo-btn:hover {
      background: var(--primary-50);
      border-color: var(--primary-200);
      color: var(--primary-700);
    }

    .login-footer {
      text-align: center;
      margin-top: 1.75rem;
      font-size: 0.75rem;
      color: var(--slate-400);
    }
  `],
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {
    if (this.authService.isAuthenticated) {
      this.router.navigate(['/dashboard']);
    }
  }

  fillDemo(role: 'admin' | 'teacher'): void {
    if (role === 'admin') {
      this.email = 'admin@school.com';
      this.password = 'Admin@123';
    } else {
      this.email = 'sarah@school.com';
      this.password = 'Teacher@123';
    }
  }

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please provide both email and password';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Login failed. Please check your credentials.';
      },
    });
  }
}
