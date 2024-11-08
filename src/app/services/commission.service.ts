import { Injectable } from '@angular/core';
import { COMMISSION_CONFIG } from '../configs/market-config';

@Injectable({
  providedIn: 'root'
})
export class CommissionService {
  calculateCommission(shares: number): number {
    const commission = shares * COMMISSION_CONFIG.BASE_COMMISSION_RATE;
    return Math.max(commission, COMMISSION_CONFIG.MIN_COMMISSION);
  }

  calculateExchangeFee(shares: number, orderType: string): number {
    if (orderType === 'market') {
      return shares * COMMISSION_CONFIG.MARKET_ORDER_ROUTING_FEE;
    }
    if (shares >= 10000) {
      return shares * COMMISSION_CONFIG.LARGE_TRADE_FEE;
    }
    return 0;
  }

  calculateRegulatoryFees(shares: number, estimatedValue: number): number {
    const finraFee = shares * COMMISSION_CONFIG.FINRA_TAF;
    const secFee = (estimatedValue / 1000) * COMMISSION_CONFIG.SEC_FEE_RATE;
    return finraFee + secFee;
  }

  calculateTotalFees(params: {
    shares: number;
    estimatedValue: number;
    orderType: string;
  }): number {
    const { shares, estimatedValue, orderType } = params;

    return this.calculateCommission(shares) +
      this.calculateExchangeFee(shares, orderType) +
      this.calculateRegulatoryFees(shares, estimatedValue);
  }

  calculateOrderCosts(params: {
    shares: number;
    estimatedValue: number;
    orderTypes: string[];
  }): Record<string, number> {
    const costs: Record<string, number> = {};

    params.orderTypes.forEach(orderType => {
      costs[orderType] = this.calculateTotalFees({
        shares: params.shares,
        estimatedValue: params.estimatedValue,
        orderType
      });
    });

    return costs;
  }

  calculateCostMetrics(params: {
    shares: number;
    estimatedValue: number;
    totalFees: number;
  }): {
    costPerShare: number;
    feesPercentage: number;
    breakEvenChange: number;
  } {
    const { shares, estimatedValue, totalFees } = params;

    return {
      costPerShare: totalFees / shares,
      feesPercentage: (totalFees / estimatedValue) * 100,
      breakEvenChange: (totalFees / estimatedValue) * 100
    };
  }
}
