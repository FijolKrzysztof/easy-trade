import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommissionService } from '../../services/commission.service';
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
  template: `
    <div class="p-3 bg-blue-50 rounded-lg">
      <!-- Header -->
      <div class="flex items-center justify-between mb-2">
        <span class="font-medium text-blue-900">
          {{ level === 'beginner' ? 'Trading Costs' : 'Commission & Fees' }}
        </span>
        @if (level !== 'beginner') {
          <div class="flex items-center gap-2">
            <div class="relative group">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="text-blue-500 cursor-help"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <app-commission-tooltip [level]="level" />
            </div>
            <button
              class="text-blue-500 hover:text-blue-600"
              (click)="isExpanded = !isExpanded"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                [class.rotate-180]="isExpanded"
                class="transition-transform duration-200"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          </div>
        }
      </div>

      <!-- Content -->
      <div class="space-y-2 text-sm">
        <!-- Beginner View -->
        @if (level === 'beginner') {
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-gray-600">Trade Value:</span>
              <span class="font-medium text-gray-900">{{ estimatedValue.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Trading Costs:</span>
              <span class="font-medium text-gray-900">{{ totalFees.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-blue-900 font-medium">
              <span>Total Cost:</span>
              <span>{{ totalCost.toFixed(2) }}</span>
            </div>
          </div>
        }

        <!-- Intermediate View -->
        @if (level === 'intermediate') {
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-gray-600">Trade Value:</span>
              <span class="font-medium text-gray-900">{{ estimatedValue.toFixed(2) }}</span>
            </div>

            @if (isExpanded) {
              <div class="flex justify-between">
                <span class="text-gray-600">Shares:</span>
                <span class="font-medium text-gray-900">{{ amount }}</span>
              </div>

              <div class="flex justify-between">
                <span class="text-gray-600">Base Commission:</span>
                <span class="font-medium text-gray-900">{{ commission.toFixed(2) }}</span>
              </div>

              <div class="flex justify-between">
                <span class="text-gray-600">Other Fees:</span>
                <span class="font-medium text-gray-900">{{ otherFees.toFixed(2) }}</span>
              </div>
            }

            <div class="flex justify-between text-blue-800 font-medium border-t border-blue-200 pt-2">
              <span>Total Fees:</span>
              <span>{{ totalFees.toFixed(2) }}</span>
            </div>

            <div class="flex justify-between text-blue-900 font-medium">
              <span>Total Transaction Value:</span>
              <span>{{ totalCost.toFixed(2) }}</span>
            </div>
          </div>
        }

        <!-- Advanced View -->
        @if (level === 'advanced') {
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-gray-600">Trade Value:</span>
              <span class="font-medium text-gray-900">{{ estimatedValue.toFixed(2) }}</span>
            </div>

            @if (isExpanded) {
              <!-- Detailed Breakdown -->
              <div class="border-t border-blue-100 pt-2 mt-2">
                <div class="mb-3">
                  <div class="text-sm font-medium text-blue-800 mb-2">Fee Breakdown</div>
                  <div class="grid grid-cols-2 gap-x-4 gap-y-1">
                    <span class="text-gray-600">Shares:</span>
                    <span class="text-right font-medium">{{ amount }}</span>

                    <span class="text-gray-600">Base Commission:</span>
                    <span class="text-right font-medium">{{ commission.toFixed(2) }}</span>

                    @if (showExchangeFee) {
                      <span class="text-gray-600">Exchange & Routing:</span>
                      <span class="text-right font-medium">{{ exchangeFee.toFixed(2) }}</span>
                    }

                    <span class="text-gray-600">Regulatory Fees:</span>
                    <span class="text-right font-medium">{{ regulatoryFees.toFixed(2) }}</span>
                  </div>
                </div>

                <app-advanced-cost-analysis
                  [amount]="amount"
                  [metrics]="costMetrics"
                />

                <app-order-type-comparison
                  [orderCosts]="orderTypeCosts"
                />
              </div>
            }

            <!-- Totals -->
            <div class="flex justify-between text-blue-800 font-medium border-t border-blue-200 pt-2">
              <span>Total Fees:</span>
              <span>{{ totalFees.toFixed(2) }}</span>
            </div>

            <div class="flex justify-between text-blue-900 font-medium">
              <span>Total Transaction Value:</span>
              <span>{{ totalCost.toFixed(2) }}</span>
            </div>
          </div>
        }
      </div>

      <!-- Footer -->
      @if (amount >= 10000 && level !== 'beginner') {
        <div class="mt-2 text-xs text-green-600">
          Volume tier discount applied
        </div>
      }
    </div>
  `
})
export class CommissionInfoComponent {
  @Input() level: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
  @Input() orderType: string = 'market';
  @Input() estimatedValue: number = 0;
  @Input() amount: number = 0;

  isExpanded = false;

  constructor(private commissionService: CommissionService) {}

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
