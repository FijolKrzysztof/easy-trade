import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/trading-platform/trading-platform.component')
      .then(c => c.TradingPlatformComponent),
  },
];
