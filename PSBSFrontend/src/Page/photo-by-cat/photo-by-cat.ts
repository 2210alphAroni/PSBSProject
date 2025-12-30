import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-photo-by-cat',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './photo-by-cat.html',
  styleUrl: './photo-by-cat.css',
})
export class PhotoByCat implements OnInit {
  apiUrl: string = '';

  weddingImages: any[] = [];

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef,private route: ActivatedRoute) {}

    ngOnInit(): void {
      debugger;
      this.route.queryParamMap.subscribe(params => {
      const cat = params.get('cat') ?? 'Wedding';
      this.loadImagesByCategory(cat);
  });

  }
  loadImagesByCategory(category: string) {
    this.apiUrl = `https://localhost:7272/api/PhotographerPortfolio/by-category?category=${category}`;
    this.http.get<any[]>(this.apiUrl)
      .subscribe(res => {
        console.log(res);
        this.weddingImages = res;
        this.cdr.detectChanges();
      });
    }
}
