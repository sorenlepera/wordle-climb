import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, map, tap } from 'rxjs/operators';
import { of, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  
  public isAuthenticated = signal<boolean>(false);
  public currentUser = signal<string | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    this.checkToken();
  }

  private checkToken() {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      this.isAuthenticated.set(true);
      // Basic decode to get username
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.currentUser.set(payload.upn);
      } catch (e) {
        this.logout();
      }
    }
  }

  login(username: string, password: string) {
    return this.http.post<{token: string}>(`${this.apiUrl}/login`, { username, password }).pipe(
      tap(res => {
        localStorage.setItem('jwt_token', res.token);
        this.checkToken();
      }),
      catchError(err => {
        return throwError(() => new Error(err.error?.error || 'Erreur lors de la connexion.'));
      })
    );
  }

  register(username: string, password: string) {
    return this.http.post<{token: string}>(`${this.apiUrl}/register`, { username, password }).pipe(
      tap(res => {
        if (res.token) {
          localStorage.setItem('jwt_token', res.token);
          this.checkToken();
        }
      }),
      catchError(err => {
        return throwError(() => new Error(err.error?.error || 'Erreur lors de la création du compte.'));
      })
    );
  }

  logout() {
    localStorage.removeItem('jwt_token');
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }
}
