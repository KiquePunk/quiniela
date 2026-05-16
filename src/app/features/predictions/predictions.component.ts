import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatchService } from '../../core/services/match.service';
import { PredictionService } from '../../core/services/prediction.service';
import { AuthService } from '../../core/services/auth.service';
import { MatchWithTeams } from '../../core/models/match.model';

@Component({
  selector: 'app-predictions',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="flex justify-between items-center">
            <h1 class="text-2xl font-bold text-gray-900">Mis Predicciones</h1>
            <a routerLink="/dashboard" class="text-blue-600 hover:text-blue-700">← Volver</a>
          </div>
        </div>
      </header>

      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        @if (loading) {
          <div class="text-center py-12">
            <p class="text-gray-500">Cargando partidos...</p>
          </div>
        } @else {
          <div class="space-y-6">
            @for (match of matches; track match.id) {
              <div class="bg-white rounded-lg shadow-md p-6">
                <div class="flex items-center justify-between mb-4">
                  <span class="text-sm text-gray-500">{{ formatDate(match.utc_date) }}</span>
                  <span class="px-3 py-1 rounded-full text-xs font-semibold"
                        [class]="getStatusClass(match.status)">
                    {{ getStatusText(match.status) }}
                  </span>
                </div>

                <div class="grid grid-cols-3 gap-4 items-center">
                  <div class="text-center">
                    <img [src]="match.home_team.crest" [alt]="match.home_team.name" class="w-16 h-16 mx-auto mb-2">
                    <p class="font-semibold">{{ match.home_team.name }}</p>
                  </div>

                  <div class="text-center">
                    @if (canPredict(match)) {
                      <div class="flex justify-center gap-4">
                        <input
                          type="number"
                          min="0"
                          max="20"
                          [(ngModel)]="predictions[match.id].home"
                          class="w-16 px-2 py-2 border border-gray-300 rounded text-center"
                        />
                        <span class="text-2xl font-bold">-</span>
                        <input
                          type="number"
                          min="0"
                          max="20"
                          [(ngModel)]="predictions[match.id].away"
                          class="w-16 px-2 py-2 border border-gray-300 rounded text-center"
                        />
                      </div>
                      <button
                        (click)="savePrediction(match.id)"
                        [disabled]="saving[match.id]"
                        class="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                      >
                        {{ saving[match.id] ? 'Guardando...' : 'Guardar' }}
                      </button>
                    } @else {
                      <div class="text-2xl font-bold">
                        {{ match.home_score ?? '-' }} - {{ match.away_score ?? '-' }}
                      </div>
                      @if (predictions[match.id]) {
                        <p class="text-sm text-gray-500 mt-2">
                          Tu predicción: {{ predictions[match.id].home }} - {{ predictions[match.id].away }}
                        </p>
                        @if (predictions[match.id].points !== undefined) {
                          <p class="text-sm font-semibold mt-1"
                             [class]="predictions[match.id].points > 0 ? 'text-green-600' : 'text-red-600'">
                            {{ predictions[match.id].points }} puntos
                          </p>
                        }
                      }
                    }
                  </div>

                  <div class="text-center">
                    <img [src]="match.away_team.crest" [alt]="match.away_team.name" class="w-16 h-16 mx-auto mb-2">
                    <p class="font-semibold">{{ match.away_team.name }}</p>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </main>
    </div>
  `,
  styles: []
})
export class PredictionsComponent implements OnInit {
  matches: MatchWithTeams[] = [];
  predictions: any = {};
  saving: any = {};
  loading = true;
  currentUserId: string = '';

  constructor(
    private matchService: MatchService,
    private predictionService: PredictionService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUserId = user.id;
        this.loadMatches();
      }
    });
  }

  loadMatches(): void {
    this.matchService.getAllMatches().subscribe({
      next: (matches) => {
        this.matches = matches;
        this.loadPredictions();
      },
      error: (error) => {
        console.error('Error loading matches:', error);
        this.loading = false;
      }
    });
  }

  loadPredictions(): void {
    this.predictionService.getUserPredictions(this.currentUserId).subscribe({
      next: (userPredictions) => {
        this.matches.forEach(match => {
          const pred = userPredictions.find((p: any) => p.match_id === match.id);
          this.predictions[match.id] = pred ? {
            home: pred.home_score,
            away: pred.away_score,
            points: pred.points
          } : { home: 0, away: 0 };
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading predictions:', error);
        this.loading = false;
      }
    });
  }

  canPredict(match: MatchWithTeams): boolean {
    return this.predictionService.canMakePrediction(match.utc_date, match.status, match.is_locked);
  }

  savePrediction(matchId: number): void {
    this.saving[matchId] = true;
    const pred = this.predictions[matchId];

    this.predictionService.savePrediction(
      this.currentUserId,
      matchId,
      pred.home,
      pred.away
    ).subscribe({
      next: () => {
        this.saving[matchId] = false;
        alert('Predicción guardada exitosamente');
      },
      error: (error) => {
        this.saving[matchId] = false;
        alert('Error al guardar la predicción');
        console.error(error);
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusClass(status: string): string {
    const classes: any = {
      'SCHEDULED': 'bg-blue-100 text-blue-800',
      'IN_PLAY': 'bg-green-100 text-green-800',
      'FINISHED': 'bg-gray-100 text-gray-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  getStatusText(status: string): string {
    const texts: any = {
      'SCHEDULED': 'Programado',
      'IN_PLAY': 'En Juego',
      'FINISHED': 'Finalizado'
    };
    return texts[status] || status;
  }
}

// Made with Bob