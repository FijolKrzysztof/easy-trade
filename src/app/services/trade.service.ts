import { inject, Injectable } from '@angular/core';
import { TradeOrder, TradeResult } from '../types/trading';
import { PortfolioService } from './portfolio.service';
import { CommissionService } from './commission.service';

@Injectable({
  providedIn: 'root'
})
export class TradeService {

  readonly portfolioService = inject(PortfolioService);
  readonly commissionService = inject(CommissionService);

  executeMarketOrder(order: TradeOrder): TradeResult {
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

    const commission = this.calculateTotalCommission(order);

    if (order.type === 'buy') {
      this.portfolioService.addPosition(order, commission);
    } else {
      this.portfolioService.reducePosition(order, commission);
    }

    const totalCost = order.type === 'buy'
      ? (order.shares * order.price) + commission
      : (order.shares * order.price) - commission;

    return {
      success: true,
      executionPrice: order.price,
      commission,
      totalCost
    };
  }

  private validateOrder(order: TradeOrder): { isValid: boolean; message?: string } {
    if (order.shares <= 0) {
      return {isValid: false, message: 'Invalid number of shares'};
    }

    if (order.type === 'buy') {
      const commission = this.calculateTotalCommission(order);
      const totalCost = (order.shares * order.price) + commission;

      if (totalCost > this.portfolioService.getCashBalance()) {
        return {isValid: false, message: 'Insufficient funds'};
      }
    }

    if (order.type === 'sell') {
      const position = this.portfolioService.getPosition(order.symbol);
      if (!position || position.shares < order.shares) {
        return {isValid: false, message: 'Insufficient shares'};
      }
    }

    return {isValid: true};
  }

  private calculateTotalCommission(order: TradeOrder): number {
    return this.commissionService.calculateTotalFees({
      shares: order.shares,
      estimatedValue: order.shares * order.price,
      orderType: 'market'
    });
  }
}
