import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientConnectionService } from '../../services/HttpClientConnectionService';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './registration.html',
  styleUrl: './registration.css',
})
export class Registration implements OnInit {

  userList: any[] = [];

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

  isLoading = false;

  passwordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,9}$/;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private dataservice: HttpClientConnectionService
  ) { }

  ngOnInit(): void {
    const defaultCountry = this.countries.find(c => c.code === 'BD');
    this.user.countryCode = defaultCountry?.dialCode || '+880';

    this.getUsers();
    this.detectCountry();
  }


  getUsers() {
    this.dataservice.GetData<any[]>('UsersRegistration/get')
      .subscribe(res => {
        this.userList = res;
        this.cdr.detectChanges();
      });
    // this.http.get<any[]>('https://localhost:7272/api/UsersRegistration/get')
    //   .subscribe(res => {
    //     this.userList = res;
    //     this.cdr.detectChanges();
    //   });
  }


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
    { name: 'Nigeria', code: 'NG', dialCode: '+234', flag: '🇳🇬' },
    { name: 'Mexico', code: 'MX', dialCode: '+52', flag: '🇲🇽' },
    { name: 'Italy', code: 'IT', dialCode: '+39', flag: '🇮🇹' },
    { name: 'Spain', code: 'ES', dialCode: '+34', flag: '🇪🇸' },
    { name: 'Russia', code: 'RU', dialCode: '+7', flag: '🇷🇺' },
    { name: 'China', code: 'CN', dialCode: '+86', flag: '🇨🇳' },
    { name: 'Turkey', code: 'TR', dialCode: '+90', flag: '🇹🇷' },
    { name: 'Argentina', code: 'AR', dialCode: '+54', flag: '🇦🇷' }

  ];


  // show / hide password
  showPassword = false;

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }



  // 🌍 AUTO-DETECT COUNTRY
  detectCountry() {
    this.http.get<any>('https://ipapi.co/json/')
      .subscribe({
        next: (res) => {
          const countryCode = res.country;

          const matchedCountry = this.countries.find(
            c => c.code === countryCode
          );

          if (matchedCountry) {
            this.user.countryCode = matchedCountry.dialCode;

            // 🔁 ensure UI updates immediately
            this.cdr.detectChanges();
          }
        },
        error: () => {
          console.warn('Country detection failed');
        }
      });
  }


  register(form: NgForm) {

    // ---------- REQUIRED FIELD CHECK ----------
    if (form.invalid) {
      alert('Please fill in all required fields correctly.');
      window.location.reload();
      return;
    }

    // for countrywise phone number formatting
    const finalPhone = `${this.user.countryCode} ${this.user.phone}`;

    const payload = {
      ...this.user,
      phone: finalPhone
    };

    console.log('REGISTER PAYLOAD:', payload);


    // ---------- PASSWORD VALIDATION FIRST ----------
    if (this.user.password.length < 6 || this.user.password.length > 9) {
      alert('Password must be between 6 and 9 characters.');
      return;
    }

    if (!this.passwordPattern.test(this.user.password)) {
      alert(
        'Password must contain:\n' +
        '- One uppercase letter\n' +
        '- One lowercase letter\n' +
        '- One number\n' +
        '- One special character (@$!%*?&)'
      );
      return;
    }

    if (this.user.password !== this.user.confirmPassword) {
      alert('Passwords do not match!');
      window.location.reload();
      return;
    }


    // ---------- DUPLICATE CHECK ----------
    if (this.userList.some(u => u.email === this.user.email)) {
      alert('This email is already registered.');
      window.location.reload();
      return;
    }

    if (this.userList.some(u => u.phone === this.user.phone)) {
      alert('This phone number is already registered.');
      window.location.reload();
      return;
    }

    if (this.userList.some(u => u.phone === payload.phone)) {
      alert('This phone number is already registered.');
      return;
    }


    if (this.userList.some(u => u.userName === this.user.userName)) {
      alert('This username is already taken.');
      window.location.reload();
      return;
    }

    // ---------- API CALL ----------
    this.isLoading = true;

    // this.dataservice.PostData<any>('UsersRegistration/post', payload)
    //   .subscribe({
    //     next: () => {
    //       alert('User registered successfully! Please Login.');
    //       this.isLoading = false;
    //       form.resetForm();
    //       window.location.href = '/login';
    //     },
    //     error: (err) => {
    //       this.isLoading = false;
    //       alert(err?.error?.error || 'Registration failed');
    //       setTimeout(() => {
    //         window.location.reload();
    //       }, 1000);
    //     }
    //   });


    this.http
      .post('https://localhost:7272/api/UsersRegistration/post', this.user)
      .subscribe({
        next: () => {
          alert('User registered successfully! please Login.');
          this.isLoading = false;
          form.resetForm();

          window.location.href = '/login';
        },
        error: (err) => {
          this.isLoading = false;
          alert(err.error?.error || 'Registration failed.');
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      });
  }
}
