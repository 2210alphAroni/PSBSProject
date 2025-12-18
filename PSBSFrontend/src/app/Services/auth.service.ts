
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router: Router) {}

  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  // ✅ FIXED (Backend compatible)
  getUserName(): string {
    const user = this.getUser();
    return user?.FullName || user?.Email || 'User';
  }

  // ✅ ROLE CHECKS
  getRole(): string {
    return this.getUser()?.RegisterAS || '';
  }

  isAdmin(): boolean {
    return this.getRole() === 'Admin';
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}

