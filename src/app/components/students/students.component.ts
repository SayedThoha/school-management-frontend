import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../services/student.service';
import { ClassService } from '../../services/class.service';
import { AuthService } from '../../services/auth.service';
import { Student } from '../../models/student.model';
import { SchoolClass } from '../../models/class.model';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="students-page">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1>Student Directory</h1>
          <p class="subtitle">Manage enrolled students, assign classes, and view student profiles</p>
        </div>
        <button (click)="openCreateModal()" class="btn btn-primary">
          <i class="ri-user-add-line"></i>
          <span>Enroll New Student</span>
        </button>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="card toolbar-card">
        <div class="toolbar-body">
          <div class="search-box">
            <i class="ri-search-line"></i>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (input)="onSearchChange()"
              placeholder="Search by student name or roll number..."
              class="form-control"
            />
          </div>

          <div class="filter-box">
            <label class="filter-label"><i class="ri-filter-3-line"></i> Filter Class:</label>
            <select [(ngModel)]="selectedClassFilter" (change)="onClassFilterChange()" class="form-select filter-select">
              <option value="">All Classes</option>
              <option *ngFor="let cls of classes" [value]="cls._id">
                {{ cls.name }} - {{ cls.section }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Notification Alerts -->
      <div *ngIf="feedbackMessage" class="alert" [ngClass]="isError ? 'alert-danger' : 'alert-success'">
        <i [class]="isError ? 'ri-error-warning-line' : 'ri-checkbox-circle-line'"></i>
        <span>{{ feedbackMessage }}</span>
      </div>

      <!-- Students Table Card -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            <i class="ri-user-smile-line"></i> Enrolled Students ({{ students.length }})
          </h3>
          <button (click)="loadStudents()" class="btn btn-outline btn-sm" title="Refresh">
            <i class="ri-refresh-line"></i> Refresh
          </button>
        </div>

        <div class="card-body p-0">
          <div *ngIf="loading" class="loading-state">
            <i class="ri-loader-4-line ri-spin"></i>
            <span>Loading students...</span>
          </div>

          <div *ngIf="!loading" class="table-container">
            <table class="modern-table">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th>Class & Section</th>
                  <th>Age / Gender</th>
                  <th>Guardian & Contact</th>
                  <th class="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let s of students">
                  <td>
                    <span class="badge badge-primary font-mono">{{ s.rollNumber }}</span>
                  </td>
                  <td>
                    <div class="student-name-cell">
                      <strong>{{ s.name }}</strong>
                      <span *ngIf="s.contactInfo?.email" class="sub-text">{{ s.contactInfo.email }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="badge badge-info">
                      {{ getClassName(s.classId) }}
                    </span>
                  </td>
                  <td>
                    <span>{{ s.age }} yrs</span>
                    <span class="sub-text ml-1">({{ s.gender || 'Not specified' }})</span>
                  </td>
                  <td>
                    <div class="contact-cell">
                      <span><strong>{{ s.contactInfo.parentName }}</strong> (Guardian)</span>
                      <span class="sub-text"><i class="ri-phone-line"></i> {{ s.contactInfo.phone }}</span>
                    </div>
                  </td>
                  <td class="text-right actions-cell">
                    <button (click)="openViewModal(s)" class="btn btn-icon btn-secondary" title="View Profile">
                      <i class="ri-eye-line"></i>
                    </button>
                    <button (click)="openEditModal(s)" class="btn btn-icon btn-secondary" title="Edit Student">
                      <i class="ri-edit-line"></i>
                    </button>
                    <button
                      *ngIf="isAdmin"
                      (click)="confirmDelete(s)"
                      class="btn btn-icon btn-danger"
                      title="Delete Student"
                    >
                      <i class="ri-delete-bin-line"></i>
                    </button>
                  </td>
                </tr>
                <tr *ngIf="students.length === 0">
                  <td colspan="6" class="empty-state">
                    No students matched the criteria. Click "Enroll New Student" to add records.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Add/Edit Student Modal -->
      <div *ngIf="showModal" class="modal-backdrop" (click)="closeModal()">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ isEditing ? 'Edit Student Profile' : 'Enroll New Student' }}</h3>
            <button (click)="closeModal()" class="btn-icon btn-outline">
              <i class="ri-close-line"></i>
            </button>
          </div>

          <form (ngSubmit)="saveStudent()">
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
                    placeholder="e.g. John Doe"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">Assign Class *</label>
                  <select [(ngModel)]="formData.classId" name="classId" required class="form-select">
                    <option value="" disabled>Select class...</option>
                    <option *ngFor="let cls of classes" [value]="cls._id">
                      {{ cls.name }} - {{ cls.section }}
                    </option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Roll Number *</label>
                  <input
                    type="text"
                    [(ngModel)]="formData.rollNumber"
                    name="rollNumber"
                    required
                    class="form-control"
                    placeholder="e.g. 10A-05"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">Age *</label>
                  <input
                    type="number"
                    [(ngModel)]="formData.age"
                    name="age"
                    required
                    min="3"
                    max="30"
                    class="form-control"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">Gender</label>
                  <select [(ngModel)]="formData.gender" name="gender" class="form-select">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div class="form-group col-span-2">
                  <label class="form-label">Parent / Guardian Name *</label>
                  <input
                    type="text"
                    [(ngModel)]="formData.contactInfo.parentName"
                    name="parentName"
                    required
                    class="form-control"
                    placeholder="e.g. Robert Doe"
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

                <div class="form-group">
                  <label class="form-label">Student / Parent Email</label>
                  <input
                    type="email"
                    [(ngModel)]="formData.contactInfo.email"
                    name="email"
                    class="form-control"
                    placeholder="contact@family.com"
                  />
                </div>

                <div class="form-group col-span-2">
                  <label class="form-label">Residential Address</label>
                  <textarea
                    [(ngModel)]="formData.contactInfo.address"
                    name="address"
                    rows="2"
                    class="form-control"
                    placeholder="Street, City, State..."
                  ></textarea>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" (click)="closeModal()" class="btn btn-secondary">Cancel</button>
              <button type="submit" [disabled]="saving" class="btn btn-primary">
                <span *ngIf="saving"><i class="ri-loader-4-line ri-spin"></i> Saving...</span>
                <span *ngIf="!saving">{{ isEditing ? 'Update Profile' : 'Enroll Student' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- View Details Modal -->
      <div *ngIf="showViewModal && selectedStudent" class="modal-backdrop" (click)="closeViewModal()">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Student Profile: {{ selectedStudent.name }}</h3>
            <button (click)="closeViewModal()" class="btn-icon btn-outline">
              <i class="ri-close-line"></i>
            </button>
          </div>
          <div class="modal-body profile-body">
            <div class="profile-header-badge">
              <div class="profile-avatar">{{ selectedStudent.name[0] }}</div>
              <div>
                <h2>{{ selectedStudent.name }}</h2>
                <div class="d-flex gap-2 mt-1">
                  <span class="badge badge-primary">Roll: {{ selectedStudent.rollNumber }}</span>
                  <span class="badge badge-info">{{ getClassName(selectedStudent.classId) }}</span>
                </div>
              </div>
            </div>

            <div class="profile-details-grid">
              <div class="detail-row">
                <span class="detail-label">Age & Gender:</span>
                <span>{{ selectedStudent.age }} years old ({{ selectedStudent.gender || 'Not specified' }})</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Parent / Guardian:</span>
                <strong>{{ selectedStudent.contactInfo?.parentName }}</strong>
              </div>
              <div class="detail-row">
                <span class="detail-label">Primary Phone:</span>
                <span>{{ selectedStudent.contactInfo?.phone }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Contact Email:</span>
                <span>{{ selectedStudent.contactInfo?.email || 'N/A' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Address:</span>
                <span>{{ selectedStudent.contactInfo?.address || 'N/A' }}</span>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button (click)="closeViewModal()" class="btn btn-secondary">Close</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .students-page {
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
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .search-box {
      position: relative;
      flex: 1;
      min-width: 260px;
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

    .filter-box {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .filter-label {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--slate-600);
      white-space: nowrap;
    }

    .filter-select {
      min-width: 170px;
    }

    .student-name-cell, .contact-cell {
      display: flex;
      flex-direction: column;
    }

    .sub-text {
      font-size: 0.75rem;
      color: var(--slate-400);
    }

    .font-mono {
      font-family: monospace;
      letter-spacing: 0.05em;
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

    .profile-header-badge {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding-bottom: 1.25rem;
      border-bottom: 1px solid var(--slate-200);
      margin-bottom: 1.25rem;
    }

    .profile-avatar {
      width: 58px;
      height: 58px;
      background: var(--primary-gradient);
      color: #ffffff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.75rem;
      font-weight: 700;
    }

    .profile-details-grid {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px solid var(--slate-100);
      font-size: 0.875rem;
    }

    .detail-label {
      color: var(--slate-500);
      font-weight: 500;
    }

    .loading-state, .empty-state {
      text-align: center;
      padding: 2.5rem !important;
      color: var(--slate-400);
    }
  `],
})
export class StudentsComponent implements OnInit {
  students: Student[] = [];
  classes: SchoolClass[] = [];
  loading = false;
  saving = false;
  feedbackMessage = '';
  isError = false;

  searchQuery = '';
  selectedClassFilter = '';

  // Modals state
  showModal = false;
  isEditing = false;
  editingStudentId = '';
  modalError = '';

  showViewModal = false;
  selectedStudent: Student | null = null;

  formData = {
    name: '',
    classId: '',
    rollNumber: '',
    age: 15,
    gender: 'Male',
    contactInfo: {
      phone: '',
      email: '',
      parentName: '',
      address: '',
    },
  };

  constructor(
    private studentService: StudentService,
    private classService: ClassService,
    private authService: AuthService
  ) {}

  get isAdmin(): boolean {
    return this.authService.hasRole('Admin');
  }

  ngOnInit(): void {
    this.loadClasses();
    this.loadStudents();
  }

  loadClasses(): void {
    this.classService.getClasses().subscribe({
      next: (res) => {
        this.classes = res.data;
      },
    });
  }

  loadStudents(): void {
    this.loading = true;
    this.studentService.getStudents(this.selectedClassFilter, this.searchQuery).subscribe({
      next: (res) => {
        this.students = res.data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.showFeedback(err.error?.message || 'Failed to fetch students', true);
      },
    });
  }

  onSearchChange(): void {
    this.loadStudents();
  }

  onClassFilterChange(): void {
    this.loadStudents();
  }

  getClassName(classRef: any): string {
    if (!classRef) return 'Unassigned';
    if (typeof classRef === 'object') {
      return `${classRef.name} - ${classRef.section}`;
    }
    const found = this.classes.find((c) => c._id === classRef);
    return found ? `${found.name} - ${found.section}` : classRef;
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.editingStudentId = '';
    this.modalError = '';
    this.formData = {
      name: '',
      classId: this.classes[0]?._id || '',
      rollNumber: '',
      age: 15,
      gender: 'Male',
      contactInfo: {
        phone: '',
        email: '',
        parentName: '',
        address: '',
      },
    };
    this.showModal = true;
  }

  openEditModal(s: Student): void {
    this.isEditing = true;
    this.editingStudentId = s._id;
    this.modalError = '';
    this.formData = {
      name: s.name,
      classId: typeof s.classId === 'object' ? (s.classId as any)._id : s.classId,
      rollNumber: s.rollNumber,
      age: s.age,
      gender: s.gender || 'Male',
      contactInfo: {
        phone: s.contactInfo?.phone || '',
        email: s.contactInfo?.email || '',
        parentName: s.contactInfo?.parentName || '',
        address: s.contactInfo?.address || '',
      },
    };
    this.showModal = true;
  }

  openViewModal(s: Student): void {
    this.selectedStudent = s;
    this.showViewModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedStudent = null;
  }

  saveStudent(): void {
    this.saving = true;
    this.modalError = '';

    if (this.isEditing) {
      this.studentService.updateStudent(this.editingStudentId, this.formData).subscribe({
        next: () => {
          this.saving = false;
          this.closeModal();
          this.showFeedback('Student profile updated successfully!');
          this.loadStudents();
        },
        error: (err) => {
          this.saving = false;
          this.modalError = err.error?.message || 'Failed to update student profile';
        },
      });
    } else {
      this.studentService.createStudent(this.formData).subscribe({
        next: () => {
          this.saving = false;
          this.closeModal();
          this.showFeedback('New student enrolled successfully!');
          this.loadStudents();
        },
        error: (err) => {
          this.saving = false;
          this.modalError = err.error?.message || 'Failed to enroll student';
        },
      });
    }
  }

  confirmDelete(s: Student): void {
    if (confirm(`Are you sure you want to remove student '${s.name}' (${s.rollNumber})?`)) {
      this.studentService.deleteStudent(s._id).subscribe({
        next: () => {
          this.showFeedback(`Student '${s.name}' removed successfully.`);
          this.loadStudents();
        },
        error: (err) => {
          this.showFeedback(err.error?.message || 'Failed to delete student', true);
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
