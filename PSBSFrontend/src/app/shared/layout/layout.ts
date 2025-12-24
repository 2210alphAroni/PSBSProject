import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header';
import { Footer } from '../footer/footer';

@Component({
  standalone: true,
  selector: 'app-public-layout',
  imports: [RouterOutlet, HeaderComponent, Footer],
  template: `
    <app-header></app-header>
    <router-outlet></router-outlet>
    <app-footer></app-footer>
  `
})
export class PublicLayoutComponent {}
