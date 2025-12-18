import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../app/Services/auth.service';

declare var google: any; // IMPORTANT for Google Identity

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  // MUST MATCH BACKEND LoginRequest
  user = {
    emailOruserName: '',
    Password: ''
  };

  isLoading = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    public auth: AuthService
  ) {}

  /* =====================================
     NORMAL LOGIN (EMAIL / PASSWORD)
  ====================================== */
  login(form: NgForm) {

    if (form.invalid) {
      alert('Please fill all fields!');
      return;
    }

    this.isLoading = true;

    this.http.post<any>(
      'https://localhost:7272/api/UsersLogin/auth',
      this.user
    ).subscribe({

      next: (res) => {
        console.log('Login response:', res);

        if (res.token) {
          localStorage.setItem('token', res.token);
        }

        const loggedUser = res.user;
        localStorage.setItem('user', JSON.stringify(loggedUser));

        const role = (
          loggedUser.RegisterAS ??
          loggedUser.RegisterAs ??
          loggedUser.registerAs ??
          ''
        ).toString().toLowerCase().trim();

        this.isLoading = false;

        if (role === 'admin') {
          this.router.navigate(['/admin-dashboard']);
        } else {
          this.router.navigate(['/home']);
        }
      },

      error: (err) => {
        this.isLoading = false;
        alert(err.error?.error || 'Invalid credentials');
        console.error(err);
      }
    });
  }

  /* =====================================
     GOOGLE LOGIN
  ====================================== */
  loginWithGoogle() {
    google.accounts.id.initialize({
      client_id: '501889184170-hvi2lbi392aonfl8iqihudbr9hqc2ldg.apps.googleusercontent.com',
      callback: (response: any) => {
        this.handleGoogleResponse(response);
      }
    });

    google.accounts.id.prompt();
  }

  handleGoogleResponse(response: any) {
    const googleToken = response.credential;

    this.isLoading = true;

    this.http.post<any>(
      'https://localhost:7272/api/UsersLogin/google',
      { token: googleToken }
    ).subscribe({

      next: (res) => {
        console.log('Google login success:', res);

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
