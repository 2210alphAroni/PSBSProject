import { Component, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

declare var google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements AfterViewInit {

  // ===============================
  // NORMAL LOGIN MODEL
  // ===============================
  user = {
    emailOruserName: '',
    Password: ''
  };

  isLoading = false;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  // ===============================
  // NORMAL LOGIN
  // ===============================
  login(form: NgForm) {

    if (form.invalid) {
      alert('Please fill all fields');
      return;
    }

    this.isLoading = true;

    this.http.post<any>(
      'https://localhost:7272/api/UsersLogin/auth',
      this.user
    ).subscribe({
      next: (res) => {
        if (res.token) {
          localStorage.setItem('token', res.token);
        }

        if (res.user) {
          localStorage.setItem('user', JSON.stringify(res.user));
        }

        this.isLoading = false;
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.isLoading = false;
        alert(err.error?.error || 'Login failed');
        console.error(err);
      }
    });
  }

  // ===============================
  // GOOGLE LOGIN INIT
  // ===============================
  ngAfterViewInit(): void {

    if (typeof google === 'undefined') {
      console.error('❌ Google Identity script not loaded');
      return;
    }

    google.accounts.id.initialize({
      client_id: '501889184170-hvi2lbi392aonfl8iqihudbr9hqc2ldg.apps.googleusercontent.com',
      callback: this.handleGoogleResponse.bind(this)
    });

    google.accounts.id.renderButton(
      document.getElementById('googleBtn'),
      {
        theme: 'outline',
        size: 'large',
        width: 380,
        text: 'continue_with'
      }
    );
  }

  // ===============================
  // GOOGLE LOGIN CALLBACK
  // ===============================
  handleGoogleResponse(response: any): void {

    if (!response?.credential) {
      console.error('❌ No Google credential received');
      return;
    }

    this.isLoading = true;

    this.http.post<any>(
      'https://localhost:7272/api/UsersLogin/google',
      { token: response.credential }
    ).subscribe({
      next: (res) => {
        console.log('✅ Google login success', res);

        if (res.token) {
          localStorage.setItem('token', res.token);
        }

        if (res.user) {
          localStorage.setItem('user', JSON.stringify(res.user));
        }

        this.isLoading = false;
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.isLoading = false;
        alert('Google login failed');
        console.error(err);
      }
    });
  }
}
