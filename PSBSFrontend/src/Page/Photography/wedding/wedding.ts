import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-wedding',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './wedding.html'
})
export class Wedding implements OnInit {

  apiUrl =
    'https://localhost:7272/api/PhotographerPortfolio/by-category/Wedding';

  weddingImages: any[] = [];

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.http.get<any[]>(this.apiUrl)
      .subscribe(res => {
        this.weddingImages = res;
        this.cdr.detectChanges();
      });
  }
}
