import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-order-type-comparison',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mb-3">
      <div class="text-sm font-medium text-blue-800 mb-2">Order Type Cost Comparison</div>
      <div class="grid grid-cols-2 gap-x-4 gap-y-1">
        <span class="text-gray-600">Market Order:</span>
        <span class="text-right font-medium">{{ orderCosts['market'].toFixed(2) }}</span>

        <span class="text-gray-600">Limit Order:</span>
        <span class="text-right font-medium">{{ orderCosts['limit'].toFixed(2) }}</span>

        <span class="text-gray-600">Stop Order:</span>
        <span class="text-right font-medium">{{ orderCosts['stop'].toFixed(2) }}</span>
      </div>
    </div>
  `
})
export class OrderTypeComparisonComponent {

  @Input() orderCosts: Record<string, number> = {};
}
