import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MatchService } from '../../core/services/match.service';
import { LeaderboardService } from '../../core/services/leaderboard.service';
import { MatchWithTeams } from '../../core/models/match.model';
import { LeaderboardEntry } from '../../core/models/prediction.model';
import { User } from '../../core/models/user.model';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="flex justify-between items-center">
            <h1 class="text-2xl font-bold text-gray-900">⚽ Quiniela Mundial</h1>
            <div class="flex items-center gap-4">
              <span class="text-gray-700">{{ currentUser?.email }}</span>
              <button
                (click)="logout()"
                class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Navigation -->
      <nav class="bg-white border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex space-x-8">
            <a
              routerLink="/dashboard"
              routerLinkActive="border-blue-500 text-blue-600"
              class="px-3 py-4 border-b-2 border-transparent text-gray-700 hover:text-blue-600 font-medium"
            >
              Dashboard
            </a>
            <a
              routerLink="/predictions"
              routerLinkActive="border-blue-500 text-blue-600"
              class="px-3 py-4 border-b-2 border-transparent text-gray-700 hover:text-blue-600 font-medium"
            >
              Mis Predicciones
            </a>
            <a
              routerLink="/leaderboard"
              routerLinkActive="border-blue-500 text-blue-600"
              class="px-3 py-4 border-b-2 border-transparent text-gray-700 hover:text-blue-600 font-medium"
            >
              Tabla de Posiciones
            </a>
              @if (currentUserProfile?.role === 'admin') {
                <a
                  routerLink="/admin"
                  routerLinkActive="border-blue-500 text-blue-600"
                  class="px-3 py-4 border-b-2 border-transparent text-gray-700 hover:text-blue-600 font-medium"
                >
                  Administración
                </a>
              }
            </div>
          </div>
      </nav>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section class="bg-white rounded-lg shadow-md p-6">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div class="space-y-3">
              <h2 class="text-2xl font-bold text-gray-900">Acerca de la quiniela</h2>
              <ul class="space-y-2 text-sm text-gray-700">
                <li>• Esta es una quiniela del Team de Finanzas y OB con el propósito de divertirnos durante el Mundial.</li>
                <li>• El costo de la quiniela es de $1000 pesos por participante.</li>
                <li>• Los usuarios se pueden registrar pero no podrán participar en la quiniela hasta que un administrador autorice su participación.</li>
                <li>• Los usuarios pueden predecir marcadores antes de que inicien los partidos.</li>
                <li>• Las predicciones se bloquean automáticamente cuando comienza un partido.</li>
                <li>• Sincronización automática de equipos, partidos y resultados.</li>
                <li>• Sistema automático que calcula puntos basado en predicciones vs resultados reales.</li>
                <li>• Ranking en tiempo real de todos los participantes.</li>
                <li>• Se puede descargar un CSV con los pronósticos de los participantes para transparencia.</li>
              </ul>

              <div class="rounded-xl border border-blue-100 bg-blue-50 p-4">
                <h3 class="text-lg font-semibold text-blue-900">Sistema de Puntuación</h3>
                <ul class="mt-2 space-y-1 text-sm text-blue-800">
                  <li>• 3 puntos por acertar el marcador exacto</li>
                  <li>• 1 punto por acertar el resultado (ganador o empate)</li>
                  <li>• 0 puntos si no aciertas</li>
                </ul>
              </div>

              <p class="text-sm text-gray-700">
                El ganador será el que al final del mundial haya acumulado la mayor cantidad de puntos. En caso de empate la quiniela acumulada será divida entre los primeros lugares.
              </p>
            </div>

            <div class="lg:max-w-xs lg:w-full">
              <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <h3 class="text-lg font-semibold text-emerald-900">Exportar pronósticos</h3>
                <p class="mt-2 text-sm text-emerald-800">
                  Descarga un archivo CSV con los pronósticos de todos los participantes para fines de transparencia.
                </p>
                <button
                  type="button"
                  (click)="downloadCsv()"
                  [disabled]="downloadingCsv"
                  class="mt-4 w-full rounded-lg bg-emerald-600 px-4 py-2 text-white font-semibold hover:bg-emerald-700 disabled:bg-gray-400"
                >
                  {{ downloadingCsv ? 'Generando CSV...' : 'Descargar CSV' }}
                </button>
              </div>
            </div>
          </div>
        </section>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Próximos Partidos -->
          <div class="lg:col-span-2">
            <div class="bg-white rounded-lg shadow-md p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-4">Próximos Partidos</h2>
              
              @if (loadingMatches) {
                <div class="text-center py-8">
                  <p class="text-gray-500">Cargando partidos...</p>
                </div>
              } @else if (upcomingMatches.length === 0) {
                <div class="text-center py-8">
                  <p class="text-gray-500">No hay partidos próximos</p>
                </div>
              } @else {
                <div class="space-y-4">
                  @for (match of upcomingMatches.slice(0, 5); track match.id) {
                    <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div class="flex items-center justify-between">
                        <div class="flex-1 text-center">
                          <img [src]="match.home_team.crest" [alt]="match.home_team.name" class="w-12 h-12 mx-auto mb-2">
                          <p class="font-semibold text-gray-900">{{ match.home_team.name }}</p>
                        </div>
                        
                        <div class="px-4 text-center">
                          <p class="text-sm text-gray-500">{{ formatDate(match.utc_date) }}</p>
                          <p class="text-lg font-bold text-gray-900">VS</p>
                          <p class="text-xs text-gray-500">{{ match.stage }}</p>
                        </div>
                        
                        <div class="flex-1 text-center">
                          <img [src]="match.away_team.crest" [alt]="match.away_team.name" class="w-12 h-12 mx-auto mb-2">
                          <p class="font-semibold text-gray-900">{{ match.away_team.name }}</p>
                        </div>
                      </div>
                      
                      <div class="mt-4 text-center">
                        <a
                          routerLink="/predictions"
                          class="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Hacer Predicción
                        </a>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>

          <!-- Top 10 Leaderboard -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-lg shadow-md p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-4">Top 10</h2>
              
              @if (loadingLeaderboard) {
                <div class="text-center py-8">
                  <p class="text-gray-500">Cargando ranking...</p>
                </div>
              } @else if (topUsers.length === 0) {
                <div class="text-center py-8">
                  <p class="text-gray-500">No hay datos aún</p>
                </div>
              } @else {
                <div class="space-y-3">
                  @for (user of topUsers; track user.user_id) {
                    <div class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                      <div class="flex items-center gap-3">
                        <span class="text-lg font-bold text-gray-500">{{ user.rank }}</span>
                        <div>
                          <p class="font-semibold text-gray-900">{{ user.username }}</p>
                          <p class="text-xs text-gray-500">{{ user.full_name }}</p>
                        </div>
                      </div>
                      <span class="text-lg font-bold text-blue-600">{{ user.total_points }}</span>
                    </div>
                  }
                </div>
                
                <div class="mt-4 text-center">
                  <a
                    routerLink="/leaderboard"
                    class="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Ver tabla completa →
                  </a>
                </div>
              }
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {
  currentUser: any = null;
  currentUserProfile: User | null = null;
  upcomingMatches: MatchWithTeams[] = [];
  topUsers: LeaderboardEntry[] = [];
  loadingMatches = true;
  loadingLeaderboard = true;
  downloadingCsv = false;

  constructor(
    private authService: AuthService,
    private matchService: MatchService,
    private leaderboardService: LeaderboardService,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;

      if (user) {
        this.authService.loadCurrentUserProfile().subscribe({
          next: (profile) => {
            this.currentUserProfile = profile;
          },
          error: (error) => {
            console.error('Error loading current user profile:', error);
          }
        });
      } else {
        this.currentUserProfile = null;
      }
    });

    this.loadUpcomingMatches();
    this.loadTopUsers();
  }

  loadUpcomingMatches(): void {
    this.matchService.getUpcomingMatches().subscribe({
      next: (matches) => {
        this.upcomingMatches = matches;
        this.loadingMatches = false;
      },
      error: (error) => {
        console.error('Error loading matches:', error);
        this.loadingMatches = false;
      }
    });
  }

  loadTopUsers(): void {
    this.leaderboardService.getTopUsers(10).subscribe({
      next: (users) => {
        this.topUsers = users;
        this.loadingLeaderboard = false;
      },
      error: (error) => {
        console.error('Error loading leaderboard:', error);
        this.loadingLeaderboard = false;
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  downloadCsv(): void {
    this.downloadingCsv = true;

    this.adminService.downloadPredictionsCsv().subscribe({
      next: () => {
        this.downloadingCsv = false;
      },
      error: (error) => {
        console.error('Error downloading CSV:', error);
        this.downloadingCsv = false;
        alert('No fue posible descargar el CSV.');
      }
    });
  }

  logout(): void {
    this.authService.logout().subscribe();
  }
}

// Made with Bob