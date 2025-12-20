import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [FormsModule, RouterModule,CommonModule],
  templateUrl: './registration.html',
  styleUrl: './registration.css',
})
export class Registration {

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

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {
    this.getUsers();
  }

  getUsers() {
    this.http.get<any[]>('https://localhost:7272/api/UsersRegistration/get')
      .subscribe(res => {
        this.userList = res;
        this.cdr.detectChanges();
      });
  }


  countries = [
    { name: 'Bangladesh', dialCode: '+880', flag: '🇧🇩' },
    { name: 'India', dialCode: '+91', flag: '🇮🇳' },
    { name: 'United States', dialCode: '+1', flag: '🇺🇸' },
    { name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
    { name: 'Canada', dialCode: '+1', flag: '🇨🇦' },
    { name: 'Australia', dialCode: '+61', flag: '🇦🇺' },
    { name: 'Germany', dialCode: '+49', flag: '🇩🇪' },
    { name: 'France', dialCode: '+33', flag: '🇫🇷' },
    { name: 'Japan', dialCode: '+81', flag: '🇯🇵' }
  ];

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

    if (this.userList.some(u => u.userName === this.user.userName)) {
      alert('This username is already taken.');
      window.location.reload();
      return;
    }

    // ---------- API CALL ----------
    this.isLoading = true;

    this.http
      .post('https://localhost:7272/api/UsersRegistration/post', this.user)
      .subscribe({
        next: () => {
          alert('User registered successfully!');
          this.isLoading = false;
          form.resetForm();

          // ✅ ONLY PLACE WHERE RELOAD IS ALLOWED
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        },
        error: (err) => {
          this.isLoading = false;
          alert(err.error?.error || 'Registration failed.');
        }
      });
  }
}
