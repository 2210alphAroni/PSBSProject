import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../app/Services/auth.service';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './admin-settings.html',
  styleUrls: ['./admin-settings.css']
})
export class AdminSettings implements OnInit {

  admin: any = null;
  loading = true;

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  alertMessage = '';
  alertType: 'success' | 'error' | '' = '';
  passwordLoading = false;

  selectedImage!: File;
  imageUploading = false;

  private userApiUrl = 'https://localhost:7272/api/UsersRegistration/';
  private changePasswordApi = 'https://localhost:7272/api/UsersPassword/change';
  private uploadImageApi = 'https://localhost:7272/api/UsersProfile/upload-image';

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAdminInfo();
  }

  loadAdminInfo() {
    const user = this.authService.getUser();
    this.http.get<any>(this.userApiUrl + user.userId).subscribe({
      next: res => {
        this.admin = res;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => this.loading = false
    });
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedImage = file;
    this.uploadProfileImage();
  }

  uploadProfileImage() {
    const formData = new FormData();
    formData.append('userId', this.admin.Id);
    formData.append('image', this.selectedImage);

    this.imageUploading = true;

    this.http.post<any>(this.uploadImageApi, formData).subscribe({
      next: res => {
        this.admin.ProfileImage = res.imageUrl;
        this.showAlert('Profile image updated successfully', 'success');
        this.imageUploading = false;
      },
      error: () => {
        this.showAlert('Image upload failed', 'error');
        this.imageUploading = false;
      }
    });
  }

  // ✅ ONLY FIXED PART
  updatePassword() {
    if (this.newPassword !== this.confirmPassword) {
      this.showAlert('Passwords do not match', 'error');
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

        // ✅ GUARANTEED SUCCESS MESSAGE
        const successMsg =
          res?.message ||
          res?.Message ||
          'Password changed successfully';

        this.showAlert(successMsg, 'success');

        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.passwordLoading = false;

        this.cdr.detectChanges();
      },
      error: err => {
        const errorMsg =
          err?.error?.message ||
          err?.error?.error ||
          'Failed to change password';

        this.showAlert(errorMsg, 'error');
        this.passwordLoading = false;
      }
    });
  }

  showAlert(msg: string, type: 'success' | 'error') {
    this.alertMessage = msg;
    this.alertType = type;

    setTimeout(() => {
      this.alertMessage = '';
      this.alertType = '';
    }, 3000);
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
