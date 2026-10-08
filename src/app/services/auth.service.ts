import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User, AuthResponse, UserRole } from '../models/user.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:5000/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    const storedUser = localStorage.getItem('school_user');
    const token = localStorage.getItem('school_token');
    if (storedUser && token) {
      try {
        this.currentUserSubject.next(JSON.parse(storedUser));
      } catch (e) {
        this.logout();
      }
    }
  }

  login(credentials: { email: string; password: string }): Observable<{ success: boolean; data: AuthResponse }> {
    return this.http.post<{ success: boolean; data: AuthResponse }>(`${this.apiUrl}/login`, credentials).pipe(
      tap((res) => {
        if (res.success && res.data) {
          localStorage.setItem('school_token', res.data.token);
          localStorage.setItem('school_user', JSON.stringify(res.data.user));
          this.currentUserSubject.next(res.data.user);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('school_token');
    localStorage.removeItem('school_user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('school_token');
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return !!this.getToken() && !!this.currentUser;
  }

  hasRole(role: UserRole): boolean {
    return this.currentUser?.role === role;
  }
}
