import { Injectable } from '@angular/core';

export interface CommissionConfig {
  baseCommissionRate: number;
  minCommission: number;
  marketOrderRoutingFee: number;
  largeTradeFee: number;
  finraTaf: number;
  secFeeRate: number;
}

@Injectable({
  providedIn: 'root'
})
export class CommissionService {
  private readonly defaultConfig: CommissionConfig = {
    baseCommissionRate: 0.0035,
    minCommission: 0.35,
    marketOrderRoutingFee: 0.0030,
    largeTradeFee: 0.0002,
    finraTaf: 0.000119,
    secFeeRate: 0.02
  };

  calculateCommission(shares: number): number {
    const commission = shares * this.defaultConfig.baseCommissionRate;
    return Math.max(commission, this.defaultConfig.minCommission);
  }

  calculateExchangeFee(shares: number, orderType: string): number {
    if (orderType === 'market') {
      return shares * this.defaultConfig.marketOrderRoutingFee;
    }
    if (shares >= 10000) {
      return shares * this.defaultConfig.largeTradeFee;
    }
    return 0;
  }

  calculateRegulatoryFees(shares: number, estimatedValue: number): number {
    const finraFee = shares * this.defaultConfig.finraTaf;
    const secFee = (estimatedValue / 1000) * this.defaultConfig.secFeeRate;
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
