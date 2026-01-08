import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { UsersRegistrationService } from '../../app/Services/users-registration.service';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../app/Services/chat.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, FormsModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit {

  photographers: any[] = [];
  messages: any[] = [];
  message = '';
  isChatOpen = false;
  isChatConnected = false;

  private ratingApi = 'https://localhost:7272/api/ReviewRating';

  constructor(
    private userService: UsersRegistrationService,
    private chatService: ChatService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadPhotographers();

    // ✅ Start SignalR connection safely
    this.chatService.startConnection()
      .then(() => {
        this.isChatConnected = true;

        // ✅ RECEIVE MESSAGE (FIXED + AUTO SCROLL)
        this.chatService.receiveMessage(
          (user: string, msg: string, isAdmin: boolean) => {
            this.messages.push({ user, msg, isAdmin });
            this.cdr.detectChanges();

            // 🔽 auto scroll to latest message
            setTimeout(() => {
              const box = document.querySelector('.chat-messages') as HTMLElement;
              if (box) {
                box.scrollTop = box.scrollHeight;
              }
            }, 0);
          }
        );
      })
      .catch(() => {
        this.isChatConnected = false;
        console.error('Chat connection failed');
      });
  }

  toggleChat() {
    this.isChatOpen = !this.isChatOpen;
  }

  send() {
    if (!this.isChatConnected) {
      alert('Chat is connecting, please wait...');
      return;
    }

    if (!this.message.trim()) return;

    this.chatService.sendMessage('Client', this.message, false);
    this.message = '';
  }

  // ---------------------------
  loadPhotographers(): void {
    this.userService.getAvailablePhotographers().subscribe({
      next: res => {
        this.photographers = res;
        this.photographers.forEach(p => this.loadRatingForPhotographer(p));
        this.cdr.detectChanges();
      },
      error: err => console.error(err)
    });
  }

  loadRatingForPhotographer(p: any) {
    this.http.get<any>(`${this.ratingApi}/average/${p.Id}`)
      .subscribe({
        next: res => {
          p.AverageRating = Number(res.AverageRating) || 0;
          p.TotalReviews = Number(res.TotalReviews) || 0;
          this.cdr.detectChanges();
        },
        error: () => {
          p.AverageRating = 0;
          p.TotalReviews = 0;
        }
      });
  }

  getRoundedRating(rating: number): number {
    return Math.round(rating || 0);
  }
}
