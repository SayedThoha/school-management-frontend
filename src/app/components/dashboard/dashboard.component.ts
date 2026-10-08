import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService, DashboardData } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-page">
      <!-- Welcome Header -->
      <div class="page-header">
        <div>
          <h1>Welcome Back, {{ currentUser?.name }} 👋</h1>
          <p class="subtitle">Here is what is happening across the academy today.</p>
        </div>
        <div class="header-actions">
          <a routerLink="/attendance" class="btn btn-primary">
            <i class="ri-checkbox-circle-line"></i>
            <span>Mark Today's Attendance</span>
          </a>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-state">
        <i class="ri-loader-4-line ri-spin"></i>
        <span>Loading academy metrics...</span>
      </div>

      <!-- Main Dashboard Grid -->
      <div *ngIf="!loading && data" class="dashboard-content">
        <!-- KPI Cards Grid -->
        <div class="stats-grid">
          <div class="stat-card stat-indigo">
            <div class="stat-icon">
              <i class="ri-user-smile-line"></i>
            </div>
            <div class="stat-info">
              <span class="stat-label">Total Enrolled Students</span>
              <h2 class="stat-value">{{ data.overview.totalStudents }}</h2>
            </div>
          </div>

          <div class="stat-card stat-emerald">
            <div class="stat-icon">
              <i class="ri-user-star-line"></i>
            </div>
            <div class="stat-info">
              <span class="stat-label">Faculty & Teachers</span>
              <h2 class="stat-value">{{ data.overview.totalTeachers }}</h2>
            </div>
          </div>

          <div class="stat-card stat-violet">
            <div class="stat-icon">
              <i class="ri-building-4-line"></i>
            </div>
            <div class="stat-info">
              <span class="stat-label">Active Classes</span>
              <h2 class="stat-value">{{ data.overview.totalClasses }}</h2>
            </div>
          </div>

          <div class="stat-card stat-amber">
            <div class="stat-icon">
              <i class="ri-book-3-line"></i>
            </div>
            <div class="stat-info">
              <span class="stat-label">Curriculum Subjects</span>
              <h2 class="stat-value">{{ data.overview.totalSubjects }}</h2>
            </div>
          </div>
        </div>

        <!-- Quick Actions Row -->
        <div class="quick-actions-bar card">
          <div class="card-body action-items">
            <div class="action-title">
              <i class="ri-flashlight-line"></i>
              <span>Quick Workflows:</span>
            </div>
            <a routerLink="/students" class="quick-action-link">
              <i class="ri-user-add-line"></i>
              <span>Add Student</span>
            </a>
            <a routerLink="/teachers" class="quick-action-link">
              <i class="ri-user-shared-line"></i>
              <span>View Teachers</span>
            </a>
            <a routerLink="/classes" class="quick-action-link">
              <i class="ri-community-line"></i>
              <span>Manage Classes</span>
            </a>
            <a routerLink="/attendance" class="quick-action-link">
              <i class="ri-calendar-check-line"></i>
              <span>Take Attendance</span>
            </a>
          </div>
        </div>

        <!-- 2 Column Section: Recent Attendance & Recent Students -->
        <div class="two-column-grid">
          <!-- Recent Attendance Card -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">
                <i class="ri-history-line"></i> Recent Class Attendance
              </h3>
              <a routerLink="/attendance" class="btn btn-outline btn-sm">View All</a>
            </div>
            <div class="card-body p-0">
              <div class="table-container">
                <table class="modern-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Class</th>
                      <th>Total Marked</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let att of data.recentAttendance">
                      <td><strong>{{ att.date }}</strong></td>
                      <td>
                        <span class="badge badge-info">
                          {{ att.classId?.name }} - {{ att.classId?.section }}
                        </span>
                      </td>
                      <td>{{ att.records?.length || 0 }} Students</td>
                      <td>
                        <a routerLink="/attendance" class="btn btn-secondary btn-sm">
                          Details
                        </a>
                      </td>
                    </tr>
                    <tr *ngIf="!data.recentAttendance || data.recentAttendance.length === 0">
                      <td colspan="4" class="empty-state">No attendance logs available yet.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Recently Enrolled Students Card -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">
                <i class="ri-user-follow-line"></i> Recent Student Enrollments
              </h3>
              <a routerLink="/students" class="btn btn-outline btn-sm">View All</a>
            </div>
            <div class="card-body p-0">
              <div class="table-container">
                <table class="modern-table">
                  <thead>
                    <tr>
                      <th>Roll No</th>
                      <th>Student Name</th>
                      <th>Class</th>
                      <th>Guardian Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let st of data.recentStudents">
                      <td><span class="badge badge-primary">{{ st.rollNumber }}</span></td>
                      <td><strong>{{ st.name }}</strong></td>
                      <td>{{ st.classId?.name }} - {{ st.classId?.section }}</td>
                      <td>{{ st.contactInfo?.phone }}</td>
                    </tr>
                    <tr *ngIf="!data.recentStudents || data.recentStudents.length === 0">
                      <td colspan="4" class="empty-state">No student records found.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page {
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
    }

    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .page-header h1 {
      font-size: 1.75rem;
      margin-bottom: 0.2rem;
    }

    .subtitle {
      color: var(--slate-500);
      font-size: 0.9rem;
    }

    .loading-state {
      padding: 3rem;
      text-align: center;
      font-size: 1.1rem;
      color: var(--slate-500);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
    }

    .dashboard-content {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.25rem;
    }

    .stat-card {
      background: #ffffff;
      padding: 1.5rem;
      border-radius: var(--radius-lg);
      border: 1px solid var(--slate-200);
      display: flex;
      align-items: center;
      gap: 1.25rem;
      box-shadow: var(--shadow-sm);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-3px);
      box-shadow: var(--shadow-md);
    }

    .stat-icon {
      width: 52px;
      height: 52px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.6rem;
      flex-shrink: 0;
    }

    .stat-indigo .stat-icon { background: #eef2ff; color: #4f46e5; }
    .stat-emerald .stat-icon { background: #ecfdf5; color: #10b981; }
    .stat-violet .stat-icon { background: #f5f3ff; color: #8b5cf6; }
    .stat-amber .stat-icon { background: #fffbeb; color: #f59e0b; }

    .stat-label {
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--slate-500);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .stat-value {
      font-size: 1.85rem;
      color: var(--slate-900);
      line-height: 1.1;
      margin-top: 0.2rem;
    }

    .quick-actions-bar .card-body {
      padding: 1rem 1.5rem;
    }

    .action-items {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .action-title {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-weight: 600;
      font-size: 0.85rem;
      color: var(--slate-700);
    }

    .quick-action-link {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.4rem 0.85rem;
      background: var(--slate-100);
      border-radius: var(--radius-md);
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--slate-700);
      transition: all 0.2s;
    }

    .quick-action-link:hover {
      background: var(--primary-50);
      color: var(--primary-700);
    }

    .two-column-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
      gap: 1.5rem;
    }

    .p-0 {
      padding: 0 !important;
    }

    .empty-state {
      text-align: center;
      padding: 2rem !important;
      color: var(--slate-400);
      font-style: italic;
    }
  `],
})
export class DashboardComponent implements OnInit {
  data: DashboardData | null = null;
  loading = true;

  constructor(private dashboardService: DashboardService, private authService: AuthService) {}

  get currentUser() {
    return this.authService.currentUser;
  }

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.dashboardService.getStats().subscribe({
      next: (res) => {
        this.data = res.data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}
