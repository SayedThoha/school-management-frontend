import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="app-layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-brand">
          <div class="brand-icon">
            <i class="ri-graduation-cap-fill"></i>
          </div>
          <div class="brand-text">
            <h2>EduPulse</h2>
            <span>Academy Admin</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-section-label">OVERVIEW</div>
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
            <i class="ri-dashboard-3-line"></i>
            <span>Dashboard</span>
          </a>

          <div class="nav-section-label">ACADEMICS</div>
          <a routerLink="/students" routerLinkActive="active" class="nav-item">
            <i class="ri-user-smile-line"></i>
            <span>Students</span>
          </a>
          <a routerLink="/teachers" routerLinkActive="active" class="nav-item">
            <i class="ri-user-star-line"></i>
            <span>Teachers</span>
          </a>
          <a routerLink="/classes" routerLinkActive="active" class="nav-item">
            <i class="ri-building-4-line"></i>
            <span>Classes</span>
          </a>
          <a routerLink="/subjects" routerLinkActive="active" class="nav-item">
            <i class="ri-book-3-line"></i>
            <span>Subjects</span>
          </a>

          <div class="nav-section-label">OPERATIONS</div>
          <a routerLink="/attendance" routerLinkActive="active" class="nav-item">
            <i class="ri-calendar-check-line"></i>
            <span>Attendance</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <div class="user-badge-card">
            <div class="user-avatar">
              {{ (currentUser?.name || 'U')[0] }}
            </div>
            <div class="user-info">
              <div class="user-name">{{ currentUser?.name }}</div>
              <span class="user-role badge" [ngClass]="currentUser?.role === 'Admin' ? 'badge-primary' : 'badge-info'">
                {{ currentUser?.role }}
              </span>
            </div>
          </div>
          <button (click)="logout()" class="btn-logout" title="Sign Out">
            <i class="ri-logout-box-r-line"></i>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="main-content">
        <!-- Topbar -->
        <header class="topbar">
          <div class="topbar-search">
            <i class="ri-search-line"></i>
            <span class="system-tag">MEAN Stack School Management System</span>
          </div>

          <div class="topbar-actions">
            <div class="role-chip">
              <span class="pulse-indicator"></span>
              Role: <strong>{{ currentUser?.role }}</strong>
            </div>
          </div>
        </header>

        <!-- Dynamic Page Outlet -->
        <div class="page-container">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      min-height: 100vh;
      background-color: #f8fafc;
    }

    .sidebar {
      width: 260px;
      background: #0f172a;
      color: #f8fafc;
      display: flex;
      flex-direction: column;
      position: sticky;
      top: 0;
      height: 100vh;
      border-right: 1px solid #1e293b;
      flex-shrink: 0;
    }

    .sidebar-brand {
      padding: 1.5rem 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.85rem;
      border-bottom: 1px solid #1e293b;
    }

    .brand-icon {
      width: 42px;
      height: 42px;
      background: var(--primary-gradient);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
    }

    .brand-text h2 {
      color: #ffffff;
      font-size: 1.2rem;
      line-height: 1.2;
    }

    .brand-text span {
      font-size: 0.75rem;
      color: #94a3b8;
    }

    .sidebar-nav {
      padding: 1.25rem 0.85rem;
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .nav-section-label {
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #64748b;
      padding: 0.75rem 0.6rem 0.25rem;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.7rem 0.85rem;
      color: #94a3b8;
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .nav-item i {
      font-size: 1.2rem;
    }

    .nav-item:hover {
      background-color: #1e293b;
      color: #ffffff;
    }

    .nav-item.active {
      background: var(--primary-gradient);
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
    }

    .sidebar-footer {
      padding: 1rem 0.85rem;
      border-top: 1px solid #1e293b;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .user-badge-card {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem;
      background: #1e293b;
      border-radius: var(--radius-md);
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      background: #3b82f6;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      color: #ffffff;
    }

    .user-info {
      flex: 1;
      overflow: hidden;
    }

    .user-name {
      font-size: 0.825rem;
      font-weight: 600;
      color: #f1f5f9;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-role {
      font-size: 0.65rem;
      padding: 0.1rem 0.45rem;
    }

    .btn-logout {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.6rem;
      background: transparent;
      border: 1px solid #334155;
      color: #cbd5e1;
      border-radius: var(--radius-md);
      cursor: pointer;
      font-size: 0.825rem;
      transition: all 0.2s ease;
    }

    .btn-logout:hover {
      background: #ef4444;
      border-color: #ef4444;
      color: #ffffff;
    }

    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .topbar {
      height: 64px;
      background: #ffffff;
      border-bottom: 1px solid var(--slate-200);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2rem;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .topbar-search {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      color: var(--slate-500);
      font-size: 0.875rem;
      font-weight: 500;
    }

    .system-tag {
      color: var(--slate-600);
    }

    .role-chip {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--slate-100);
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      font-size: 0.8rem;
      color: var(--slate-700);
    }

    .pulse-indicator {
      width: 8px;
      height: 8px;
      background: #10b981;
      border-radius: 50%;
      box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
    }

    .page-container {
      padding: 2rem;
      flex: 1;
    }

    @media (max-width: 900px) {
      .sidebar {
        width: 72px;
      }
      .brand-text, .nav-section-label, .nav-item span, .user-info, .btn-logout span {
        display: none;
      }
      .user-badge-card {
        justify-content: center;
      }
      .page-container {
        padding: 1.25rem;
      }
    }
  `],
})
export class LayoutComponent {
  constructor(private authService: AuthService, private router: Router) {}

  get currentUser() {
    return this.authService.currentUser;
  }

  logout(): void {
    this.authService.logout();
  }
}
