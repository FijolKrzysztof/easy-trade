import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-commission-info',
  standalone: true,
  imports: [CommonModule],
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
    <div class="hidden group-hover:block absolute z-50 right-0 w-72 p-2 bg-white shadow-lg rounded-lg border mt-1">
  <div class="text-sm text-gray-600">
  <p class="font-medium mb-1">Commission Structure:</p>
  <ul class="space-y-1 mb-2">
    <li>• Base Commission: 0.0035 per share (min 0.35)</li>
@if (level === 'intermediate') {
    <li>• Additional fees include exchange, routing, and regulatory fees</li>
  } @else {
    <li>• Routing Fee: 0.0030 for market orders</li>
    <li>• Exchange Fees: varies by venue</li>
    <li>• SEC: 0.02 per 1,000 of sell orders</li>
    <li>• FINRA TAF: 0.000119 per share</li>
  }
  </ul>
  </div>
  </div>
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
  <span class="font-medium text-gray-900">{{ getTotalFees().toFixed(2) }}</span>
  </div>
  <div class="flex justify-between text-blue-900 font-medium">
    <span>Total Cost:</span>
  <span>{{ getTotalCost().toFixed(2) }}</span>
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
    <span class="font-medium text-gray-900">{{ getCommission().toFixed(2) }}</span>
    </div>

    <div class="flex justify-between">
    <span class="text-gray-600">Other Fees:</span>
    <span class="font-medium text-gray-900">{{ getOtherFees().toFixed(2) }}</span>
    </div>
  }

  <div class="flex justify-between text-blue-800 font-medium border-t border-blue-200 pt-2">
    <span>Total Fees:</span>
  <span>{{ getTotalFees().toFixed(2) }}</span>
  </div>

  <div class="flex justify-between text-blue-900 font-medium">
    <span>Total Transaction Value:</span>
  <span>{{ getTotalCost().toFixed(2) }}</span>
  </div>
  </div>
}

<!-- Advanced View -->
@if (level === 'advanced') {
  <div class="space-y-2">
    <!-- Main Info -->
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
    <span class="text-right font-medium">{{ getCommission().toFixed(2) }}</span>

  @if (showExchangeFee()) {
      <span class="text-gray-600">Exchange & Routing:</span>
      <span class="text-right font-medium">{{ getExchangeFee().toFixed(2) }}</span>
    }

    <span class="text-gray-600">Regulatory Fees:</span>
    <span class="text-right font-medium">{{ getRegulatoryFees().toFixed(2) }}</span>
    </div>
    </div>

    <!-- Cost Analysis -->
  <div class="mb-3" *ngIf="amount > 0">
    <div class="text-sm font-medium text-blue-800 mb-2">Cost Analysis</div>
    <div class="grid grid-cols-2 gap-x-4 gap-y-1">
      <span class="text-gray-600">Cost per Share:</span>
      <span class="text-right font-medium">{{ getCostPerShare().toFixed(4) }}</span>

      <span class="text-gray-600">Fees % of Trade:</span>
      <span class="text-right font-medium">{{ getFeesPercentage().toFixed(2) }}%</span>

      <span class="text-gray-600">Break-even Change:</span>
      <span class="text-right font-medium">{{ getBreakEvenChange().toFixed(2) }}%</span>
    </div>
  </div>

    <!-- Order Type Comparison -->
    <div class="mb-3">
    <div class="text-sm font-medium text-blue-800 mb-2">Order Type Cost Comparison</div>
    <div class="grid grid-cols-2 gap-x-4 gap-y-1">
    <span class="text-gray-600">Market Order:</span>
    <span class="text-right font-medium">{{ getOrderTypeCost('market').toFixed(2) }}</span>

    <span class="text-gray-600">Limit Order:</span>
    <span class="text-right font-medium">{{ getOrderTypeCost('limit').toFixed(2) }}</span>

    <span class="text-gray-600">Stop Order:</span>
    <span class="text-right font-medium">{{ getOrderTypeCost('stop').toFixed(2) }}</span>
    </div>
    </div>
    </div>
  }

  <!-- Totals -->
  <div class="flex justify-between text-blue-800 font-medium border-t border-blue-200 pt-2">
    <span>Total Fees:</span>
  <span>{{ getTotalFees().toFixed(2) }}</span>
  </div>

  <div class="flex justify-between text-blue-900 font-medium">
    <span>Total Transaction Value:</span>
  <span>{{ getTotalCost().toFixed(2) }}</span>
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
  `,
})
export class CommissionInfoComponent {
  @Input() level: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
  @Input() orderType: string = 'market';
  @Input() estimatedValue: number = 0;
  @Input() amount: number = 0;

  isExpanded = false;

  // Basic fee calculations
  getCommission(): number {
    const perShareRate = 0.0035;
    const commission = this.amount * perShareRate;
    return Math.max(commission, 0.35);
  }

  showExchangeFee(): boolean {
    return this.orderType === 'market' || this.amount >= 10000;
  }

  getExchangeFee(): number {
    if (!this.showExchangeFee()) return 0;
    if (this.orderType === 'market') return this.amount * 0.0030;
    if (this.amount >= 10000) return this.amount * 0.0002;
    return 0;
  }

  getRegulatoryFees(): number {
    let fees = 0;
    fees += this.amount * 0.000119;  // FINRA TAF
    fees += (this.estimatedValue / 1000) * 0.02;  // SEC fee
    return fees;
  }

  // Advanced calculations
  getCostPerShare(): number {
    return this.getTotalFees() / this.amount;
  }

  getFeesPercentage(): number {
    return (this.getTotalFees() / this.estimatedValue) * 100;
  }

  getBreakEvenChange(): number {
    return (this.getTotalFees() / this.estimatedValue) * 100;
  }

  getOrderTypeCost(type: string): number {
    const currentType = this.orderType;
    this.orderType = type;
    const cost = this.getTotalFees();
    this.orderType = currentType;
    return cost;
  }

  // Aggregated calculations
  getOtherFees(): number {
    return this.getExchangeFee() + this.getRegulatoryFees();
  }

  getTotalFees(): number {
    return this.getCommission() +
           this.getExchangeFee() +
           this.getRegulatoryFees();
  }

  getTotalCost(): number {
    return this.estimatedValue + this.getTotalFees();
  }
}
