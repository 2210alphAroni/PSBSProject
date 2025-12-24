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

  user = {
    emailOruserName: '',
    Password: ''
  };

  isLoading = false;

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }


  // show / hide password
  showPassword = false;

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  // ================= NORMAL LOGIN =================
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

        // SAVE TOKEN & USER
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));

        const role = res.user.registerAS;

        // 🔥 ROLE BASED REDIRECT
        if (role === 'Admin') {
          this.router.navigate(['/admin-dashboard']);
        } else if (role === 'Photographer') {
          this.router.navigate(['/photographer-dashboard']);
          alert( 'Photographer Login Successful! Please wait for the page to reload.');
          window.location.reload();
        } else {
          this.router.navigate(['/home']);
        }

        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        alert(err.error?.error || 'Login failed');
        console.error(err);
        window.location.reload();
      }
    });
  }

  // ================= GOOGLE LOGIN INIT =================
  ngAfterViewInit(): void {

    if (typeof google === 'undefined') {
      console.error('Google script not loaded');
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
        width: 380
      }
    );
  }

  // ================= GOOGLE LOGIN CALLBACK =================
  handleGoogleResponse(response: any): void {

    if (!response?.credential) return;

    this.isLoading = true;

    this.http.post<any>(
      'https://localhost:7272/api/UsersLogin/google',
      { token: response.credential }
    ).subscribe({
      next: (res) => {

        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));

        const role = res.user.registerAS;

        // 🔥 ROLE BASED REDIRECT
        if (role === 'Admin') {
          this.router.navigate(['/admin-dashboard']);
        } else {
          this.router.navigate(['/home']);
        }

        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        alert('Google login failed');
      }
    });
  }
}
