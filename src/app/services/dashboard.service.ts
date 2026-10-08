import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardData {
  overview: {
    totalStudents: number;
    totalTeachers: number;
    totalClasses: number;
    totalSubjects: number;
  };
  recentStudents: any[];
  classes: any[];
  recentAttendance: any[];
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly apiUrl = 'http://localhost:5000/api/dashboard';

  constructor(private http: HttpClient) {}

  getStats(): Observable<{ success: boolean; data: DashboardData }> {
    return this.http.get<{ success: boolean; data: DashboardData }>(`${this.apiUrl}/stats`);
  }
}
