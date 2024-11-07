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
          change: 0
        },
        {
          symbol: 'GOOGL',
          shares: 5,
          price: 2750.0,
          value: 13750.0,
          change: 0
        }
      ],
      totalValue: 15455.0
    },
    {
      timestamp: new Date('2024-02-01'),
      positions: [
        {
          symbol: 'AAPL',
          shares: 10,
          price: 175.5,
          value: 1755.0,
          change: 2.93
        },
        {
          symbol: 'GOOGL',
          shares: 5,
          price: 2850.0,
          value: 14250.0,
          change: 3.64
        },
        {
          symbol: 'MSFT',
          shares: 8,
          price: 310.0,
          value: 2480.0,
          change: 0
        }
      ],
      totalValue: 18485.0
    },
    {
      timestamp: new Date('2024-03-01'),
      positions: [
        {
          symbol: 'AAPL',
          shares: 15,
          price: 180.5,
          value: 2707.5,
          change: 54.27
        },
        {
          symbol: 'GOOGL',
          shares: 5,
          price: 2900.0,
          value: 14500.0,
          change: 1.75
        },
        {
          symbol: 'MSFT',
          shares: 8,
          price: 315.0,
          value: 2520.0,
          change: 1.61
        }
      ],
      totalValue: 19727.5
    }
  ];

  private historicalDataSubject = new BehaviorSubject<PortfolioSnapshot[]>(this.mockHistoricalData);
  historicalData$ = this.historicalDataSubject.asObservable();
  portfolio = toSignal(this.portfolioService.portfolio$, { initialValue: [] });

  async recordSnapshot(): Promise<void> {
    const currentPortfolio = this.portfolio();
    const totalValue = currentPortfolio.reduce((sum, item) => sum + item.value, 0);

    const positions: PositionSnapshot[] = currentPortfolio.map(item => ({
      symbol: item.symbol,
      shares: item.shares,
      price: item.currentPrice,
      value: item.value,
      change: item.change
    }));

    const newSnapshot: PortfolioSnapshot = {
      timestamp: new Date(),
      positions,
      totalValue
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

  getGrowthRate(): number {
    const history = this.historicalDataSubject.value;
    if (history.length < 2) return 0;

    const firstValue = history[0].totalValue;
    const lastValue = history[history.length - 1].totalValue;

    return ((lastValue - firstValue) / firstValue) * 100;
  }
}
