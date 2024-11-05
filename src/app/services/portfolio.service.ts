import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { PortfolioItem, TradeOrder } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  private mockPortfolio: PortfolioItem[] = [
    {
      symbol: 'AAPL',
      shares: 10,
      averagePrice: 175.0,
      currentPrice: 180.0,
      value: 1800.0,
      change: 2.86,
      profitLoss: 50.0
    },
    {
      symbol: 'GOOGL',
      shares: 5,
      averagePrice: 2800.0,
      currentPrice: 2900.0,
      value: 14500.0,
      change: 3.57,
      profitLoss: 500.0
    },
    {
      symbol: 'MSFT',
      shares: 15,
      averagePrice: 320.0,
      currentPrice: 310.0,
      value: 4650.0,
      change: -3.13,
      profitLoss: -150.0
    },
    {
      symbol: 'AMZN',
      shares: 8,
      averagePrice: 135.0,
      currentPrice: 142.0,
      value: 1136.0,
      change: 5.19,
      profitLoss: 56.0
    }
  ];

  private readonly portfolioSubject = new BehaviorSubject<PortfolioItem[]>(this.mockPortfolio);

  portfolio$ = this.portfolioSubject.asObservable();

  updatePortfolio(order: TradeOrder): void {
    const currentPortfolio = this.portfolioSubject.value;
    const existingPosition = currentPortfolio.find(item => item.symbol === order.symbol);

    if (existingPosition) {
      const updatedPosition = this.calculateUpdatedPosition(existingPosition, order);
      const updatedPortfolio = updatedPosition.shares === 0
        ? currentPortfolio.filter(item => item.symbol !== order.symbol)
        : currentPortfolio.map(item => item.symbol === order.symbol ? updatedPosition : item);

      this.portfolioSubject.next(updatedPortfolio);
    } else if (order.type === 'buy') {
      const newPosition: PortfolioItem = {
        symbol: order.symbol,
        shares: order.shares,
        averagePrice: order.price,
        currentPrice: order.price,
        value: order.shares * order.price,
        change: 0,
        profitLoss: 0
      };
      this.portfolioSubject.next([...currentPortfolio, newPosition]);
    }
  }

  private calculateUpdatedPosition(existing: PortfolioItem, order: TradeOrder): PortfolioItem {
    const newShares = order.type === 'buy'
      ? existing.shares + order.shares
      : existing.shares - order.shares;

    if (newShares === 0) return existing;

    const newAveragePrice = order.type === 'buy'
      ? ((existing.averagePrice * existing.shares) + (order.price * order.shares)) / newShares
      : existing.averagePrice;

    return {
      ...existing,
      shares: newShares,
      averagePrice: newAveragePrice,
      currentPrice: order.price,
      value: newShares * order.price,
      profitLoss: (order.price - newAveragePrice) * newShares
    };
  }

  getPosition(symbol: string): PortfolioItem | undefined {
    return this.portfolioSubject.value.find(item => item.symbol === symbol);
  }

  updatePrices(marketPrices: Record<string, number>): void {
    const updatedPortfolio = this.portfolioSubject.value.map(item => {
      const newPrice = marketPrices[item.symbol];
      if (newPrice) {
        return {
          ...item,
          currentPrice: newPrice,
          value: item.shares * newPrice,
          change: ((newPrice - item.averagePrice) / item.averagePrice) * 100,
          profitLoss: (newPrice - item.averagePrice) * item.shares
        };
      }
      return item;
    });

    this.portfolioSubject.next(updatedPortfolio);
  }

  getPortfolioSummary() {
    const portfolio = this.portfolioSubject.value;
    return {
      totalValue: portfolio.reduce((sum, item) => sum + item.value, 0),
      totalProfitLoss: portfolio.reduce((sum, item) => sum + item.profitLoss, 0),
      positions: portfolio.length
    };
  }
}
