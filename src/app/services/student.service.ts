import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Student } from '../models/student.model';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private readonly apiUrl = 'http://localhost:5000/api/students';

  constructor(private http: HttpClient) {}

  getStudents(classId?: string, search?: string): Observable<{ success: boolean; data: Student[]; count: number }> {
    let params = new HttpParams();
    if (classId) params = params.set('classId', classId);
    if (search) params = params.set('search', search);
    return this.http.get<{ success: boolean; data: Student[]; count: number }>(this.apiUrl, { params });
  }

  getStudentById(id: string): Observable<{ success: boolean; data: Student }> {
    return this.http.get<{ success: boolean; data: Student }>(`${this.apiUrl}/${id}`);
  }

  createStudent(student: Partial<Student>): Observable<{ success: boolean; data: Student; message: string }> {
    return this.http.post<{ success: boolean; data: Student; message: string }>(this.apiUrl, student);
  }

  updateStudent(id: string, student: Partial<Student>): Observable<{ success: boolean; data: Student; message: string }> {
    return this.http.put<{ success: boolean; data: Student; message: string }>(`${this.apiUrl}/${id}`, student);
  }

  deleteStudent(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }
}
