import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceService } from '../../services/attendance.service';
import { ClassService } from '../../services/class.service';
import { SchoolClass } from '../../models/class.model';
import { AttendanceStatus } from '../../models/attendance.model';

interface StudentAttendanceRow {
  studentId: string;
  name: string;
  rollNumber: string;
  status: AttendanceStatus;
  remarks: string;
}

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="attendance-page">
      <div class="page-header">
        <div>
          <h1>Attendance Management</h1>
          <p class="subtitle">Record daily class roll-calls, track student absences, and review history</p>
        </div>
      </div>

      <!-- Selection & Filter Toolbar -->
      <div class="card toolbar-card">
        <div class="toolbar-body">
          <div class="picker-group">
            <div class="picker-item">
              <label class="form-label"><i class="ri-building-line"></i> Select Class *</label>
              <select [(ngModel)]="selectedClassId" (change)="onClassOrDateChange()" class="form-select class-picker">
                <option *ngFor="let cls of classes" [value]="cls._id">
                  {{ cls.name }} - {{ cls.section }}
                </option>
              </select>
            </div>

            <div class="picker-item">
              <label class="form-label"><i class="ri-calendar-line"></i> Attendance Date *</label>
              <input
                type="date"
                [(ngModel)]="selectedDate"
                (change)="onClassOrDateChange()"
                class="form-control date-picker"
              />
            </div>
          </div>

          <div class="toolbar-shortcuts">
            <button (click)="markAll('Present')" class="btn btn-outline btn-sm">
              <i class="ri-check-double-line text-success"></i> Mark All Present
            </button>
            <button (click)="loadHistory()" class="btn btn-secondary btn-sm">
              <i class="ri-history-line"></i> View Class Logs
            </button>
          </div>
        </div>
      </div>

      <!-- Feedback Banner -->
      <div *ngIf="feedbackMessage" class="alert" [ngClass]="isError ? 'alert-danger' : 'alert-success'">
        <i [class]="isError ? 'ri-error-warning-line' : 'ri-checkbox-circle-line'"></i>
        <span>{{ feedbackMessage }}</span>
      </div>

      <!-- Stats Bar for Current Sheet -->
      <div class="attendance-summary-grid">
        <div class="summary-pill pill-total">
          <span class="pill-label">Total Roll Call</span>
          <span class="pill-value">{{ studentRows.length }}</span>
        </div>

        <div class="summary-pill pill-present">
          <span class="pill-label">Present</span>
          <span class="pill-value">{{ countStatus('Present') }}</span>
        </div>

        <div class="summary-pill pill-absent">
          <span class="pill-label">Absent</span>
          <span class="pill-value">{{ countStatus('Absent') }}</span>
        </div>

        <div class="summary-pill pill-late">
          <span class="pill-label">Late Arrival</span>
          <span class="pill-value">{{ countStatus('Late') }}</span>
        </div>

        <div class="summary-pill pill-rate">
          <span class="pill-label">Presence Rate</span>
          <span class="pill-value">{{ getAttendanceRate() }}%</span>
        </div>
      </div>

      <!-- Attendance Table -->
      <div class="card">
        <div class="card-header">
          <div class="d-flex align-items-center gap-2">
            <h3 class="card-title">
              <i class="ri-calendar-check-line"></i> Roll Call Sheet ({{ selectedDate }})
            </h3>
            <span *ngIf="isAlreadyMarked" class="badge badge-success">
              <i class="ri-check-line"></i> Saved Record
            </span>
            <span *ngIf="!isAlreadyMarked" class="badge badge-warning">
              <i class="ri-time-line"></i> Not Saved Yet
            </span>
          </div>

          <button (click)="saveAttendance()" [disabled]="saving || studentRows.length === 0" class="btn btn-primary">
            <span *ngIf="saving"><i class="ri-loader-4-line ri-spin"></i> Saving...</span>
            <span *ngIf="!saving"><i class="ri-save-line"></i> Submit Attendance</span>
          </button>
        </div>

        <div class="card-body p-0">
          <div *ngIf="loading" class="loading-state">
            <i class="ri-loader-4-line ri-spin"></i>
            <span>Loading students for class...</span>
          </div>

          <div *ngIf="!loading" class="table-container">
            <table class="modern-table">
              <thead>
                <tr>
                  <th style="width: 120px;">Roll No</th>
                  <th>Student Name</th>
                  <th style="width: 280px;">Status</th>
                  <th>Remarks (Optional)</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let row of studentRows">
                  <td>
                    <span class="badge badge-primary font-mono">{{ row.rollNumber }}</span>
                  </td>
                  <td>
                    <strong>{{ row.name }}</strong>
                  </td>
                  <td>
                    <div class="status-toggle-group">
                      <button
                        type="button"
                        (click)="row.status = 'Present'"
                        class="toggle-btn toggle-present"
                        [class.active]="row.status === 'Present'"
                      >
                        <i class="ri-checkbox-circle-fill"></i> Present
                      </button>
                      <button
                        type="button"
                        (click)="row.status = 'Absent'"
                        class="toggle-btn toggle-absent"
                        [class.active]="row.status === 'Absent'"
                      >
                        <i class="ri-close-circle-fill"></i> Absent
                      </button>
                      <button
                        type="button"
                        (click)="row.status = 'Late'"
                        class="toggle-btn toggle-late"
                        [class.active]="row.status === 'Late'"
                      >
                        <i class="ri-time-fill"></i> Late
                      </button>
                    </div>
                  </td>
                  <td>
                    <input
                      type="text"
                      [(ngModel)]="row.remarks"
                      placeholder="e.g. excused, fever, doctor appointment"
                      class="form-control form-control-sm"
                    />
                  </td>
                </tr>
                <tr *ngIf="studentRows.length === 0">
                  <td colspan="4" class="empty-state">
                    No students are registered in this class. Add students before taking attendance.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Attendance History Modal / Section -->
      <div *ngIf="showHistoryModal" class="modal-backdrop" (click)="closeHistoryModal()">
        <div class="modal-dialog history-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Attendance History Logs</h3>
            <button (click)="closeHistoryModal()" class="btn-icon btn-outline">
              <i class="ri-close-line"></i>
            </button>
          </div>
          <div class="modal-body p-0">
            <div class="table-container">
              <table class="modern-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Total Students</th>
                    <th>Present</th>
                    <th>Absent</th>
                    <th>Late</th>
                    <th>Logged By</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let h of historyLogs">
                    <td><strong>{{ h.date }}</strong></td>
                    <td>{{ h.records.length }}</td>
                    <td>
                      <span class="badge badge-success">{{ countHistoryRecords(h, 'Present') }}</span>
                    </td>
                    <td>
                      <span class="badge badge-danger">{{ countHistoryRecords(h, 'Absent') }}</span>
                    </td>
                    <td>
                      <span class="badge badge-warning">{{ countHistoryRecords(h, 'Late') }}</span>
                    </td>
                    <td>{{ h.markedBy?.name || 'Staff' }}</td>
                  </tr>
                  <tr *ngIf="historyLogs.length === 0">
                    <td colspan="6" class="empty-state">No past attendance records found for this class.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="modal-footer">
            <button (click)="closeHistoryModal()" class="btn btn-secondary">Close</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .attendance-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
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
      padding: 1.25rem;
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .picker-group {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      flex-wrap: wrap;
    }

    .picker-item {
      display: flex;
      flex-direction: column;
    }

    .class-picker {
      min-width: 220px;
    }

    .date-picker {
      min-width: 170px;
    }

    .toolbar-shortcuts {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .text-success {
      color: var(--success-main);
    }

    .attendance-summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 1rem;
    }

    .summary-pill {
      background: #ffffff;
      padding: 1rem 1.25rem;
      border-radius: var(--radius-md);
      border: 1px solid var(--slate-200);
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      box-shadow: var(--shadow-sm);
    }

    .pill-label {
      font-size: 0.72rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--slate-500);
    }

    .pill-value {
      font-size: 1.6rem;
      font-weight: 700;
      line-height: 1.1;
    }

    .pill-total .pill-value { color: var(--slate-800); }
    .pill-present .pill-value { color: var(--success-main); }
    .pill-absent .pill-value { color: var(--danger-main); }
    .pill-late .pill-value { color: var(--warning-main); }
    .pill-rate .pill-value { color: var(--primary-600); }

    .status-toggle-group {
      display: flex;
      border-radius: var(--radius-md);
      overflow: hidden;
      border: 1px solid var(--slate-300);
      width: fit-content;
    }

    .toggle-btn {
      padding: 0.35rem 0.65rem;
      font-size: 0.78rem;
      font-weight: 600;
      border: none;
      background: var(--slate-50);
      color: var(--slate-600);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.3rem;
      transition: all 0.15s ease;
    }

    .toggle-btn:not(:last-child) {
      border-right: 1px solid var(--slate-300);
    }

    .toggle-present.active {
      background: #10b981;
      color: #ffffff;
    }

    .toggle-absent.active {
      background: #ef4444;
      color: #ffffff;
    }

    .toggle-late.active {
      background: #f59e0b;
      color: #ffffff;
    }

    .font-mono {
      font-family: monospace;
      letter-spacing: 0.05em;
    }

    .form-control-sm {
      padding: 0.35rem 0.65rem;
      font-size: 0.8rem;
    }

    .history-dialog {
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
export class AttendanceComponent implements OnInit {
  classes: SchoolClass[] = [];
  selectedClassId = '';
  selectedDate = new Date().toISOString().split('T')[0];

  studentRows: StudentAttendanceRow[] = [];
  isAlreadyMarked = false;
  loading = false;
  saving = false;
  feedbackMessage = '';
  isError = false;

  showHistoryModal = false;
  historyLogs: any[] = [];

  constructor(private attendanceService: AttendanceService, private classService: ClassService) {}

  ngOnInit(): void {
    this.classService.getClasses().subscribe({
      next: (res) => {
        this.classes = res.data;
        if (this.classes.length > 0) {
          this.selectedClassId = this.classes[0]._id;
          this.loadAttendanceSheet();
        }
      },
    });
  }

  onClassOrDateChange(): void {
    if (this.selectedClassId && this.selectedDate) {
      this.loadAttendanceSheet();
    }
  }

  loadAttendanceSheet(): void {
    this.loading = true;
    this.attendanceService.getAttendanceByDateAndClass(this.selectedClassId, this.selectedDate).subscribe({
      next: (res) => {
        this.loading = false;
        this.isAlreadyMarked = res.data.isMarked;

        const students = res.data.students || [];
        const recordsMap = new Map<string, { status: AttendanceStatus; remarks: string }>();

        if (res.data.attendance?.records) {
          for (const rec of res.data.attendance.records) {
            const sid = typeof rec.studentId === 'object' ? (rec.studentId as any)._id : rec.studentId;
            recordsMap.set(sid.toString(), {
              status: rec.status,
              remarks: rec.remarks || '',
            });
          }
        }

        this.studentRows = students.map((st) => {
          const recorded = recordsMap.get(st._id);
          return {
            studentId: st._id,
            name: st.name,
            rollNumber: st.rollNumber,
            status: recorded ? recorded.status : 'Present',
            remarks: recorded ? recorded.remarks : '',
          };
        });
      },
      error: (err) => {
        this.loading = false;
        this.showFeedback(err.error?.message || 'Failed to load attendance sheet', true);
      },
    });
  }

  markAll(status: AttendanceStatus): void {
    this.studentRows.forEach((r) => (r.status = status));
  }

  countStatus(status: AttendanceStatus): number {
    return this.studentRows.filter((r) => r.status === status).length;
  }

  getAttendanceRate(): number {
    if (this.studentRows.length === 0) return 100;
    const present = this.countStatus('Present');
    return Math.round((present / this.studentRows.length) * 100);
  }

  saveAttendance(): void {
    if (!this.selectedClassId || !this.selectedDate) {
      this.showFeedback('Class and Date are required', true);
      return;
    }

    this.saving = true;
    const records = this.studentRows.map((r) => ({
      studentId: r.studentId,
      status: r.status,
      remarks: r.remarks,
    }));

    this.attendanceService
      .markAttendance({
        classId: this.selectedClassId,
        date: this.selectedDate,
        records,
      })
      .subscribe({
        next: () => {
          this.saving = false;
          this.isAlreadyMarked = true;
          this.showFeedback('Attendance roll call successfully saved!');
        },
        error: (err) => {
          this.saving = false;
          this.showFeedback(err.error?.message || 'Failed to save attendance', true);
        },
      });
  }

  loadHistory(): void {
    if (!this.selectedClassId) return;
    this.attendanceService.getClassHistory(this.selectedClassId).subscribe({
      next: (res) => {
        this.historyLogs = res.data;
        this.showHistoryModal = true;
      },
      error: (err) => {
        this.showFeedback(err.error?.message || 'Failed to load attendance history', true);
      },
    });
  }

  closeHistoryModal(): void {
    this.showHistoryModal = false;
  }

  countHistoryRecords(historyEntry: any, status: AttendanceStatus): number {
    if (!historyEntry.records) return 0;
    return historyEntry.records.filter((r: any) => r.status === status).length;
  }

  showFeedback(msg: string, isErr = false): void {
    this.feedbackMessage = msg;
    this.isError = isErr;
    setTimeout(() => {
      this.feedbackMessage = '';
    }, 4000);
  }
}
