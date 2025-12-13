import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './reset-password.html',
  styleUrl: '../login/login.css'
})

export class ResetPassword implements OnInit {

  token: string = '';
  password: string = '';
  confirmPassword: string = '';

  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
  }

  resetPassword() {
    if (!this.password || !this.confirmPassword) {
      alert("Please fill all fields");
      return;
    }

    if (this.password !== this.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    this.isLoading = true;
    this.http.post(
      'https://localhost:7272/api/UsersPassword/reset',
      {
        token: this.token,
        newPassword: this.password
      }
    ).subscribe({
      next: () => {
        alert("Password reset successful");
        this.router.navigate(['/login']);
        setTimeout(() => {
        this.isLoading = false;
        window.location.reload(); // or redirect
      }, 3000);
      },
      error: (err) => {
        this.isLoading = false;
        alert(err.error?.error || "Invalid or expired link");
      }
    });
  }
}
