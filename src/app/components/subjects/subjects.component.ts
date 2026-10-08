import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubjectService } from '../../services/subject.service';
import { TeacherService } from '../../services/teacher.service';
import { ClassService } from '../../services/class.service';
import { AuthService } from '../../services/auth.service';
import { Subject } from '../../models/subject.model';
import { Teacher } from '../../models/teacher.model';
import { SchoolClass } from '../../models/class.model';

@Component({
  selector: 'app-subjects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="subjects-page">
      <div class="page-header">
        <div>
          <h1>Curriculum & Subjects</h1>
          <p class="subtitle">Define academic disciplines, assign specialized faculty, and map to classes</p>
        </div>
        <button *ngIf="isAdmin" (click)="openCreateModal()" class="btn btn-primary">
          <i class="ri-book-open-line"></i>
          <span>Add New Subject</span>
        </button>
      </div>

      <!-- Filters Toolbar -->
      <div class="card toolbar-card">
        <div class="toolbar-body">
          <div class="filters-row">
            <div class="filter-item">
              <label class="filter-label"><i class="ri-building-line"></i> Class:</label>
              <select [(ngModel)]="selectedClassFilter" (change)="loadSubjects()" class="form-select filter-select">
                <option value="">All Classes</option>
                <option *ngFor="let cls of classes" [value]="cls._id">
                  {{ cls.name }} - {{ cls.section }}
                </option>
              </select>
            </div>

            <div class="filter-item">
              <label class="filter-label"><i class="ri-user-star-line"></i> Teacher:</label>
              <select [(ngModel)]="selectedTeacherFilter" (change)="loadSubjects()" class="form-select filter-select">
                <option value="">All Teachers</option>
                <option *ngFor="let t of teachers" [value]="t._id">
                  {{ t.name }} ({{ t.subject }})
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Feedback Banner -->
      <div *ngIf="feedbackMessage" class="alert" [ngClass]="isError ? 'alert-danger' : 'alert-success'">
        <i [class]="isError ? 'ri-error-warning-line' : 'ri-checkbox-circle-line'"></i>
        <span>{{ feedbackMessage }}</span>
      </div>

      <!-- Subjects Table -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            <i class="ri-book-3-line"></i> Subject Catalog ({{ subjects.length }})
          </h3>
          <button (click)="loadSubjects()" class="btn btn-outline btn-sm">
            <i class="ri-refresh-line"></i> Refresh
          </button>
        </div>

        <div class="card-body p-0">
          <div *ngIf="loading" class="loading-state">
            <i class="ri-loader-4-line ri-spin"></i>
            <span>Loading subjects...</span>
          </div>

          <div *ngIf="!loading" class="table-container">
            <table class="modern-table">
              <thead>
                <tr>
                  <th>Subject Code</th>
                  <th>Subject Title</th>
                  <th>Assigned Faculty</th>
                  <th>Mapped Class</th>
                  <th>Description</th>
                  <th class="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let s of subjects">
                  <td>
                    <span class="badge badge-primary font-mono">{{ s.code }}</span>
                  </td>
                  <td>
                    <strong>{{ s.name }}</strong>
                  </td>
                  <td>
                    <div *ngIf="s.teacherId" class="d-flex align-items-center gap-1">
                      <i class="ri-user-follow-line text-indigo"></i>
                      <span>{{ getTeacherName(s.teacherId) }}</span>
                    </div>
                    <span *ngIf="!s.teacherId" class="text-muted">Unassigned</span>
                  </td>
                  <td>
                    <span *ngIf="s.classId" class="badge badge-info">
                      {{ getClassName(s.classId) }}
                    </span>
                    <span *ngIf="!s.classId" class="text-muted">All Classes</span>
                  </td>
                  <td>
                    <span class="desc-text">{{ s.description || 'No description provided' }}</span>
                  </td>
                  <td class="text-right actions-cell">
                    <button *ngIf="isAdmin" (click)="openEditModal(s)" class="btn btn-icon btn-secondary" title="Edit Subject">
                      <i class="ri-edit-line"></i>
                    </button>
                    <button *ngIf="isAdmin" (click)="confirmDelete(s)" class="btn btn-icon btn-danger" title="Delete Subject">
                      <i class="ri-delete-bin-line"></i>
                    </button>
                  </td>
                </tr>
                <tr *ngIf="subjects.length === 0">
                  <td colspan="6" class="empty-state">No subjects found. Click "Add New Subject" to create one.</td>
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
            <h3>{{ isEditing ? 'Edit Subject' : 'Add New Subject' }}</h3>
            <button (click)="closeModal()" class="btn-icon btn-outline">
              <i class="ri-close-line"></i>
            </button>
          </div>

          <form (ngSubmit)="saveSubject()">
            <div class="modal-body">
              <div *ngIf="modalError" class="alert alert-danger">
                <i class="ri-error-warning-line"></i>
                <span>{{ modalError }}</span>
              </div>

              <div class="form-grid">
                <div class="form-group col-span-2">
                  <label class="form-label">Subject Name *</label>
                  <input
                    type="text"
                    [(ngModel)]="formData.name"
                    name="name"
                    required
                    class="form-control"
                    placeholder="e.g. Advanced Mathematics"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">Subject Code *</label>
                  <input
                    type="text"
                    [(ngModel)]="formData.code"
                    name="code"
                    required
                    class="form-control"
                    placeholder="e.g. MATH-101"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">Assign Faculty Teacher</label>
                  <select [(ngModel)]="formData.teacherId" name="teacherId" class="form-select">
                    <option value="">Unassigned</option>
                    <option *ngFor="let t of teachers" [value]="t._id">
                      {{ t.name }} ({{ t.subject }})
                    </option>
                  </select>
                </div>

                <div class="form-group col-span-2">
                  <label class="form-label">Map to Academic Class</label>
                  <select [(ngModel)]="formData.classId" name="classId" class="form-select">
                    <option value="">None / General</option>
                    <option *ngFor="let cls of classes" [value]="cls._id">
                      {{ cls.name }} - {{ cls.section }}
                    </option>
                  </select>
                </div>

                <div class="form-group col-span-2">
                  <label class="form-label">Syllabus / Course Description</label>
                  <textarea
                    [(ngModel)]="formData.description"
                    name="description"
                    rows="3"
                    class="form-control"
                    placeholder="Course highlights, curriculum scope..."
                  ></textarea>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" (click)="closeModal()" class="btn btn-secondary">Cancel</button>
              <button type="submit" [disabled]="saving" class="btn btn-primary">
                <span *ngIf="saving"><i class="ri-loader-4-line ri-spin"></i> Saving...</span>
                <span *ngIf="!saving">{{ isEditing ? 'Update Subject' : 'Create Subject' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .subjects-page {
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

    .filters-row {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .filter-item {
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
      min-width: 180px;
    }

    .font-mono {
      font-family: monospace;
      letter-spacing: 0.05em;
    }

    .text-indigo {
      color: var(--primary-600);
    }

    .text-muted {
      color: var(--slate-400);
      font-style: italic;
    }

    .desc-text {
      color: var(--slate-600);
      font-size: 0.825rem;
      max-width: 280px;
      display: inline-block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
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
export class SubjectsComponent implements OnInit {
  subjects: Subject[] = [];
  classes: SchoolClass[] = [];
  teachers: Teacher[] = [];
  loading = false;
  saving = false;
  feedbackMessage = '';
  isError = false;

  selectedClassFilter = '';
  selectedTeacherFilter = '';

  showModal = false;
  isEditing = false;
  editingSubjectId = '';
  modalError = '';

  formData = {
    name: '',
    code: '',
    teacherId: '',
    classId: '',
    description: '',
  };

  constructor(
    private subjectService: SubjectService,
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
    this.loadSubjects();
  }

  loadClasses(): void {
    this.classService.getClasses().subscribe({
      next: (res) => {
        this.classes = res.data;
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

  loadSubjects(): void {
    this.loading = true;
    this.subjectService.getSubjects(this.selectedClassFilter, this.selectedTeacherFilter).subscribe({
      next: (res) => {
        this.subjects = res.data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.showFeedback(err.error?.message || 'Failed to fetch subjects', true);
      },
    });
  }

  getTeacherName(t: any): string {
    if (!t) return 'Unassigned';
    if (typeof t === 'object') return t.name || 'Unassigned';
    const found = this.teachers.find((x) => x._id === t);
    return found ? found.name : 'Assigned';
  }

  getClassName(c: any): string {
    if (!c) return 'All Classes';
    if (typeof c === 'object') return `${c.name} - ${c.section}`;
    const found = this.classes.find((x) => x._id === c);
    return found ? `${found.name} - ${found.section}` : c;
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.editingSubjectId = '';
    this.modalError = '';
    this.formData = {
      name: '',
      code: '',
      teacherId: '',
      classId: '',
      description: '',
    };
    this.showModal = true;
  }

  openEditModal(s: Subject): void {
    this.isEditing = true;
    this.editingSubjectId = s._id;
    this.modalError = '';
    this.formData = {
      name: s.name,
      code: s.code,
      teacherId: typeof s.teacherId === 'object' ? (s.teacherId as any)?._id : s.teacherId || '',
      classId: typeof s.classId === 'object' ? (s.classId as any)?._id : s.classId || '',
      description: s.description || '',
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveSubject(): void {
    this.saving = true;
    this.modalError = '';

    const payload = {
      ...this.formData,
      teacherId: this.formData.teacherId ? this.formData.teacherId : undefined,
      classId: this.formData.classId ? this.formData.classId : undefined,
    };

    if (this.isEditing) {
      this.subjectService.updateSubject(this.editingSubjectId, payload).subscribe({
        next: () => {
          this.saving = false;
          this.closeModal();
          this.showFeedback('Subject updated successfully!');
          this.loadSubjects();
        },
        error: (err) => {
          this.saving = false;
          this.modalError = err.error?.message || 'Failed to update subject';
        },
      });
    } else {
      this.subjectService.createSubject(payload).subscribe({
        next: () => {
          this.saving = false;
          this.closeModal();
          this.showFeedback('Subject created successfully!');
          this.loadSubjects();
        },
        error: (err) => {
          this.saving = false;
          this.modalError = err.error?.message || 'Failed to create subject';
        },
      });
    }
  }

  confirmDelete(s: Subject): void {
    if (confirm(`Are you sure you want to delete subject '${s.name}' (${s.code})?`)) {
      this.subjectService.deleteSubject(s._id).subscribe({
        next: () => {
          this.showFeedback(`Subject '${s.name}' removed successfully.`);
          this.loadSubjects();
        },
        error: (err) => {
          this.showFeedback(err.error?.message || 'Failed to delete subject', true);
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
