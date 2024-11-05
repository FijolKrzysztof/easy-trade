import { inject, Injectable } from '@angular/core';
import { AccountService } from './account.service';
import { PortfolioService } from './portfolio.service';
import { BehaviorSubject } from 'rxjs';
import { TradeOrder } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class TradeService {
  readonly accountService = inject(AccountService);
  readonly portfolioService = inject(PortfolioService);

  private readonly isProcessingSubject = new BehaviorSubject<boolean>(false);

  isProcessing$ = this.isProcessingSubject.asObservable();

  executeOrder(order: TradeOrder): boolean {
    this.isProcessingSubject.next(true);

    const validation = this.validateOrder(order);
    if (!validation.isValid) {
      this.isProcessingSubject.next(false);
      throw new Error(validation.message);
    }

    try {
      const tradeValue = order.shares * order.price;

      if (order.type === 'buy') {
        this.accountService.updateBalance(-tradeValue);
      } else {
        this.accountService.updateBalance(tradeValue);
      }

      this.portfolioService.updatePortfolio(order);
      this.isProcessingSubject.next(false);
      return true;
    } catch (error) {
      this.isProcessingSubject.next(false);
      throw error;
    }
  }

  validateOrder(order: TradeOrder): { isValid: boolean; message?: string } {
    if (order.shares < 1) {
      return { isValid: false, message: 'Minimum order size is 1 share' };
    }

    if (order.type === 'buy') {
      const totalCost = order.shares * order.price;
      const currentBalance = this.accountService.getBalance();

      if (totalCost > currentBalance) {
        return { isValid: false, message: 'Insufficient funds' };
      }
    }

    if (order.type === 'sell') {
      const position = this.portfolioService.getPosition(order.symbol);
      if (!position || position.shares < order.shares) {
        return { isValid: false, message: 'Insufficient shares' };
      }
    }

    return { isValid: true };
  }
}
