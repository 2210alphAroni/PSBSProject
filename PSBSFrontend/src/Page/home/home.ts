import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../app/Services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit {

  constructor(
    public auth: AuthService,   // 🔴 MUST be public for HTML
    private router: Router
  ) {}

  ngOnInit(): void {
    // 🔎 Debug safety – ensures navbar updates after redirect
    console.log('HOME INIT USER:', this.auth.getUser());
  }

  goProfile(): void {
    this.router.navigate(['/profile']);
  }
}
