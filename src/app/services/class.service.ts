import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SchoolClass } from '../models/class.model';

@Injectable({
  providedIn: 'root',
})
export class ClassService {
  private readonly apiUrl = 'http://localhost:5000/api/classes';

  constructor(private http: HttpClient) {}

  getClasses(): Observable<{ success: boolean; data: SchoolClass[]; count: number }> {
    return this.http.get<{ success: boolean; data: SchoolClass[]; count: number }>(this.apiUrl);
  }

  getClassById(id: string): Observable<{ success: boolean; data: any }> {
    return this.http.get<{ success: boolean; data: any }>(`${this.apiUrl}/${id}`);
  }

  createClass(data: Partial<SchoolClass>): Observable<{ success: boolean; data: SchoolClass; message: string }> {
    return this.http.post<{ success: boolean; data: SchoolClass; message: string }>(this.apiUrl, data);
  }

  updateClass(id: string, data: Partial<SchoolClass>): Observable<{ success: boolean; data: SchoolClass; message: string }> {
    return this.http.put<{ success: boolean; data: SchoolClass; message: string }>(`${this.apiUrl}/${id}`, data);
  }

  assignTeacher(id: string, teacherId: string): Observable<{ success: boolean; data: SchoolClass; message: string }> {
    return this.http.post<{ success: boolean; data: SchoolClass; message: string }>(`${this.apiUrl}/${id}/assign-teacher`, {
      teacherId,
    });
  }

  deleteClass(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }
}
