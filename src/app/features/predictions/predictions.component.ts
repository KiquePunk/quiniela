import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatchService } from '../../core/services/match.service';
import { PredictionService } from '../../core/services/prediction.service';
import { AuthService } from '../../core/services/auth.service';
import { MatchStage, MatchWithTeams } from '../../core/models/match.model';

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
            <div class="bg-white rounded-lg shadow-md p-4">
              <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 class="text-lg font-semibold text-gray-900">Filtrar partidos</h2>
                  <p class="text-sm text-gray-500">Selecciona la jornada o fase que deseas capturar.</p>
                </div>

                <select
                  [(ngModel)]="selectedFilter"
                  class="w-full sm:w-80 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none"
                >
                  @for (option of filterOptions; track option.value) {
                    <option [value]="option.value">{{ option.label }}</option>
                  }
                </select>
              </div>
            </div>

            @if (filteredMatches.length === 0) {
              <div class="bg-white rounded-lg shadow-md p-8 text-center">
                <p class="text-gray-500">No hay partidos para la opción seleccionada.</p>
              </div>
            } @else {
              <div class="space-y-6">
                @for (group of groupedFilteredMatches; track group.label) {
                  <section class="space-y-4">
                    <div class="flex items-center justify-between">
                      <h2 class="text-xl font-bold text-gray-900">{{ group.label }}</h2>
                      <span class="text-sm text-gray-500">{{ group.matches.length }} partido(s)</span>
                    </div>

                    <div class="space-y-4">
                      @for (match of group.matches; track match.id) {
                        <div class="bg-white rounded-lg shadow-md p-6">
                          <div class="flex items-center justify-between mb-4">
                            <div class="flex flex-col gap-1">
                              <span class="text-sm text-gray-500">{{ formatDate(match.utc_date) }}</span>
                              <div class="flex flex-wrap gap-2 text-xs">
                                <span class="px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                                  {{ getStageLabel(match.stage) }}
                                </span>
                                @if (match.matchday) {
                                  <span class="px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                                    Jornada {{ match.matchday }}
                                  </span>
                                }
                                @if (match.group) {
                                  <span class="px-2 py-1 rounded-full bg-amber-50 text-amber-700">
                                    {{ formatGroup(match.group) }}
                                  </span>
                                }
                              </div>
                            </div>

                            <span class="px-3 py-1 rounded-full text-xs font-semibold"
                                  [class]="getStatusClass(match.status)">
                              {{ getStatusText(match.status) }}
                            </span>
                          </div>

                          <div class="grid grid-cols-1 gap-6 md:grid-cols-3 md:items-center">
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
                                       [class]="(predictions[match.id]?.points ?? 0) > 0 ? 'text-green-600' : 'text-red-600'">
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
                  </section>
                }
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
  predictions: Record<number, { home: number; away: number; points?: number }> = {};
  saving: Record<number, boolean> = {};
  loading = true;
  currentUserId: string = '';
  selectedFilter = 'JORNADA_1';

  readonly filterOptions = [
    { value: 'JORNADA_1', label: 'Jornada 1' },
    { value: 'JORNADA_2', label: 'Jornada 2' },
    { value: 'JORNADA_3', label: 'Jornada 3' },
    { value: 'LAST_32', label: 'Dieciseisavos de final' },
    { value: 'LAST_16', label: 'Octavos de final' },
    { value: 'QUARTER_FINALS', label: 'Cuartos de final' },
    { value: 'SEMI_FINALS', label: 'Semifinales' },
    { value: 'THIRD_PLACE', label: 'Partido por el 3er lugar' },
    { value: 'FINAL', label: 'Final' }
  ] as const;

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

  get filteredMatches(): MatchWithTeams[] {
    return this.matches.filter(match => this.matchesFilter(match));
  }

  get groupedFilteredMatches(): Array<{ label: string; matches: MatchWithTeams[] }> {
    const groups = new Map<string, MatchWithTeams[]>();

    this.filteredMatches.forEach(match => {
      const key = this.getGroupKey(match);
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)?.push(match);
    });

    return Array.from(groups.entries()).map(([label, matches]) => ({
      label,
      matches
    }));
  }

  private matchesFilter(match: MatchWithTeams): boolean {
    if (this.selectedFilter.startsWith('JORNADA_')) {
      const matchday = Number(this.selectedFilter.split('_').pop());
      return match.stage === 'GROUP_STAGE' && match.matchday === matchday;
    }

    return match.stage === this.selectedFilter;
  }

  private getGroupKey(match: MatchWithTeams): string {
    if (match.stage === 'GROUP_STAGE') {
      return match.group ? this.formatGroup(match.group) : `Jornada ${match.matchday ?? '-'}`;
    }

    return this.getStageLabel(match.stage);
  }

  getStageLabel(stage: MatchStage): string {
    const labels: Record<MatchStage, string> = {
      GROUP_STAGE: 'Fase de grupos',
      LAST_32: 'Dieciseisavos de final',
      LAST_16: 'Octavos de final',
      QUARTER_FINALS: 'Cuartos de final',
      SEMI_FINALS: 'Semifinales',
      THIRD_PLACE: 'Partido por el 3er lugar',
      FINAL: 'Final'
    };

    return labels[stage] || stage;
  }

  formatGroup(group: string): string {
    return group.replace('_', ' ').replace('GROUP', 'Grupo');
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