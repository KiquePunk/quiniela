import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="flex justify-between items-center">
            <h1 class="text-2xl font-bold text-gray-900">Administración</h1>
            <a routerLink="/dashboard" class="text-blue-600 hover:text-blue-700">← Volver</a>
          </div>
        </div>
      </header>

      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section class="bg-white rounded-lg shadow-md p-6">
          <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 class="text-xl font-bold text-gray-900">Gestión de participantes</h2>
              <p class="text-sm text-gray-500 mt-1">
                Autoriza registros, da de baja lógicamente a participantes y reactiva cuentas cuando sea necesario.
              </p>
            </div>
          </div>
        </section>

        <section class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-xl font-bold text-gray-900">Participantes</h2>
            <p class="text-sm text-gray-500 mt-1">
              Los administradores pueden autorizar, dar de baja y reactivar participantes según el estado de su cuenta.
            </p>
          </div>

          @if (loading) {
            <div class="text-center py-10">
              <p class="text-gray-500">Cargando participantes...</p>
            </div>
          } @else if (users.length === 0) {
            <div class="text-center py-10">
              <p class="text-gray-500">No hay usuarios registrados.</p>
            </div>
          } @else {
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Usuario</th>
                    <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Correo</th>
                    <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Rol</th>
                    <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Aprobación</th>
                    <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Cuenta</th>
                    <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Acciones</th>
                  </tr>
                </thead>

                <tbody class="bg-white divide-y divide-gray-200">
                  @for (user of users; track user.id) {
                    <tr>
                      <td class="px-6 py-4">
                        <div>
                          <p class="text-sm font-semibold text-gray-900">{{ user.username }}</p>
                          <p class="text-sm text-gray-500">{{ user.full_name }}</p>
                        </div>
                      </td>
                      <td class="px-6 py-4 text-sm text-gray-700">{{ user.email }}</td>
                      <td class="px-6 py-4 text-center">
                        <span class="rounded-full px-3 py-1 text-xs font-semibold"
                              [class]="user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'">
                          {{ user.role === 'admin' ? 'Administrador' : 'Participante' }}
                        </span>
                      </td>
                      <td class="px-6 py-4 text-center">
                        <span class="rounded-full px-3 py-1 text-xs font-semibold"
                              [class]="user.is_approved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'">
                          {{ user.is_approved ? 'Autorizado' : 'Pendiente' }}
                        </span>
                      </td>
                      <td class="px-6 py-4 text-center">
                        <span class="rounded-full px-3 py-1 text-xs font-semibold"
                              [class]="user.is_active ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'">
                          {{ user.is_active ? 'Activo' : 'Baja lógica' }}
                        </span>
                      </td>
                      <td class="px-6 py-4 text-center">
                        @if (user.role === 'admin') {
                          <span class="text-xs text-gray-400">Sin acción</span>
                        } @else {
                          <div class="flex flex-wrap items-center justify-center gap-2">
                            @if (!user.is_approved) {
                              <button
                                type="button"
                                (click)="approveUser(user.id)"
                                [disabled]="approving[user.id] || togglingStatus[user.id]"
                                class="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:bg-gray-400"
                              >
                                {{ approving[user.id] ? 'Autorizando...' : 'Autorizar' }}
                              </button>
                            }

                            @if (user.is_active) {
                              <button
                                type="button"
                                (click)="deactivateUser(user.id)"
                                [disabled]="approving[user.id] || togglingStatus[user.id]"
                                class="px-3 py-2 rounded-lg bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 disabled:bg-gray-400"
                              >
                                {{ togglingStatus[user.id] ? 'Procesando...' : 'Dar de baja' }}
                              </button>
                            } @else {
                              <button
                                type="button"
                                (click)="reactivateUser(user.id)"
                                [disabled]="approving[user.id] || togglingStatus[user.id]"
                                class="px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:bg-gray-400"
                              >
                                {{ togglingStatus[user.id] ? 'Procesando...' : 'Reactivar' }}
                              </button>
                            }
                          </div>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </section>
      </main>
    </div>
  `,
  styles: []
})
export class AdminComponent implements OnInit {
  users: User[] = [];
  loading = true;
  approving: Record<string, boolean> = {};
  togglingStatus: Record<string, boolean> = {};

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.loadCurrentUserProfile().subscribe({
      next: (profile) => {
        if (!profile || profile.role !== 'admin') {
          this.router.navigate(['/dashboard']);
          return;
        }

        this.loadUsers();
      },
      error: () => {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  loadUsers(): void {
    this.adminService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loading = false;
      }
    });
  }

  approveUser(userId: string): void {
    const currentAdminId = this.authService.currentUserProfile?.id;

    if (!currentAdminId) {
      return;
    }

    this.approving[userId] = true;

    this.adminService.approveUser(userId, currentAdminId).subscribe({
      next: (updatedUser) => {
        this.users = this.users.map((user) => user.id === userId ? updatedUser : user);
        this.approving[userId] = false;
      },
      error: (error) => {
        console.error('Error approving user:', error);
        this.approving[userId] = false;
        alert('No fue posible autorizar al participante.');
      }
    });
  }

  deactivateUser(userId: string): void {
    const currentAdminId = this.authService.currentUserProfile?.id;

    if (!currentAdminId) {
      return;
    }

    this.togglingStatus[userId] = true;

    this.adminService.deactivateUser(userId, currentAdminId).subscribe({
      next: (updatedUser) => {
        this.users = this.users.map((user) => user.id === userId ? updatedUser : user);
        this.togglingStatus[userId] = false;
      },
      error: (error) => {
        console.error('Error deactivating user:', error);
        this.togglingStatus[userId] = false;
        alert('No fue posible dar de baja al participante.');
      }
    });
  }

  reactivateUser(userId: string): void {
    this.togglingStatus[userId] = true;

    this.adminService.reactivateUser(userId).subscribe({
      next: (updatedUser) => {
        this.users = this.users.map((user) => user.id === userId ? updatedUser : user);
        this.togglingStatus[userId] = false;
      },
      error: (error) => {
        console.error('Error reactivating user:', error);
        this.togglingStatus[userId] = false;
        alert('No fue posible reactivar al participante.');
      }
    });
  }
}

// Made with Bob