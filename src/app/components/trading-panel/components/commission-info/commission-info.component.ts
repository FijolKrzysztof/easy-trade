import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommissionService } from '../../../../services/commission.service';
import { CommissionTooltipComponent } from './components/commission-tooltip/commission-tooltip.component';
import { OrderTypeComparisonComponent } from './components/order-type-comparison/order-type-comparison.component';
import { AdvancedCostAnalysisComponent } from './components/advanced-cost-analysis/advanced-cost-analysis.component';

@Component({
  selector: 'app-commission-info',
  standalone: true,
  imports: [
    CommonModule,
    CommissionTooltipComponent,
    OrderTypeComparisonComponent,
    AdvancedCostAnalysisComponent,
  ],
  templateUrl: 'commission-info.component.html',
})
export class CommissionInfoComponent {
  readonly commissionService = inject(CommissionService);

  @Input() level: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
  @Input() orderType: string = 'market';
  @Input() estimatedValue: number = 0;
  @Input() amount: number = 0;

  isExpanded = false;

  get commission(): number {
    return this.commissionService.calculateCommission(this.amount);
  }

  get exchangeFee(): number {
    return this.commissionService.calculateExchangeFee(this.amount, this.orderType);
  }

  get regulatoryFees(): number {
    return this.commissionService.calculateRegulatoryFees(this.amount, this.estimatedValue);
  }

  get showExchangeFee(): boolean {
    return this.orderType === 'market' || this.amount >= 10000;
  }

  get otherFees(): number {
    return this.exchangeFee + this.regulatoryFees;
  }

  get totalFees(): number {
    return this.commissionService.calculateTotalFees({
      shares: this.amount,
      estimatedValue: this.estimatedValue,
      orderType: this.orderType
    });
  }

  get totalCost(): number {
    return this.estimatedValue + this.totalFees;
  }

  get costMetrics() {
    return this.commissionService.calculateCostMetrics({
      shares: this.amount,
      estimatedValue: this.estimatedValue,
      totalFees: this.totalFees
    });
  }

  get orderTypeCosts(): Record<string, number> {
    return this.commissionService.calculateOrderCosts({
      shares: this.amount,
      estimatedValue: this.estimatedValue,
      orderTypes: ['market', 'limit', 'stop']
    });
  }
}
