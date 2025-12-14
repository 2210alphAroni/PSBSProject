import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.html'
})
export class AdminUsers implements OnInit {

  users: any[] = [];
  isLoading = false;

  selectedUser: any = {};
  newUser: any = {
    fullName: '',
    email: '',
    registerAs: 'Client'
  };

  private apiBaseUrl = 'https://localhost:7272/api/UsersRegistration';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  // ===============================
  // INIT
  // ===============================
  ngOnInit(): void {
    this.loadUsers();
  }

  // ===============================
  // LOAD USERS (FIXED)
  // ===============================
  loadUsers(): void {
    this.isLoading = true;

    this.http.get<any[]>(`${this.apiBaseUrl}/get`).subscribe({
      next: (res) => {
        // 🔥 map backend PascalCase → frontend camelCase
        this.users = res.map(u => ({
          id: u.Id,
          fullName: u.FullName,
          email: u.Email,
          registerAs: u.RegisterAS
        }));

        this.isLoading = false;
        this.cdr.detectChanges(); // 🔥 force UI refresh
      },
      error: (err) => {
        console.error('Failed to load users', err);
        this.isLoading = false;
      }
    });
  }

  // ===============================
  // ADD USER
  // ===============================
  addUser(form: NgForm): void {
    if (form.invalid) return;

    this.http.post(`${this.apiBaseUrl}/add`, this.newUser).subscribe({
      next: () => {
        alert('User added successfully');

        form.resetForm();
        this.newUser = { fullName: '', email: '', registerAs: 'Client' };

        this.loadUsers();

        // ✅ close modal
        (document.getElementById('closeAddModalBtn') as HTMLButtonElement)?.click();
      },
      error: () => alert('Failed to add user')
    });
  }

  // ===============================
  // EDIT
  // ===============================
  openEdit(user: any): void {
    this.selectedUser = { ...user }; // clone
  }

  updateUser(): void {
    if (!this.selectedUser.id) return;

    this.http.put(
      `${this.apiBaseUrl}/update/${this.selectedUser.id}`,
      this.selectedUser
    ).subscribe({
      next: () => {
        alert('User updated successfully');
        this.loadUsers();

        // ✅ close modal
        (document.getElementById('closeEditModalBtn') as HTMLButtonElement)?.click();
      },
      error: () => alert('Failed to update user')
    });
  }

  // ===============================
  // DELETE
  // ===============================
  openDelete(user: any): void {
    this.selectedUser = { ...user };
  }

  deleteUser(): void {
    if (!this.selectedUser.id) return;

    this.http.delete(
      `${this.apiBaseUrl}/delete/${this.selectedUser.id}`
    ).subscribe({
      next: () => {
        alert('User deleted successfully');
        this.loadUsers();

        // ✅ close modal
        (document.getElementById('closeDeleteModalBtn') as HTMLButtonElement)?.click();
      },
      error: () => alert('Failed to delete user')
    });
  }
}
