import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PortfolioPosition, PortfolioSummary } from '../types/portfolio';
import { TradeOrder } from '../types/trading';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  private readonly portfolioSubject = new BehaviorSubject<PortfolioPosition[]>([]);
  private readonly cashBalanceSubject = new BehaviorSubject<number>(10000); // początkowa gotówka

  portfolio$ = this.portfolioSubject.asObservable();
  cashBalance$ = this.cashBalanceSubject.asObservable();

  updateCashBalance(amount: number): void {
    const currentBalance = this.cashBalanceSubject.value;
    this.cashBalanceSubject.next(currentBalance + amount);
  }

  getCashBalance(): number {
    return this.cashBalanceSubject.value;
  }

  getPosition(symbol: string): PortfolioPosition | undefined {
    return this.portfolioSubject.value.find(p => p.symbol === symbol);
  }

  addPosition(order: TradeOrder, commission: number): void {
    const totalCost = (order.shares * order.price) + commission;
    this.updateCashBalance(-totalCost);

    const currentPortfolio = this.portfolioSubject.value;
    const existingPosition = currentPortfolio.find(p => p.symbol === order.symbol);

    if (existingPosition) {
      const totalShares = existingPosition.shares + order.shares;
      const totalCostBasis = (existingPosition.shares * existingPosition.averagePrice) +
        (order.shares * order.price);
      const newAveragePrice = totalCostBasis / totalShares;

      const updatedPosition: PortfolioPosition = {
        ...existingPosition,
        shares: totalShares,
        averagePrice: newAveragePrice,
        currentPrice: order.price,
        value: totalShares * order.price,
        unrealizedPL: (order.price - newAveragePrice) * totalShares
      };

      this.updatePosition(updatedPosition);
    } else {
      const newPosition: PortfolioPosition = {
        symbol: order.symbol,
        shares: order.shares,
        averagePrice: order.price,
        currentPrice: order.price,
        value: order.shares * order.price,
        unrealizedPL: 0
      };

      this.portfolioSubject.next([...currentPortfolio, newPosition]);
    }
  }

  reducePosition(order: TradeOrder, commission: number): void {
    const proceeds = (order.shares * order.price) - commission;
    this.updateCashBalance(proceeds);

    const currentPortfolio = this.portfolioSubject.value;
    const existingPosition = currentPortfolio.find(p => p.symbol === order.symbol);

    if (!existingPosition) {
      throw new Error('Position not found');
    }

    const remainingShares = existingPosition.shares - order.shares;

    if (remainingShares === 0) {
      this.portfolioSubject.next(
        currentPortfolio.filter(p => p.symbol !== order.symbol)
      );
    } else {
      const updatedPosition: PortfolioPosition = {
        ...existingPosition,
        shares: remainingShares,
        currentPrice: order.price,
        value: remainingShares * order.price,
        unrealizedPL: (order.price - existingPosition.averagePrice) * remainingShares
      };

      this.updatePosition(updatedPosition);
    }
  }

  // Nowa metoda do aktualizacji cen z symulacji
  updateMarketPrices(prices: { [symbol: string]: number }): void {
    const currentPortfolio = this.portfolioSubject.value;
    if (currentPortfolio.length === 0) return;

    const updatedPortfolio = currentPortfolio.map(position => {
      const newPrice = prices[position.symbol];
      if (newPrice) {
        return {
          ...position,
          currentPrice: newPrice,
          value: position.shares * newPrice,
          unrealizedPL: (newPrice - position.averagePrice) * position.shares
        };
      }
      return position;
    });

    this.portfolioSubject.next(updatedPortfolio);
  }

  private updatePosition(updatedPosition: PortfolioPosition): void {
    const currentPortfolio = this.portfolioSubject.value;
    this.portfolioSubject.next(
      currentPortfolio.map(p =>
        p.symbol === updatedPosition.symbol ? updatedPosition : p
      )
    );
  }

  getPortfolioSummary(): PortfolioSummary {
    const portfolio = this.portfolioSubject.value;
    const totalValue = portfolio.reduce((sum, pos) => sum + pos.value, 0);
    const unrealizedPL = portfolio.reduce((sum, pos) => sum + pos.unrealizedPL, 0);

    return {
      totalValue,
      cashBalance: this.cashBalanceSubject.value,
      unrealizedPL,
      totalEquity: totalValue + this.cashBalanceSubject.value
    };
  }
}
