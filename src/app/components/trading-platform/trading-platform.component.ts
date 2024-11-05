import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TopNavigationComponent } from '../top-navigation/top-navigation.component';
import { NotificationBannerComponent } from '../notification-banner/notification-banner.component';
import { NavigationMenuComponent } from '../navigation-menu/navigation-menu.component';
import { ChartPanelComponent } from '../chart-panel/chart-panel.component';
import { TradingPanelComponent } from '../trading-panel/trading-panel.component';
import { LearningCardsComponent } from '../learning-cards/learning-cards.component';
import { TradeOrder } from '../../models/types';
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
          (orderSubmit)="executeOrder($event)"
        />
      </div>

      <app-learning-cards
        [cards]="learningCards()"
        (cardAction)="navigateToSection($event)"
      />
    </div>
  `
})
export class TradingPlatformComponent {
  readonly router = inject(Router);

  showNotification = signal(true);
  selectedDifficulty: 'beginner' | 'intermediate' | 'advanced' = 'beginner';

  learningCards = signal([
    {
      title: 'Getting Started',
      icon: `<i class="pi pi-play text-blue-500"></i>`,
      progress: 65,
      actionText: 'Continue learning',
      route: '/learn/getting-started'
    },
    {
      title: 'Market Analysis',
      icon: `<i class="pi pi-chart-line text-blue-500"></i>`,
      description: 'Learn how to analyze stocks',
      actionText: 'Start course',
      route: '/learn/market-analysis'
    },
    {
      title: 'Community Tips',
      icon: `<i class="pi pi-users text-blue-500"></i>`,
      stats: 'Active users: 1,234',
      actionText: 'Join discussion',
      route: '/community/tips'
    },
    {
      title: 'Achievements',
      icon: `<i class="pi pi-star-fill text-blue-500"></i>`,
      stats: '2/10 badges earned',
      actionText: 'View all',
      route: '/achievements'
    }
  ]);

  onDifficultyChange(level: string) {
    this.selectedDifficulty = level as 'beginner' | 'intermediate' | 'advanced';
  }

  executeOrder(order: TradeOrder): void {
    console.log('Executing order:', order);
  }

  navigateToSection(route: string): void {
    this.router.navigate([route]);
  }
}
