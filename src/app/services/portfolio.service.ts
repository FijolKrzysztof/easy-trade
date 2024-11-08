import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PortfolioPosition, PortfolioSummary } from '../types/portfolio';
import { TradeOrder } from '../types/trading';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  private readonly INITIAL_CASH_BALANCE = 10000;
  private readonly portfolioSubject = new BehaviorSubject<PortfolioPosition[]>([]);
  private readonly cashBalanceSubject = new BehaviorSubject<number>(this.INITIAL_CASH_BALANCE);
  private readonly portfolioSummarySubject = new BehaviorSubject<PortfolioSummary>({
    totalValue: 0,
    cashBalance: this.INITIAL_CASH_BALANCE,
    unrealizedPL: 0,
    totalEquity: this.INITIAL_CASH_BALANCE,
    totalReturn: 0
  });

  portfolio$ = this.portfolioSubject.asObservable();
  cashBalance$ = this.cashBalanceSubject.asObservable();
  portfolioSummary$ = this.portfolioSummarySubject.asObservable();

  updateCashBalance(amount: number): void {
    const currentBalance = this.cashBalanceSubject.value;
    const newBalance = currentBalance + amount;
    this.cashBalanceSubject.next(newBalance);
    this.updatePortfolioSummary();
  }

  getCashBalance(): number {
    return this.cashBalanceSubject.value;
  }

  getPosition(symbol: string): PortfolioPosition | undefined {
    return this.portfolioSubject.value.find(p => p.symbol === symbol);
  }

  addPosition(order: TradeOrder, commission: number): void {
    const totalCost = (order.shares * order.price) + commission;
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

    this.updateCashBalance(-totalCost);
  }

  reducePosition(order: TradeOrder, commission: number): void {
    const proceeds = (order.shares * order.price) - commission;
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

    this.updateCashBalance(proceeds);
  }

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
    this.updatePortfolioSummary();
  }

  private updatePosition(updatedPosition: PortfolioPosition): void {
    const currentPortfolio = this.portfolioSubject.value;
    this.portfolioSubject.next(
      currentPortfolio.map(p =>
        p.symbol === updatedPosition.symbol ? updatedPosition : p
      )
    );
    this.updatePortfolioSummary();
  }

  private updatePortfolioSummary(): void {
    const portfolio = this.portfolioSubject.value;
    const totalValue = portfolio.reduce((sum, pos) => sum + pos.value, 0);
    const unrealizedPL = portfolio.reduce((sum, pos) => sum + pos.unrealizedPL, 0);
    const cashBalance = this.cashBalanceSubject.value;
    const currentEquity = totalValue + cashBalance;

    const totalReturn = ((currentEquity - this.INITIAL_CASH_BALANCE) / this.INITIAL_CASH_BALANCE) * 100;

    const summary: PortfolioSummary = {
      totalValue,
      cashBalance,
      unrealizedPL,
      totalEquity: currentEquity,
      totalReturn
    };

    this.portfolioSummarySubject.next(summary);
  }

  getPortfolioSummary(): PortfolioSummary {
    return this.portfolioSummarySubject.value;
  }
}
