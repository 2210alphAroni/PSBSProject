import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'https://localhost:7272/api/UsersLogin/delete-my-account';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getUserName(): string {
    const user = this.getUser();
    return user?.fullName || user?.Email || 'User';
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  deleteMyAccount() {
  const token = localStorage.getItem('token');

  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  return this.http.delete(this.apiUrl, {
    headers,
    responseType: 'text' // Expecting a text response
  });
}
}
