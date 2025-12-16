import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  // 🔥 MUST MATCH BACKEND LoginRequest
  user = {
    emailOruserName: '',
    Password: ''
  };

  isLoading = false;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

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

        /* -----------------------------
           ✅ CRITICAL FIX #1
           SAVE TOKEN (YOU MISSED THIS)
        ------------------------------ */
        if (res.token) {
          localStorage.setItem('token', res.token);
        }

        /* -----------------------------
           ✅ CRITICAL FIX #2
           SAVE USER PROPERLY
        ------------------------------ */
        const loggedUser = res.user;
        localStorage.setItem('user', JSON.stringify(loggedUser));

        /* -----------------------------
           🔐 ROLE DETECTION (SAFE)
        ------------------------------ */
        const role = (
          loggedUser.RegisterAS ??
          loggedUser.RegisterAs ??
          loggedUser.registerAs ??
          ''
        ).toString().toLowerCase().trim();

        this.isLoading = false;

        /* -----------------------------
           🚦 REDIRECT
        ------------------------------ */
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
}
