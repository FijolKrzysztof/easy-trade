import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PortfolioService } from './portfolio.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { PortfolioSnapshot, PositionSnapshot } from '../types/portfolio';

@Injectable({
  providedIn: 'root'
})
export class HistoricalTrackingService {
  private portfolioService = inject(PortfolioService);

  private mockHistoricalData: PortfolioSnapshot[] = [
    {
      timestamp: new Date('2024-01-01'),
      positions: [
        {
          symbol: 'AAPL',
          shares: 10,
          price: 170.5,
          value: 1705.0,
          unrealizedPL: 50.0,
          averagePrice: 165.5
        }
      ],
      totalValue: 1705.0,
      cashBalance: 8000.0,
      unrealizedPL: 50.0,
      totalEquity: 9705.0
    }
  ];

  private historicalDataSubject = new BehaviorSubject<PortfolioSnapshot[]>(this.mockHistoricalData);
  historicalData$ = this.historicalDataSubject.asObservable();
  portfolio = toSignal(this.portfolioService.portfolio$, { initialValue: [] });

  async recordSnapshot(): Promise<void> {
    const currentPortfolio = this.portfolio();
    const portfolioSummary = this.portfolioService.getPortfolioSummary();

    const positions: PositionSnapshot[] = currentPortfolio.map(item => ({
      symbol: item.symbol,
      shares: item.shares,
      price: item.currentPrice,
      value: item.value,
      unrealizedPL: item.unrealizedPL,
      averagePrice: item.averagePrice
    }));

    const newSnapshot: PortfolioSnapshot = {
      timestamp: new Date(),
      positions,
      totalValue: portfolioSummary.totalValue,
      cashBalance: portfolioSummary.cashBalance,
      unrealizedPL: portfolioSummary.unrealizedPL,
      totalEquity: portfolioSummary.totalEquity
    };

    const currentHistory = this.historicalDataSubject.value;
    this.historicalDataSubject.next([...currentHistory, newSnapshot]);
  }

  getValueHistory(period: 'week' | 'month' | 'year' | 'all' = 'all'): PortfolioSnapshot[] {
    const history = this.historicalDataSubject.value;
    const now = new Date();

    switch (period) {
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return history.filter(snapshot => snapshot.timestamp >= weekAgo);
      case 'month':
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        return history.filter(snapshot => snapshot.timestamp >= monthAgo);
      case 'year':
        const yearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
        return history.filter(snapshot => snapshot.timestamp >= yearAgo);
      default:
        return history;
    }
  }

  getPositionHistory(symbol: string): PositionSnapshot[] {
    return this.historicalDataSubject.value
      .map(snapshot => snapshot.positions.find(pos => pos.symbol === symbol))
      .filter((pos): pos is PositionSnapshot => pos !== undefined);
  }

  getGrowthRate(metric: 'totalValue' | 'totalEquity' = 'totalEquity'): number {
    const history = this.historicalDataSubject.value;
    if (history.length < 2) return 0;

    const firstValue = history[0][metric];
    const lastValue = history[history.length - 1][metric];

    return ((lastValue - firstValue) / firstValue) * 100;
  }

  getPerformanceMetrics() {
    const history = this.historicalDataSubject.value;
    if (history.length < 2) {
      return {
        totalReturn: 0,
        unrealizedReturn: 0,
        cashReturn: 0
      };
    }

    const first = history[0];
    const last = history[history.length - 1];

    return {
      totalReturn: ((last.totalEquity - first.totalEquity) / first.totalEquity) * 100,
      unrealizedReturn: ((last.unrealizedPL - first.unrealizedPL) / first.totalEquity) * 100,
      cashReturn: ((last.cashBalance - first.cashBalance) / first.cashBalance) * 100
    };
  }
}
