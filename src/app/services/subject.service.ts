import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Subject } from '../models/subject.model';

@Injectable({
  providedIn: 'root',
})
export class SubjectService {
  private readonly apiUrl = 'http://localhost:5000/api/subjects';

  constructor(private http: HttpClient) {}

  getSubjects(classId?: string, teacherId?: string): Observable<{ success: boolean; data: Subject[]; count: number }> {
    let params = new HttpParams();
    if (classId) params = params.set('classId', classId);
    if (teacherId) params = params.set('teacherId', teacherId);
    return this.http.get<{ success: boolean; data: Subject[]; count: number }>(this.apiUrl, { params });
  }

  getSubjectById(id: string): Observable<{ success: boolean; data: Subject }> {
    return this.http.get<{ success: boolean; data: Subject }>(`${this.apiUrl}/${id}`);
  }

  createSubject(subject: Partial<Subject>): Observable<{ success: boolean; data: Subject; message: string }> {
    return this.http.post<{ success: boolean; data: Subject; message: string }>(this.apiUrl, subject);
  }

  updateSubject(id: string, subject: Partial<Subject>): Observable<{ success: boolean; data: Subject; message: string }> {
    return this.http.put<{ success: boolean; data: Subject; message: string }>(`${this.apiUrl}/${id}`, subject);
  }

  deleteSubject(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }
}
