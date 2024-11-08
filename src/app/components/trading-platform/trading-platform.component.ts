import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TopNavigationComponent } from '../top-navigation/top-navigation.component';
import { NotificationBannerComponent } from '../notification-banner/notification-banner.component';
import { NavigationMenuComponent } from '../navigation-menu/navigation-menu.component';
import { ChartPanelComponent } from '../trading-panel/components/chart-panel/chart-panel.component';
import { TradingPanelComponent } from '../trading-panel/trading-panel.component';
import { LearningCardsComponent } from '../learning-cards/learning-cards.component';
import { DifficultySelectorComponent } from '../difficulty-selector/difficulty-selector.component';

@Component({
  selector: 'app-easy-trade',
  standalone: true,
  imports: [
    CommonModule,
    TopNavigationComponent,
    NotificationBannerComponent,
    NavigationMenuComponent,
    ChartPanelComponent,
    TradingPanelComponent,
    LearningCardsComponent,
    DifficultySelectorComponent
  ],
  template: `
    <div class="min-h-screen bg-slate-50 p-4">
      <app-top-navigation />

      @if (showNotification()) {
        <app-notification-banner
          message="Welcome! Complete your first lesson and get a $10 trading bonus!"
          (close)="showNotification.set(false)"
        />
      }

      <app-navigation-menu />

      <app-difficulty-selector
        (levelChange)="onDifficultyChange($event)"
      ></app-difficulty-selector>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div class="lg:col-span-2">
          <app-chart-panel />
        </div>

        <app-trading-panel
          [difficultyLevel]="selectedDifficulty"
        />
      </div>

      <app-learning-cards />
    </div>
  `
})
export class TradingPlatformComponent {
  readonly router = inject(Router);

  showNotification = signal(true);
  selectedDifficulty: 'beginner' | 'intermediate' | 'advanced' = 'beginner';

  onDifficultyChange(level: string) {
    this.selectedDifficulty = level as 'beginner' | 'intermediate' | 'advanced';
  }
}
