import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../app/Services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home {

  constructor(public auth: AuthService) {}

}
