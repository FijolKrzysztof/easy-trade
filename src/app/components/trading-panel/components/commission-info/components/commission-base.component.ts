import { Directive, inject, input } from '@angular/core';
import { CommissionService } from '../../../../../services/commission.service';

@Directive()
export abstract class CommissionBaseComponent {
  readonly commissionService = inject(CommissionService);

  orderType = input<string>('market');
  estimatedValue = input<number>(0);
  amount = input<number>(0);

  isExpanded = false;

  get commission(): number {
    return this.commissionService.calculateCommission(this.amount());
  }

  get exchangeFee(): number {
    return this.commissionService.calculateExchangeFee(this.amount(), this.orderType());
  }

  get regulatoryFees(): number {
    return this.commissionService.calculateRegulatoryFees(this.amount(), this.estimatedValue());
  }

  get showExchangeFee(): boolean {
    return this.orderType() === 'market' || this.amount() >= 10000;
  }

  get otherFees(): number {
    return this.exchangeFee + this.regulatoryFees;
  }

  get totalFees(): number {
    return this.commissionService.calculateTotalFees({
      shares: this.amount(),
      estimatedValue: this.estimatedValue(),
      orderType: this.orderType()
    });
  }

  get totalCost(): number {
    return this.estimatedValue() + this.totalFees;
  }

  get costMetrics() {
    return this.commissionService.calculateCostMetrics({
      shares: this.amount(),
      estimatedValue: this.estimatedValue(),
      totalFees: this.totalFees
    });
  }

  get orderTypeCosts(): Record<string, number> {
    return this.commissionService.calculateOrderCosts({
      shares: this.amount(),
      estimatedValue: this.estimatedValue(),
      orderTypes: ['market', 'limit', 'stop']
    });
  }

  get tooltipLines(): string[] {
    return this.getTooltipContent(this.constructor.name.includes('Advanced') ? 'advanced' : 'intermediate').split('\n');
  }

  protected getTooltipContent(level: string): string {
    const baseContent = '• Base Commission: 0.0035 per share (min 0.35)';

    switch (level) {
      case 'intermediate':
        return `${baseContent}\n• Additional fees include exchange, routing, and regulatory fees`;
      case 'advanced':
        return `${baseContent}
          • Routing Fee: 0.0030 for market orders
          • Exchange Fees: varies by venue
          • SEC: 0.02 per 1,000 of sell orders
          • FINRA TAF: 0.000119 per share`;
      default:
        return baseContent;
    }
  }
}
