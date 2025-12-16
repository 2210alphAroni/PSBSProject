import { Component } from '@angular/core';
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
export class Home {

  constructor(
    public auth: AuthService,
    private router: Router
  ) {}

  goProfile() {
    this.router.navigate(['/profile']);
  }
}
