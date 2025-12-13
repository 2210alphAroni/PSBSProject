import { ChangeDetectorRef, Component } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  user = {
    emailOrUsername: '',
    password: ''
  };

  isLoading=false;

  constructor(private httpRequest: HttpClient, private router: Router) { }

  login(form: NgForm) {
    if (form.invalid) {
      alert("Please fill all fields!");
      window.location.reload();
      return;
    }

    this.isLoading=true;
    this.httpRequest.post("https://localhost:7272/api/UsersLogin/auth", this.user)
      .subscribe({
        next: (res: any) => {
          alert("Login successful!");
          console.log("Full Response:", res);

          let loggedUser = res.user;
          console.log("Logged User:", loggedUser);

          // Save user
          localStorage.setItem('user', JSON.stringify(loggedUser));

          // Extract role safely from ANY naming format
          const roleRaw =
            loggedUser.RegisterAs ||
            loggedUser.registerAs ||
            loggedUser.RegisterAS ||
            loggedUser.registerAS ||
            loggedUser.registeras ||
            '';

          const role = roleRaw.toString().toLowerCase().trim();

          console.log("Detected Role:", role);

          //  Admin redirect
          if (role === 'admin') {
            this.router.navigate(['/admin-dashboard']);
            return;
          }

          setTimeout(() =>{
            this.isLoading=false;
            window.location.reload(); 
          },2000)

        },

        error: (err) => {
          alert("Login failed!\n" + (err.error?.error || "Invalid credentials"));
          console.error(err);
          window.location.reload();
        }
      });
  }
}
