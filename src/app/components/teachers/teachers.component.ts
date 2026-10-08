import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TeacherService } from '../../services/teacher.service';
import { AuthService } from '../../services/auth.service';
import { Teacher } from '../../models/teacher.model';

@Component({
  selector: 'app-teachers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="teachers-page">
      <div class="page-header">
        <div>
          <h1>Faculty & Teachers</h1>
          <p class="subtitle">Manage teacher profiles, qualifications, and teaching specializations</p>
        </div>
        <button *ngIf="isAdmin" (click)="openCreateModal()" class="btn btn-primary">
          <i class="ri-user-add-line"></i>
          <span>Add New Teacher</span>
        </button>
      </div>

      <!-- Toolbar -->
      <div class="card toolbar-card">
        <div class="toolbar-body">
          <div class="search-box">
            <i class="ri-search-line"></i>
            <input
              type="text"
              [(ngModel)]="subjectFilter"
              (input)="onSubjectFilterChange()"
              placeholder="Search or filter by subject (e.g. Mathematics, Physics)..."
              class="form-control"
            />
          </div>
        </div>
      </div>

      <!-- Feedback Banner -->
      <div *ngIf="feedbackMessage" class="alert" [ngClass]="isError ? 'alert-danger' : 'alert-success'">
        <i [class]="isError ? 'ri-error-warning-line' : 'ri-checkbox-circle-line'"></i>
        <span>{{ feedbackMessage }}</span>
      </div>

      <!-- Teachers Table -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            <i class="ri-user-star-line"></i> Faculty Directory ({{ teachers.length }})
          </h3>
          <button (click)="loadTeachers()" class="btn btn-outline btn-sm">
            <i class="ri-refresh-line"></i> Refresh
          </button>
        </div>

        <div class="card-body p-0">
          <div *ngIf="loading" class="loading-state">
            <i class="ri-loader-4-line ri-spin"></i>
            <span>Loading teachers...</span>
          </div>

          <div *ngIf="!loading" class="table-container">
            <table class="modern-table">
              <thead>
                <tr>
                  <th>Teacher Name</th>
                  <th>Primary Subject</th>
                  <th>Experience</th>
                  <th>Contact Email</th>
                  <th>Contact Phone</th>
                  <th class="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let t of teachers">
                  <td>
                    <div class="teacher-name-cell">
                      <strong>{{ t.name }}</strong>
                      <span class="sub-text">{{ t.qualification || 'Educator' }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="badge badge-primary">{{ t.subject }}</span>
                  </td>
                  <td>
                    <span><strong>{{ t.experience }}</strong> years</span>
                  </td>
                  <td>{{ t.contactInfo?.email }}</td>
                  <td>{{ t.contactInfo?.phone }}</td>
                  <td class="text-right actions-cell">
                    <button *ngIf="isAdmin" (click)="openEditModal(t)" class="btn btn-icon btn-secondary" title="Edit Teacher">
                      <i class="ri-edit-line"></i>
                    </button>
                    <button *ngIf="isAdmin" (click)="confirmDelete(t)" class="btn btn-icon btn-danger" title="Delete Teacher">
                      <i class="ri-delete-bin-line"></i>
                    </button>
                  </td>
                </tr>
                <tr *ngIf="teachers.length === 0">
                  <td colspan="6" class="empty-state">No teachers found. Click "Add New Teacher" to register faculty.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Add/Edit Modal -->
      <div *ngIf="showModal" class="modal-backdrop" (click)="closeModal()">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ isEditing ? 'Edit Teacher Profile' : 'Register New Teacher' }}</h3>
            <button (click)="closeModal()" class="btn-icon btn-outline">
              <i class="ri-close-line"></i>
            </button>
          </div>

          <form (ngSubmit)="saveTeacher()">
            <div class="modal-body">
              <div *ngIf="modalError" class="alert alert-danger">
                <i class="ri-error-warning-line"></i>
                <span>{{ modalError }}</span>
              </div>

              <div class="form-grid">
                <div class="form-group col-span-2">
                  <label class="form-label">Full Name *</label>
                  <input
                    type="text"
                    [(ngModel)]="formData.name"
                    name="name"
                    required
                    class="form-control"
                    placeholder="e.g. Dr. Robert Vance"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">Specialized Subject *</label>
                  <input
                    type="text"
                    [(ngModel)]="formData.subject"
                    name="subject"
                    required
                    class="form-control"
                    placeholder="e.g. Mathematics, Physics"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">Experience (Years) *</label>
                  <input
                    type="number"
                    [(ngModel)]="formData.experience"
                    name="experience"
                    required
                    min="0"
                    class="form-control"
                  />
                </div>

                <div class="form-group col-span-2">
                  <label class="form-label">Academic Qualification</label>
                  <input
                    type="text"
                    [(ngModel)]="formData.qualification"
                    name="qualification"
                    class="form-control"
                    placeholder="e.g. M.Sc. Mathematics, B.Ed."
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">Email Address *</label>
                  <input
                    type="email"
                    [(ngModel)]="formData.contactInfo.email"
                    name="email"
                    required
                    class="form-control"
                    placeholder="teacher@school.com"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">Contact Phone *</label>
                  <input
                    type="text"
                    [(ngModel)]="formData.contactInfo.phone"
                    name="phone"
                    required
                    class="form-control"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div class="form-group col-span-2">
                  <label class="form-label">Address</label>
                  <textarea
                    [(ngModel)]="formData.contactInfo.address"
                    name="address"
                    rows="2"
                    class="form-control"
                    placeholder="Residential address..."
                  ></textarea>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" (click)="closeModal()" class="btn btn-secondary">Cancel</button>
              <button type="submit" [disabled]="saving" class="btn btn-primary">
                <span *ngIf="saving"><i class="ri-loader-4-line ri-spin"></i> Saving...</span>
                <span *ngIf="!saving">{{ isEditing ? 'Update Teacher' : 'Register Teacher' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .teachers-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
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

    .toolbar-card .toolbar-body {
      padding: 1rem 1.25rem;
    }

    .search-box {
      position: relative;
      max-width: 480px;
    }

    .search-box i {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--slate-400);
    }

    .search-box input {
      padding-left: 2.5rem;
    }

    .teacher-name-cell {
      display: flex;
      flex-direction: column;
    }

    .sub-text {
      font-size: 0.75rem;
      color: var(--slate-400);
    }

    .text-right {
      text-align: right;
    }

    .actions-cell {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.4rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .col-span-2 {
      grid-column: span 2;
    }

    .loading-state, .empty-state {
      text-align: center;
      padding: 2.5rem !important;
      color: var(--slate-400);
    }
  `],
})
export class TeachersComponent implements OnInit {
  teachers: Teacher[] = [];
  loading = false;
  saving = false;
  subjectFilter = '';
  feedbackMessage = '';
  isError = false;

  showModal = false;
  isEditing = false;
  editingTeacherId = '';
  modalError = '';

  formData = {
    name: '',
    subject: '',
    experience: 5,
    qualification: '',
    contactInfo: {
      phone: '',
      email: '',
      address: '',
    },
  };

  constructor(private teacherService: TeacherService, private authService: AuthService) {}

  get isAdmin(): boolean {
    return this.authService.hasRole('Admin');
  }

  ngOnInit(): void {
    this.loadTeachers();
  }

  loadTeachers(): void {
    this.loading = true;
    this.teacherService.getTeachers(this.subjectFilter).subscribe({
      next: (res) => {
        this.teachers = res.data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.showFeedback(err.error?.message || 'Failed to fetch teachers', true);
      },
    });
  }

  onSubjectFilterChange(): void {
    this.loadTeachers();
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.editingTeacherId = '';
    this.modalError = '';
    this.formData = {
      name: '',
      subject: '',
      experience: 5,
      qualification: '',
      contactInfo: {
        phone: '',
        email: '',
        address: '',
      },
    };
    this.showModal = true;
  }

  openEditModal(t: Teacher): void {
    this.isEditing = true;
    this.editingTeacherId = t._id;
    this.modalError = '';
    this.formData = {
      name: t.name,
      subject: t.subject,
      experience: t.experience,
      qualification: t.qualification || '',
      contactInfo: {
        phone: t.contactInfo?.phone || '',
        email: t.contactInfo?.email || '',
        address: t.contactInfo?.address || '',
      },
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveTeacher(): void {
    this.saving = true;
    this.modalError = '';

    if (this.isEditing) {
      this.teacherService.updateTeacher(this.editingTeacherId, this.formData).subscribe({
        next: () => {
          this.saving = false;
          this.closeModal();
          this.showFeedback('Teacher profile updated successfully!');
          this.loadTeachers();
        },
        error: (err) => {
          this.saving = false;
          this.modalError = err.error?.message || 'Failed to update teacher';
        },
      });
    } else {
      this.teacherService.createTeacher(this.formData).subscribe({
        next: () => {
          this.saving = false;
          this.closeModal();
          this.showFeedback('New teacher registered successfully!');
          this.loadTeachers();
        },
        error: (err) => {
          this.saving = false;
          this.modalError = err.error?.message || 'Failed to register teacher';
        },
      });
    }
  }

  confirmDelete(t: Teacher): void {
    if (confirm(`Are you sure you want to delete teacher '${t.name}'?`)) {
      this.teacherService.deleteTeacher(t._id).subscribe({
        next: () => {
          this.showFeedback(`Teacher '${t.name}' removed successfully.`);
          this.loadTeachers();
        },
        error: (err) => {
          this.showFeedback(err.error?.message || 'Failed to delete teacher', true);
        },
      });
    }
  }

  showFeedback(msg: string, isErr = false): void {
    this.feedbackMessage = msg;
    this.isError = isErr;
    setTimeout(() => {
      this.feedbackMessage = '';
    }, 4000);
  }
}
