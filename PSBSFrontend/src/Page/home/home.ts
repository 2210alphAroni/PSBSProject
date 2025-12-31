import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UsersRegistrationService } from '../../app/Services/users-registration.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit {

  photographers: any[] = [];

  constructor(
    private userService: UsersRegistrationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadPhotographers();
  }

  // ✅ Call service → API → DB
  loadPhotographers(): void {
    this.userService.getAvailablePhotographers().subscribe({
      next: (res) => {
        this.photographers = res;
        console.log('Available photographers:', res);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load photographers', err);
      }
    });
  }

  // ✅ Booking navigation
  book(id: number): void {
    this.router.navigate(['/booking', id]);
  }
}
