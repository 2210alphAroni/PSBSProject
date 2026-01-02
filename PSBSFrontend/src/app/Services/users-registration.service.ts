import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersRegistrationService {

  private apiUrl = 'https://localhost:7272/api/UsersRegistration';

  constructor(private http: HttpClient) {}

  // ✅ Fetch only available photographers
  getAvailablePhotographers(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/available-photographers`
    );
  }
}
