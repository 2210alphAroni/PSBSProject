import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../Services/auth.service';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class HeaderComponent {

  constructor(
    public auth: AuthService,
    private router: Router
  ) {}

  goProfile() {
    this.router.navigate(['/profile']);
  }

  deleteAccount() {
  if (!confirm('Are you sure you want to permanently delete your account?')) {
    return;
  }

  this.auth.deleteMyAccount().subscribe({
    next: () => {
      alert('Your account has been deleted.');
      this.auth.logout();                 // clear token
      this.router.navigate(['/login']);   // navigate AFTER response
    },
    error: (err) => {
      console.error(err);
      alert('Failed to delete account.');
    }
  });
}
}
