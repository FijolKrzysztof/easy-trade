import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommissionBaseComponent } from './commission-base.component';

@Component({
  selector: 'app-commission-advanced-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-3 bg-blue-50 rounded-lg">
      <div class="flex items-center justify-between mb-2">
        <span class="font-medium text-blue-900">Commission & Fees</span>
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
            <div
              class="hidden group-hover:block absolute z-50 right-0 w-72 p-2 bg-white shadow-lg rounded-lg border mt-1">
              <div class="text-sm text-gray-600">
                <p class="font-medium mb-1">Commission Structure:</p>
                <ul class="space-y-1 mb-2">
                  @for (line of tooltipLines; track line) {
                    <li>{{ line }}</li>
                  }
                </ul>
              </div>
            </div>
          </div>
          <button (click)="isExpanded = !isExpanded">
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
      </div>

      <div class="space-y-2 text-sm">
        <div class="flex justify-between">
          <span class="text-gray-600">Trade Value:</span>
          <span class="font-medium text-gray-900">{{ estimatedValue().toFixed(2) }}</span>
        </div>

        @if (isExpanded) {
          <div class="border-t border-blue-100 pt-2 mt-2">
            <div class="text-sm font-medium text-blue-800 mb-2">Fee Breakdown</div>
            <div class="grid grid-cols-2 gap-x-4 gap-y-1">
              <span class="text-gray-600">Base Commission:</span>
              <span class="text-right font-medium">{{ commission.toFixed(2) }}</span>

              @if (showExchangeFee) {
                <span class="text-gray-600">Exchange & Routing:</span>
                <span class="text-right font-medium">{{ exchangeFee.toFixed(2) }}</span>
              }

              <span class="text-gray-600">Regulatory Fees:</span>
              <span class="text-right font-medium">{{ regulatoryFees.toFixed(2) }}</span>
            </div>

            @if (amount() > 0) {
              <div class="mb-3">
                <div class="text-sm font-medium text-blue-800 mb-2">Cost Analysis</div>
                <div class="grid grid-cols-2 gap-x-4 gap-y-1">
                  <span class="text-gray-600">Cost per Share:</span>
                  <span class="text-right font-medium">{{ costMetrics.costPerShare.toFixed(4) }}</span>

                  <span class="text-gray-600">Fees % of Trade:</span>
                  <span class="text-right font-medium">{{ costMetrics.feesPercentage.toFixed(2) }}%</span>

                  <span class="text-gray-600">Break-even Change:</span>
                  <span class="text-right font-medium">{{ costMetrics.breakEvenChange.toFixed(2) }}%</span>
                </div>
              </div>
            }

            <div class="mb-3">
              <div class="text-sm font-medium text-blue-800 mb-2">Order Type Cost Comparison</div>
              <div class="grid grid-cols-2 gap-x-4 gap-y-1">
                <span class="text-gray-600">Market Order:</span>
                <span class="text-right font-medium">{{ orderTypeCosts['market'].toFixed(2) }}</span>

                <span class="text-gray-600">Limit Order:</span>
                <span class="text-right font-medium">{{ orderTypeCosts['limit'].toFixed(2) }}</span>

                <span class="text-gray-600">Stop Order:</span>
                <span class="text-right font-medium">{{ orderTypeCosts['stop'].toFixed(2) }}</span>
              </div>
            </div>
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
    </div>
  `
})
export class CommissionAdvancedPanelComponent extends CommissionBaseComponent {}
