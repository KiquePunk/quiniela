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
            <div class="bg-white rounded-2xl shadow-md p-4 sm:p-6 space-y-4">
              <div class="flex flex-wrap gap-2 rounded-full bg-gray-100 p-1 w-fit">
                @for (tab of tabs; track tab.value) {
                  <button
                    type="button"
                    (click)="selectTab(tab.value)"
                    class="rounded-full px-4 py-2 text-sm font-semibold transition-colors"
                    [class]="selectedTab === tab.value ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-700 hover:bg-white'"
                  >
                    {{ tab.label }}
                  </button>
                }
              </div>

              <div class="flex items-center gap-3">
                <button
                  type="button"
                  (click)="goToPreviousOption()"
                  [disabled]="!hasPreviousOption"
                  class="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-xl text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Anterior"
                >
                  ‹
                </button>

                <div class="flex-1">
                  <select
                    [(ngModel)]="selectedOptionValue"
                    (ngModelChange)="onSelectedOptionChange($event)"
                    class="w-full rounded-2xl border-2 border-indigo-100 bg-white px-4 py-3 text-sm font-medium text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none"
                  >
                    @for (option of currentOptions; track option.value) {
                      <option [value]="option.value">{{ option.label }}</option>
                    }
                  </select>
                </div>

                <button
                  type="button"
                  (click)="goToNextOption()"
                  [disabled]="!hasNextOption"
                  class="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-xl text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Siguiente"
                >
                  ›
                </button>
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
  selectedTab: 'DATE' | 'MATCHDAY' | 'GROUP' = 'MATCHDAY';
  selectedOptionValue = '';

  readonly tabs = [
    { value: 'DATE', label: 'Por fecha' },
    { value: 'MATCHDAY', label: 'Por jornada' },
    { value: 'GROUP', label: 'Por grupo' }
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
        this.initializeFilters();
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

  get dateOptions(): Array<{ value: string; label: string }> {
    const dateMap = new Map<string, string>();

    this.matches.forEach(match => {
      const value = this.getDateKey(match.utc_date);
      if (!dateMap.has(value)) {
        dateMap.set(value, this.formatDateOptionLabel(match.utc_date));
      }
    });

    this.getKnockoutDateKeys().forEach(value => {
      if (!dateMap.has(value)) {
        dateMap.set(value, this.formatDateOptionLabel(`${value}T12:00:00`));
      }
    });

    return Array.from(dateMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([value, label]) => ({ value, label }));
  }

  get matchdayOptions(): Array<{ value: string; label: string }> {
    const options = new Map<string, string>();

    [1, 2, 3].forEach(matchday => {
      options.set(`MATCHDAY_${matchday}`, `Jornada ${matchday}`);
    });

    (['LAST_32', 'LAST_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'THIRD_PLACE', 'FINAL'] as MatchStage[]).forEach(stage => {
      options.set(stage, this.getStageLabel(stage));
    });

    return Array.from(options.entries()).map(([value, label]) => ({ value, label }));
  }

  get groupOptions(): Array<{ value: string; label: string }> {
    const groups = new Map<string, string>();

    this.matches
      .filter(match => !!match.group)
      .forEach(match => {
        if (match.group && !groups.has(match.group)) {
          groups.set(match.group, this.formatGroup(match.group));
        }
      });

    return Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([value, label]) => ({ value, label }));
  }

  get currentOptions(): Array<{ value: string; label: string }> {
    if (this.selectedTab === 'DATE') {
      return this.dateOptions;
    }

    if (this.selectedTab === 'GROUP') {
      return this.groupOptions;
    }

    return this.matchdayOptions;
  }

  get currentOptionIndex(): number {
    return this.currentOptions.findIndex(option => option.value === this.selectedOptionValue);
  }

  get hasPreviousOption(): boolean {
    return this.currentOptionIndex > 0;
  }

  get hasNextOption(): boolean {
    return this.currentOptionIndex >= 0 && this.currentOptionIndex < this.currentOptions.length - 1;
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

  initializeFilters(): void {
    const firstOption = this.currentOptions[0];
    this.selectedOptionValue = firstOption?.value ?? '';
  }

  selectTab(tab: 'DATE' | 'MATCHDAY' | 'GROUP'): void {
    if (this.selectedTab === tab) {
      return;
    }

    this.selectedTab = tab;
    const firstOption = this.currentOptions[0];
    this.selectedOptionValue = firstOption?.value ?? '';
  }

  onSelectedOptionChange(value: string): void {
    this.selectedOptionValue = value;
  }

  goToPreviousOption(): void {
    if (!this.hasPreviousOption) {
      return;
    }

    this.selectedOptionValue = this.currentOptions[this.currentOptionIndex - 1].value;
  }

  goToNextOption(): void {
    if (!this.hasNextOption) {
      return;
    }

    this.selectedOptionValue = this.currentOptions[this.currentOptionIndex + 1].value;
  }

  private matchesFilter(match: MatchWithTeams): boolean {
    if (!this.selectedOptionValue) {
      return true;
    }

    if (this.selectedTab === 'DATE') {
      return this.getDateKey(match.utc_date) === this.selectedOptionValue;
    }

    if (this.selectedTab === 'GROUP') {
      return match.group === this.selectedOptionValue;
    }

    if (this.selectedOptionValue.startsWith('MATCHDAY_')) {
      const matchday = Number(this.selectedOptionValue.split('_').pop());
      return match.stage === 'GROUP_STAGE' && match.matchday === matchday;
    }

    return match.stage === this.selectedOptionValue;
  }

  private getGroupKey(match: MatchWithTeams): string {
    if (this.selectedTab === 'DATE') {
      return this.formatDateGroupLabel(match.utc_date);
    }

    if (this.selectedTab === 'GROUP') {
      return match.group ? this.formatGroup(match.group) : 'Sin grupo';
    }

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

  private getDateKey(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-CA');
  }

  private formatDateOptionLabel(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  }

  private formatDateGroupLabel(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  private getKnockoutDateKeys(): string[] {
    return [
      '2026-06-28',
      '2026-06-29',
      '2026-06-30',
      '2026-07-01',
      '2026-07-02',
      '2026-07-03',
      '2026-07-04',
      '2026-07-05',
      '2026-07-06',
      '2026-07-07',
      '2026-07-09',
      '2026-07-10',
      '2026-07-11',
      '2026-07-14',
      '2026-07-15',
      '2026-07-18',
      '2026-07-19'
    ];
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