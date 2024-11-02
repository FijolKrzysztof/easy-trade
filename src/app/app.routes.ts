import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/trading-platform/trading-platform.component')
      .then(c => c.TradingPlatformComponent),
  },
  // {
  //   path: 'dashboard',
  //   loadComponent: () => import('./pages/dashboard/dashboard.component')
  //     .then(m => m.DashboardComponent)
  // },
  // {
  //   path: 'learn',
  //   loadComponent: () => import('./pages/learning/learning.component')
  //     .then(m => m.LearningComponent)
  // },
  // {
  //   path: 'technical-analysis',
  //   loadComponent: () => import('./pages/technical-analysis/technical-analysis.component')
  //     .then(m => m.TechnicalAnalysisComponent)
  // },
  // {
  //   path: 'fundamental-analysis',
  //   loadComponent: () => import('./pages/fundamental-analysis/fundamental-analysis.component')
  //     .then(m => m.FundamentalAnalysisComponent)
  // },
  // {
    // path: 'hybrid-analysis',
    // loadComponent: () => import('./pages/hybrid-analysis/hybrid-analysis.component')
    //   .then(m => m.HybridAnalysisComponent)
  // }
];
