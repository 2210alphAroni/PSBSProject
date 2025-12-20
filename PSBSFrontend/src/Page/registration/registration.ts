import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './registration.html',
  styleUrl: './registration.css',
})
export class Registration implements OnInit {

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  // ==============================
  // STATE
  // ==============================
  userList: any[] = [];
  isLoading = false;

  user = {
    registerAs: '',
    fullName: '',
    email: '',
    countryCode: '',
    phone: '',
    userName: '',
    password: '',
    confirmPassword: '',
    gender: ''
  };

  passwordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,9}$/;

  // ==============================
  // COUNTRY LIST
  // ==============================
  countries = [
    { name: 'Bangladesh', code: 'BD', dialCode: '+880', flag: '🇧🇩' },
    { name: 'India', code: 'IN', dialCode: '+91', flag: '🇮🇳' },
    { name: 'United States', code: 'US', dialCode: '+1', flag: '🇺🇸' },
    { name: 'United Kingdom', code: 'GB', dialCode: '+44', flag: '🇬🇧' },
    { name: 'Canada', code: 'CA', dialCode: '+1', flag: '🇨🇦' },
    { name: 'Australia', code: 'AU', dialCode: '+61', flag: '🇦🇺' },
    { name: 'Germany', code: 'DE', dialCode: '+49', flag: '🇩🇪' },
    { name: 'France', code: 'FR', dialCode: '+33', flag: '🇫🇷' },
    { name: 'Japan', code: 'JP', dialCode: '+81', flag: '🇯🇵' },
    { name: 'South Korea', code: 'KR', dialCode: '+82', flag: '🇰🇷' },
    { name: 'Brazil', code: 'BR', dialCode: '+55', flag: '🇧🇷' },
    { name: 'South Africa', code: 'ZA', dialCode: '+27', flag: '🇿🇦' },
  ];

  // ==============================
  // INIT
  // ==============================
  ngOnInit(): void {
    this.getUsers();
    this.detectCountry();
  }

  // ==============================
  // FETCH USERS
  // ==============================
  getUsers() {
    this.http
      .get<any[]>('https://localhost:7272/api/UsersRegistration/get')
      .subscribe(res => {
        this.userList = res;
      });
  }

  // ==============================
  // 🌍 AUTO-DETECT COUNTRY
  // ==============================
  detectCountry() {
    this.http.get<any>('https://ipapi.co/json/')
      .subscribe({
        next: res => {
          const code = res?.country; // e.g. "IN"

          const match = this.countries.find(c => c.code === code);

          if (match) {
            // 🔥 Force async binding
            setTimeout(() => {
              this.user.countryCode = match.dialCode;
              this.cdr.detectChanges();
            }, 0);
          }
        },
        error: () => {
          console.warn('Country detection failed');
        }
      });
  }

  // ==============================
  // REGISTER
  // ==============================
  register(form: NgForm) {

    if (form.invalid) {
      alert('Please fill all required fields correctly.');
      return;
    }

    // PASSWORD CHECK
    if (!this.passwordPattern.test(this.user.password)) {
      alert(
        'Password must contain:\n' +
        '- Uppercase\n- Lowercase\n- Number\n- Special character'
      );
      return;
    }

    if (this.user.password !== this.user.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    // FINAL PHONE FORMAT
    const finalPhone = `${this.user.countryCode} ${this.user.phone}`;

    // DUPLICATE CHECKS
    if (this.userList.some(u => u.email === this.user.email)) {
      alert('Email already registered');
      return;
    }

    if (this.userList.some(u => u.phone === finalPhone)) {
      alert('Phone already registered');
      return;
    }

    if (this.userList.some(u => u.userName === this.user.userName)) {
      alert('Username already taken');
      return;
    }

    // PAYLOAD
    const payload = {
      ...this.user,
      phone: finalPhone
    };

    // API CALL
    this.isLoading = true;

    this.http
      .post('https://localhost:7272/api/UsersRegistration/post', payload)
      .subscribe({
        next: () => {
          alert('User registered successfully!');
          this.isLoading = false;
          form.resetForm();
        },
        error: err => {
          this.isLoading = false;
          alert(err.error?.error || 'Registration failed');
        }
      });
  }
}
