import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Attendance, AttendanceSummary } from '../models/attendance.model';
import { Student } from '../models/student.model';

export interface ClassAttendanceResponse {
  isMarked: boolean;
  attendance: Attendance | null;
  summary: AttendanceSummary;
  students: Student[];
}

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  private readonly apiUrl = 'http://localhost:5000/api/attendance';

  constructor(private http: HttpClient) {}

  markAttendance(payload: {
    classId: string;
    date: string;
    records: { studentId: string; status: 'Present' | 'Absent' | 'Late'; remarks?: string }[];
  }): Observable<{ success: boolean; data: Attendance; message: string }> {
    return this.http.post<{ success: boolean; data: Attendance; message: string }>(`${this.apiUrl}/mark`, payload);
  }

  getAttendanceByDateAndClass(classId: string, date: string): Observable<{ success: boolean; data: ClassAttendanceResponse }> {
    const params = new HttpParams().set('date', date);
    return this.http.get<{ success: boolean; data: ClassAttendanceResponse }>(`${this.apiUrl}/class/${classId}`, { params });
  }

  getClassHistory(
    classId: string,
    startDate?: string,
    endDate?: string
  ): Observable<{ success: boolean; count: number; data: Attendance[] }> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<{ success: boolean; count: number; data: Attendance[] }>(`${this.apiUrl}/history/${classId}`, { params });
  }

  getStudentHistory(studentId: string): Observable<{ success: boolean; data: any }> {
    return this.http.get<{ success: boolean; data: any }>(`${this.apiUrl}/student/${studentId}`);
  }
}
