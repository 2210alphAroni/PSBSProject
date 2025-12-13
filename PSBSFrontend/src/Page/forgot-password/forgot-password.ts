import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './forgot-password.html',
  styleUrl: '../login/login.css'
})
export class ForgotPassword {

  email: string = '';
  isLoading = false;

  constructor(private http: HttpClient) {}

  sendResetLink() {
    if (!this.email) {
      alert("Please enter your email");
      return;
    }

    this.isLoading = true;
    this.http.post(
      'https://localhost:7272/api/UsersPassword/forgot',
      { email: this.email }
    ).subscribe({
      next: () => {
        alert("Reset link sent to your email");
        setTimeout(() => {
        this.isLoading = false;
        window.location.reload(); // or redirect
      }, 3000);
      },
      error: (err) => {
        this.isLoading = false;
        alert(err.error?.error || "Something went wrong");
      }
    });
  }
}
