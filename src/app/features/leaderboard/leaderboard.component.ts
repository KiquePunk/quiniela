import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LeaderboardService } from '../../core/services/leaderboard.service';
import { LeaderboardEntry } from '../../core/models/prediction.model';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="flex justify-between items-center">
            <h1 class="text-2xl font-bold text-gray-900">🏆 Tabla de Posiciones</h1>
            <a routerLink="/dashboard" class="text-blue-600 hover:text-blue-700">← Volver</a>
          </div>
        </div>
      </header>

      <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          @if (loading) {
            <div class="text-center py-12">
              <p class="text-gray-500">Cargando ranking...</p>
            </div>
          } @else if (leaderboard.length === 0) {
            <div class="text-center py-12">
              <p class="text-gray-500">No hay datos disponibles aún</p>
            </div>
          } @else {
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Posición
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Puntos
                    </th>
                    <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Marcadores Exactos
                    </th>
                    <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Resultados Correctos
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  @for (entry of leaderboard; track entry.user_id) {
                    <tr [class.bg-yellow-50]="entry.rank <= 3">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                          @if (entry.rank === 1) {
                            <span class="text-2xl">🥇</span>
                          } @else if (entry.rank === 2) {
                            <span class="text-2xl">🥈</span>
                          } @else if (entry.rank === 3) {
                            <span class="text-2xl">🥉</span>
                          } @else {
                            <span class="text-lg font-semibold text-gray-700">{{ entry.rank }}</span>
                          }
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div class="text-sm font-medium text-gray-900">{{ entry.username }}</div>
                          <div class="text-sm text-gray-500">{{ entry.full_name }}</div>
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-center">
                        <span class="text-lg font-bold text-blue-600">{{ entry.total_points }}</span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-center">
                        <span class="text-sm text-gray-900">{{ entry.correct_scores }}</span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-center">
                        <span class="text-sm text-gray-900">{{ entry.correct_results }}</span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>

        <div class="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 class="font-semibold text-blue-900 mb-2">Sistema de Puntuación</h3>
          <ul class="text-sm text-blue-800 space-y-1">
            <li>✅ <strong>3 puntos</strong> por acertar el marcador exacto</li>
            <li>✅ <strong>1 punto</strong> por acertar el resultado (ganador o empate)</li>
            <li>❌ <strong>0 puntos</strong> si no aciertas</li>
          </ul>
        </div>
      </main>
    </div>
  `,
  styles: []
})
export class LeaderboardComponent implements OnInit {
  leaderboard: LeaderboardEntry[] = [];
  loading = true;

  constructor(private leaderboardService: LeaderboardService) {}

  ngOnInit(): void {
    this.loadLeaderboard();
  }

  loadLeaderboard(): void {
    this.leaderboardService.getLeaderboard().subscribe({
      next: (data) => {
        this.leaderboard = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading leaderboard:', error);
        this.loading = false;
      }
    });
  }
}

// Made with Bob