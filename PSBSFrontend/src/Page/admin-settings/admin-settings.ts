import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './admin-settings.html',
  styleUrls: ['./admin-settings.css'],
})
export class AdminSettings implements OnInit {

  // ===== ADMIN INFO =====
  admin: any = null;
  loading = true;

  private userApiUrl = 'https://localhost:7272/api/UsersRegistration/get';
  private changePasswordApi = 'https://localhost:7272/api/UsersPassword/change';

  // ===== CHANGE PASSWORD FIELDS =====
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  // ===== ALERT STATE =====
  alertMessage: string = '';
  alertType: 'success' | 'error' | '' = '';
  passwordLoading = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAdminInfo();
  }

  loadAdminInfo() {
    this.http.get<any[]>(this.userApiUrl).subscribe({
      next: (res) => {
        this.admin = res.find(u => u.RegisterAS === 'Admin');
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  // ===== CHANGE PASSWORD =====
  updatePassword() {

    this.alertMessage = '';
    this.alertType = '';

    if (this.newPassword !== this.confirmPassword) {
      this.showAlert('New password and confirm password do not match', 'error');
      return;
    }

    const payload = {
      userId: this.admin.Id,
      currentPassword: this.currentPassword,
      newPassword: this.newPassword
    };

    this.passwordLoading = true;

    this.http.post<any>(this.changePasswordApi, payload).subscribe({
      next: (res) => {
        this.showAlert(res.message || 'Password changed successfully', 'success');

        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.passwordLoading = false;
      },
      error: (err) => {
        const msg = err?.error?.error || 'Failed to change password';
        this.showAlert(msg, 'error');
        this.passwordLoading = false;
      }
    });
  }

  showAlert(message: string, type: 'success' | 'error') {
    this.alertMessage = message;
    this.alertType = type;

    // Auto hide after 4 seconds
    setTimeout(() => {
      this.alertMessage = '';
      this.alertType = '';
    }, 3000);
  }

  // ===== LOGOUT =====
  logout() {
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}
