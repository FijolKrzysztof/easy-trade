import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TopNavigationComponent } from '../top-navigation/top-navigation.component';
import { NotificationBannerComponent } from '../notification-banner/notification-banner.component';
import { NavigationMenuComponent } from '../navigation-menu/navigation-menu.component';
import { ChartPanelComponent } from '../chart-panel/chart-panel.component';
import { TradingPanelComponent } from '../trading-panel/trading-panel.component';
import { LearningCardsComponent } from '../learning-cards/learning-cards.component';
import { NavigationItem, PortfolioItem, TimeframeOption, TradeOrder } from '../../models/types';

@Component({
  selector: 'app-trading-platform',
  standalone: true,
  imports: [
    CommonModule,
    TopNavigationComponent,
    NotificationBannerComponent,
    NavigationMenuComponent,
    ChartPanelComponent,
    TradingPanelComponent,
    LearningCardsComponent
  ],
  template: `
    <div class="min-h-screen bg-slate-50 p-4">
      <app-top-navigation
        [balance]="10000"
        [username]="'John Smith'"
        [notifications]="2"
      />

      <app-notification-banner
        *ngIf="showNotification()"
        message="Welcome! Complete your first lesson and get a $10 trading bonus!"
        (close)="showNotification.set(false)"
      />

      <app-navigation-menu
        [items]="navigationItems()"
        [selectedTab]="selectedTab()"
        (tabChange)="setSelectedTab($event)"
      />

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div class="lg:col-span-2">
          <app-chart-panel
            [timeframes]="timeframes()"
            [selectedTimeframe]="selectedTimeframe()"
            [chartData]="chartData"
            [chartOptions]="chartOptions"
            (timeframeChange)="setTimeframe($event)"
          />
        </div>

        <app-trading-panel
          [portfolioItems]="portfolioItems()"
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
  private router = inject(Router);

  showNotification = signal(true);
  selectedTab = signal('dashboard');
  selectedTimeframe = signal<TimeframeOption>('1D');

  navigationItems = signal<NavigationItem[]>([
    {
      name: 'Dashboard',
      icon: `<i class="pi pi-chart-line"></i>`,
      route: '/dashboard'
    },
    {
      name: 'Learn',
      icon: `<i class="pi pi-book"></i>`,
      route: '/learn'
    },
    {
      name: 'Portfolio',
      icon: `<i class="pi pi-chart-pie"></i>`,
      route: '/portfolio'
    },
    {
      name: 'Community',
      icon: `<i class="pi pi-users"></i>`,
      route: '/community'
    },
    {
      name: 'Help',
      icon: `<i class="pi pi-question-circle"></i>`,
      route: '/help'
    }
  ]);

  timeframes = signal<TimeframeOption[]>(['1D', '1W', '1M']);

  portfolioItems = signal<PortfolioItem[]>([
    {
      symbol: 'AAPL',
      shares: 10,
      change: 2.5,
      value: 1750.00
    },
    {
      symbol: 'MSFT',
      shares: 5,
      change: -0.8,
      value: 1250.00
    }
  ]);

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

  chartData = {
    labels: ['9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'],
    datasets: [{
      label: 'Stock Price',
      data: [100, 102, 101, 103, 105, 104, 106, 108],
      fill: false,
      borderColor: '#2563eb',
      tension: 0.4
    }]
  };

  chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { beginAtZero: false }
    }
  };

  setSelectedTab(tab: string): void {
    this.selectedTab.set(tab);
    const navItem = this.navigationItems().find(item => item.name.toLowerCase() === tab);
    if (navItem) {
      this.router.navigate([navItem.route]);
    }
  }

  setTimeframe(timeframe: TimeframeOption): void {
    this.selectedTimeframe.set(timeframe);
    this.updateChartData(timeframe);
  }

  executeOrder(order: TradeOrder): void {
    console.log('Executing order:', order);
  }

  navigateToSection(route: string): void {
    this.router.navigate([route]);
  }

  private updateChartData(timeframe: TimeframeOption): void {
    const newData = {
      '1D': [100, 102, 101, 103, 105, 104, 106, 108],
      '1W': [100, 103, 102, 106, 105],
      '1M': [100, 105, 108, 110]
    };

    this.chartData.datasets[0].data = newData[timeframe];
  }
}
