import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TradeOrder, TradeResult } from '../types/trading';
import { PortfolioService } from './portfolio.service';
import { CommissionService } from './commission.service';

@Injectable({
  providedIn: 'root'
})
export class TradeService {
  private isProcessingSubject = new BehaviorSubject<boolean>(false);
  isProcessing$ = this.isProcessingSubject.asObservable();

  constructor(
    private portfolioService: PortfolioService,
    private commissionService: CommissionService
  ) {}

  executeMarketOrder(order: TradeOrder): TradeResult {
    this.isProcessingSubject.next(true);

    try {
      // 1. Walidacja zamówienia
      const validation = this.validateOrder(order);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.message,
          executionPrice: order.price,
          commission: 0,
          totalCost: 0
        };
      }

      // 2. Obliczenie prowizji
      const commission = this.calculateTotalCommission(order);

      // 3. Wykonanie transakcji
      if (order.type === 'buy') {
        this.portfolioService.addPosition(order, commission);
      } else {
        this.portfolioService.reducePosition(order, commission);
      }

      const totalCost = order.type === 'buy'
        ? (order.shares * order.price) + commission
        : (order.shares * order.price) - commission;

      // 4. Zwrócenie wyniku
      return {
        success: true,
        executionPrice: order.price,
        commission,
        totalCost
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
        executionPrice: order.price,
        commission: 0,
        totalCost: 0
      };
    } finally {
      this.isProcessingSubject.next(false);
    }
  }

  private validateOrder(order: TradeOrder): { isValid: boolean; message?: string } {
    if (order.shares <= 0) {
      return { isValid: false, message: 'Invalid number of shares' };
    }

    if (order.type === 'buy') {
      const commission = this.calculateTotalCommission(order);
      const totalCost = (order.shares * order.price) + commission;

      if (totalCost > this.portfolioService.getCashBalance()) {
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

  private calculateTotalCommission(order: TradeOrder): number {
    return this.commissionService.calculateTotalFees({
      shares: order.shares,
      estimatedValue: order.shares * order.price,
      orderType: 'market'
    });
  }
}
