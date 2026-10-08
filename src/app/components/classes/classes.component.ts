import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClassService } from '../../services/class.service';
import { TeacherService } from '../../services/teacher.service';
import { AuthService } from '../../services/auth.service';
import { SchoolClass } from '../../models/class.model';
import { Teacher } from '../../models/teacher.model';

@Component({
  selector: 'app-classes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="classes-page">
      <div class="page-header">
        <div>
          <h1>Classes & Sections</h1>
          <p class="subtitle">Create grade sections, assign class educators, and monitor student enrollments</p>
        </div>
        <button *ngIf="isAdmin" (click)="openCreateModal()" class="btn btn-primary">
          <i class="ri-add-line"></i>
          <span>Create New Class</span>
        </button>
      </div>

      <!-- Feedback Banner -->
      <div *ngIf="feedbackMessage" class="alert" [ngClass]="isError ? 'alert-danger' : 'alert-success'">
        <i [class]="isError ? 'ri-error-warning-line' : 'ri-checkbox-circle-line'"></i>
        <span>{{ feedbackMessage }}</span>
      </div>

      <!-- Classes Grid -->
      <div *ngIf="loading" class="loading-state">
        <i class="ri-loader-4-line ri-spin"></i>
        <span>Loading academic classes...</span>
      </div>

      <div *ngIf="!loading" class="classes-grid">
        <div *ngFor="let c of classes" class="card class-card">
          <div class="class-card-top">
            <div class="class-title-block">
              <span class="badge badge-primary">{{ c.section }}</span>
              <h2>{{ c.name }}</h2>
            </div>
            <div class="room-pill">
              <i class="ri-door-open-line"></i>
              <span>{{ c.roomNumber || 'Room N/A' }}</span>
            </div>
          </div>

          <div class="class-card-body">
            <div class="teacher-assignment">
              <span class="info-label">Assigned Class Teacher:</span>
              <div class="teacher-badge" *ngIf="c.teacherId">
                <i class="ri-user-star-line"></i>
                <div>
                  <strong>{{ getTeacherName(c.teacherId) }}</strong>
                  <span class="sub-text">{{ getTeacherSubject(c.teacherId) }}</span>
                </div>
              </div>
              <div class="unassigned-badge" *ngIf="!c.teacherId">
                <i class="ri-alert-line"></i> No Teacher Assigned
              </div>
            </div>

            <div class="student-count-row">
              <div class="metric">
                <span class="metric-num">{{ c.studentCount || 0 }}</span>
                <span class="metric-lbl">Active Students</span>
              </div>
              <button (click)="viewClassStudents(c)" class="btn btn-secondary btn-sm">
                <i class="ri-team-line"></i> View Students
              </button>
            </div>
          </div>

          <div class="class-card-footer" *ngIf="isAdmin">
            <button (click)="openEditModal(c)" class="btn btn-outline btn-sm">
              <i class="ri-edit-line"></i> Edit
            </button>
            <button (click)="confirmDelete(c)" class="btn btn-outline btn-danger btn-sm">
              <i class="ri-delete-bin-line"></i> Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Create / Edit Modal -->
      <div *ngIf="showModal" class="modal-backdrop" (click)="closeModal()">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ isEditing ? 'Edit Class Details' : 'Create Academic Class' }}</h3>
            <button (click)="closeModal()" class="btn-icon btn-outline">
              <i class="ri-close-line"></i>
            </button>
          </div>

          <form (ngSubmit)="saveClass()">
            <div class="modal-body">
              <div *ngIf="modalError" class="alert alert-danger">
                <i class="ri-error-warning-line"></i>
                <span>{{ modalError }}</span>
              </div>

              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Grade / Class Name *</label>
                  <input
                    type="text"
                    [(ngModel)]="formData.name"
                    name="name"
                    required
                    class="form-control"
                    placeholder="e.g. Grade 10"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">Section *</label>
                  <input
                    type="text"
                    [(ngModel)]="formData.section"
                    name="section"
                    required
                    class="form-control"
                    placeholder="e.g. A, B, Green"
                  />
                </div>

                <div class="form-group col-span-2">
                  <label class="form-label">Assign Class Teacher</label>
                  <select [(ngModel)]="formData.teacherId" name="teacherId" class="form-select">
                    <option value="">None (Assign Later)</option>
                    <option *ngFor="let t of teachers" [value]="t._id">
                      {{ t.name }} ({{ t.subject }})
                    </option>
                  </select>
                </div>

                <div class="form-group col-span-2">
                  <label class="form-label">Classroom / Room Number</label>
                  <input
                    type="text"
                    [(ngModel)]="formData.roomNumber"
                    name="roomNumber"
                    class="form-control"
                    placeholder="e.g. Room 204, Wing B"
                  />
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" (click)="closeModal()" class="btn btn-secondary">Cancel</button>
              <button type="submit" [disabled]="saving" class="btn btn-primary">
                <span *ngIf="saving"><i class="ri-loader-4-line ri-spin"></i> Saving...</span>
                <span *ngIf="!saving">{{ isEditing ? 'Update Class' : 'Create Class' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- View Students in Class Modal -->
      <div *ngIf="showStudentsModal && selectedClassDetails" class="modal-backdrop" (click)="closeStudentsModal()">
        <div class="modal-dialog students-modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Students in {{ selectedClassDetails.name }} - Section {{ selectedClassDetails.section }}</h3>
            <button (click)="closeStudentsModal()" class="btn-icon btn-outline">
              <i class="ri-close-line"></i>
            </button>
          </div>
          <div class="modal-body p-0">
            <div class="table-container">
              <table class="modern-table">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Name</th>
                    <th>Age</th>
                    <th>Guardian</th>
                    <th>Phone</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let st of selectedClassDetails.students">
                    <td><span class="badge badge-primary">{{ st.rollNumber }}</span></td>
                    <td><strong>{{ st.name }}</strong></td>
                    <td>{{ st.age }}</td>
                    <td>{{ st.contactInfo?.parentName }}</td>
                    <td>{{ st.contactInfo?.phone }}</td>
                  </tr>
                  <tr *ngIf="!selectedClassDetails.students || selectedClassDetails.students.length === 0">
                    <td colspan="5" class="empty-state">No students are currently enrolled in this class.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="modal-footer">
            <button (click)="closeStudentsModal()" class="btn btn-secondary">Close</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .classes-page {
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

    .classes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
    }

    .class-card {
      display: flex;
      flex-direction: column;
      padding: 1.5rem;
      gap: 1.25rem;
    }

    .class-card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--slate-100);
      padding-bottom: 1rem;
    }

    .class-title-block {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .class-title-block h2 {
      font-size: 1.25rem;
      margin: 0;
    }

    .room-pill {
      font-size: 0.78rem;
      color: var(--slate-500);
      display: flex;
      align-items: center;
      gap: 0.3rem;
      background: var(--slate-100);
      padding: 0.25rem 0.6rem;
      border-radius: var(--radius-sm);
    }

    .class-card-body {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      flex: 1;
    }

    .info-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--slate-400);
      text-transform: uppercase;
      margin-bottom: 0.4rem;
      display: block;
    }

    .teacher-badge {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: var(--slate-50);
      padding: 0.65rem 0.85rem;
      border-radius: var(--radius-md);
      border: 1px solid var(--slate-200);
    }

    .teacher-badge i {
      font-size: 1.3rem;
      color: var(--primary-600);
    }

    .teacher-badge div {
      display: flex;
      flex-direction: column;
    }

    .unassigned-badge {
      font-size: 0.825rem;
      color: var(--warning-main);
      display: flex;
      align-items: center;
      gap: 0.4rem;
      background: var(--warning-bg);
      padding: 0.5rem 0.75rem;
      border-radius: var(--radius-md);
    }

    .student-count-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 0.75rem;
      border-top: 1px dashed var(--slate-200);
    }

    .metric-num {
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--slate-900);
      display: block;
      line-height: 1;
    }

    .metric-lbl {
      font-size: 0.72rem;
      color: var(--slate-500);
    }

    .class-card-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.5rem;
      border-top: 1px solid var(--slate-100);
      padding-top: 0.85rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .col-span-2 {
      grid-column: span 2;
    }

    .students-modal-dialog {
      max-width: 680px;
    }

    .p-0 {
      padding: 0 !important;
    }

    .loading-state, .empty-state {
      text-align: center;
      padding: 2.5rem !important;
      color: var(--slate-400);
    }
  `],
})
export class ClassesComponent implements OnInit {
  classes: any[] = [];
  teachers: Teacher[] = [];
  loading = false;
  saving = false;
  feedbackMessage = '';
  isError = false;

  showModal = false;
  isEditing = false;
  editingClassId = '';
  modalError = '';

  showStudentsModal = false;
  selectedClassDetails: any = null;

  formData = {
    name: '',
    section: '',
    teacherId: '',
    roomNumber: '',
  };

  constructor(
    private classService: ClassService,
    private teacherService: TeacherService,
    private authService: AuthService
  ) {}

  get isAdmin(): boolean {
    return this.authService.hasRole('Admin');
  }

  ngOnInit(): void {
    this.loadClasses();
    this.loadTeachers();
  }

  loadClasses(): void {
    this.loading = true;
    this.classService.getClasses().subscribe({
      next: (res) => {
        this.classes = res.data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.showFeedback(err.error?.message || 'Failed to fetch classes', true);
      },
    });
  }

  loadTeachers(): void {
    this.teacherService.getTeachers().subscribe({
      next: (res) => {
        this.teachers = res.data;
      },
    });
  }

  getTeacherName(teacherRef: any): string {
    if (!teacherRef) return 'Unassigned';
    if (typeof teacherRef === 'object') return teacherRef.name || 'Unassigned';
    const found = this.teachers.find((t) => t._id === teacherRef);
    return found ? found.name : 'Assigned';
  }

  getTeacherSubject(teacherRef: any): string {
    if (!teacherRef) return '';
    if (typeof teacherRef === 'object') return teacherRef.subject || '';
    const found = this.teachers.find((t) => t._id === teacherRef);
    return found ? found.subject : '';
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.editingClassId = '';
    this.modalError = '';
    this.formData = {
      name: '',
      section: '',
      teacherId: '',
      roomNumber: '',
    };
    this.showModal = true;
  }

  openEditModal(c: SchoolClass): void {
    this.isEditing = true;
    this.editingClassId = c._id;
    this.modalError = '';
    this.formData = {
      name: c.name,
      section: c.section,
      teacherId: typeof c.teacherId === 'object' ? (c.teacherId as any)?._id : c.teacherId || '',
      roomNumber: c.roomNumber || '',
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveClass(): void {
    this.saving = true;
    this.modalError = '';

    const payload = {
      ...this.formData,
      teacherId: this.formData.teacherId ? this.formData.teacherId : undefined,
    };

    if (this.isEditing) {
      this.classService.updateClass(this.editingClassId, payload).subscribe({
        next: () => {
          this.saving = false;
          this.closeModal();
          this.showFeedback('Class updated successfully!');
          this.loadClasses();
        },
        error: (err) => {
          this.saving = false;
          this.modalError = err.error?.message || 'Failed to update class';
        },
      });
    } else {
      this.classService.createClass(payload).subscribe({
        next: () => {
          this.saving = false;
          this.closeModal();
          this.showFeedback('Class created successfully!');
          this.loadClasses();
        },
        error: (err) => {
          this.saving = false;
          this.modalError = err.error?.message || 'Failed to create class';
        },
      });
    }
  }

  viewClassStudents(c: SchoolClass): void {
    this.classService.getClassById(c._id).subscribe({
      next: (res) => {
        this.selectedClassDetails = res.data;
        this.showStudentsModal = true;
      },
      error: (err) => {
        this.showFeedback(err.error?.message || 'Failed to load class students', true);
      },
    });
  }

  closeStudentsModal(): void {
    this.showStudentsModal = false;
    this.selectedClassDetails = null;
  }

  confirmDelete(c: SchoolClass): void {
    if (confirm(`Are you sure you want to delete '${c.name} - ${c.section}'?`)) {
      this.classService.deleteClass(c._id).subscribe({
        next: () => {
          this.showFeedback(`Class '${c.name} - ${c.section}' deleted successfully.`);
          this.loadClasses();
        },
        error: (err) => {
          this.showFeedback(err.error?.message || 'Failed to delete class', true);
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
