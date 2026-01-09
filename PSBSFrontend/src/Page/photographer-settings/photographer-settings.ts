import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../app/Services/auth.service';

@Component({
  selector: 'app-photographer-settings',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './photographer-settings.html',
  styleUrls: ['./photographer-settings.css']
})
export class PhotographerSettings implements OnInit {

  photographer: any = null;
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
    this.loadPhotographerInfo();
  }

  loadPhotographerInfo() {
    const user = this.authService.getUser();

    this.http.get<any>(this.userApiUrl + user.userId).subscribe({
      next: res => {
        this.photographer = res;
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
    formData.append('userId', this.photographer.Id);
    formData.append('image', this.selectedImage);

    this.imageUploading = true;

    this.http.post<any>(this.uploadImageApi, formData).subscribe({
      next: res => {
        this.photographer.ProfileImage = res.imageUrl;
        this.showAlert('Profile image updated successfully', 'success');
        this.imageUploading = false;
      },
      error: () => {
        this.showAlert('Image upload failed', 'error');
        this.imageUploading = false;
      }
    });
  }

  updatePassword() {
    if (this.newPassword !== this.confirmPassword) {
      this.showAlert('Passwords do not match', 'error');
      return;
    }

    const payload = {
      userId: this.photographer.Id,
      currentPassword: this.currentPassword,
      newPassword: this.newPassword
    };

    this.passwordLoading = true;

    this.http.post<any>(this.changePasswordApi, payload).subscribe({
      next: res => {
        this.showAlert(
          res?.message || 'Password changed successfully',
          'success'
        );

        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.passwordLoading = false;

        this.cdr.detectChanges();
      },
      error: err => {
        this.showAlert(
          err?.error?.message || 'Failed to change password',
          'error'
        );
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
