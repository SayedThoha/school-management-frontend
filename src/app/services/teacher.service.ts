import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Teacher } from '../models/teacher.model';

@Injectable({
  providedIn: 'root',
})
export class TeacherService {
  private readonly apiUrl = 'http://localhost:5000/api/teachers';

  constructor(private http: HttpClient) {}

  getTeachers(subject?: string): Observable<{ success: boolean; data: Teacher[]; count: number }> {
    let params = new HttpParams();
    if (subject) params = params.set('subject', subject);
    return this.http.get<{ success: boolean; data: Teacher[]; count: number }>(this.apiUrl, { params });
  }

  getTeacherById(id: string): Observable<{ success: boolean; data: Teacher }> {
    return this.http.get<{ success: boolean; data: Teacher }>(`${this.apiUrl}/${id}`);
  }

  createTeacher(teacher: Partial<Teacher>): Observable<{ success: boolean; data: Teacher; message: string }> {
    return this.http.post<{ success: boolean; data: Teacher; message: string }>(this.apiUrl, teacher);
  }

  updateTeacher(id: string, teacher: Partial<Teacher>): Observable<{ success: boolean; data: Teacher; message: string }> {
    return this.http.put<{ success: boolean; data: Teacher; message: string }>(`${this.apiUrl}/${id}`, teacher);
  }

  deleteTeacher(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }
}
