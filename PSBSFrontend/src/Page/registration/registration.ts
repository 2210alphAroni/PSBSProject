import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-registration',
  imports: [FormsModule, RouterModule],
  templateUrl: './registration.html',
  styleUrl: './registration.css',
})

export class Registration {

  userList: any[] = [];

  // 1. PLACE THIS HERE
  user = {
    registerAs: '',
    fullName: '',
    email: '',
    phone: '',
    userName: '',
    password: '',
    confirmPassword: '',
    gender: ''
  };

  // Constructor
  constructor(private httpRequest: HttpClient, private cdr: ChangeDetectorRef) {
    this.getUsers();
  }

  // Get users
  getUsers() {
    this.httpRequest.get('https://localhost:7272/api/UsersRegistration/get')
      .subscribe(
        (data: any) => {
          this.userList = data;
          this.cdr.detectChanges();
        },
        (error: HttpErrorResponse) => {
          console.log(error.message)
        }
      );
  }


  // 2. PLACE THIS BELOW YOUR METHODS (INSIDE THE CLASS)
  isLoading: boolean = false;
  register(form: NgForm) {
    if (form.invalid) {
      alert('Please fill in all required fields.');
      window.location.reload();
      return;
    }

    // Password match check
    if (this.user.password !== this.user.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }


    // Duplicate Validation HERE
    let duplicateEmail = this.userList.some(c => c.email === this.user.email);
    let duplicatePhone = this.userList.some(c => c.phone === this.user.phone);
    let duplicateUsername = this.userList.some(c => c.userName === this.user.userName);

    if (duplicateEmail) {
      alert("Email already exists! Try using another Email.");
      return;
    }

    if (duplicatePhone) {
      alert("Phone number already registered!");
      return;
    }

    if (duplicateUsername) {
      alert("Username already taken!");
      return;
    }


    this.isLoading = true;  //for create account btn loading start

    this.httpRequest.post("https://localhost:7272/api/UsersRegistration/post", this.user)
      .subscribe({
        next: (res: any) => {
          alert("User registered successfully!");
          console.log(res);

          // Wait 3 seconds before reload
        setTimeout(() => {
          this.isLoading = false;
          window.location.reload();
        }, 3000);

        },
        error: (err) => {
          this.isLoading = false;
          alert("Registration failed!\n" + err.error?.error);
          console.error(err);
        }
      });
  }
}
