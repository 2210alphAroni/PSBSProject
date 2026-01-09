import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../app/Services/auth.service';

@Component({
  selector: 'app-photo-by-cat',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './photo-by-cat.html',
  styleUrl: './photo-by-cat.css',
})
export class PhotoByCat implements OnInit {

  weddingImages: any[] = [];
  category: string = 'Wedding';

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private auth: AuthService
  ) {}

 ngOnInit(): void {
  this.route.queryParamMap.subscribe(params => {

    this.category = params.get('cat') ?? 'Wedding';

    const publicCategories = ['Wedding', 'Reception'];

    // ❌ login required categories
    if (!this.auth.isLoggedIn() && !publicCategories.includes(this.category)) {

      this.router.navigate(['/login'], {
        queryParams: {
          reason: 'service_access',
          category: this.category
        }
      });

      return;
    }

    // ✅ allowed
    this.loadImagesByCategory(this.category);
  });
}

  loadImagesByCategory(category: string): void {
    const apiUrl =
      `https://localhost:7272/api/PhotographerPortfolio/by-category?category=${encodeURIComponent(category)}`;

    this.http.get<any[]>(apiUrl).subscribe({
      next: res => {
        console.log('API Response:', res);
        this.weddingImages = res;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('API Error:', err);
        this.weddingImages = [];
      }
    });
  }
}
