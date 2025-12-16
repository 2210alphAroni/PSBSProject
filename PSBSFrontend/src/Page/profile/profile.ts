import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../app/Services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile implements OnInit {

  user: any;

  constructor(
    private auth: AuthService,
    private router: Router   
  ) {}

  ngOnInit() {
    this.user = this.auth.getUser();
  }

  goHome() {
    this.router.navigate(['/home']); 
  }
}
