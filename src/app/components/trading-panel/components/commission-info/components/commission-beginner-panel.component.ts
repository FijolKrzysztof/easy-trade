import { CommissionBaseComponent } from './commission-base.component';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-commission-beginner-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-3 bg-blue-50 rounded-lg">
      <div class="flex items-center justify-between mb-2">
          <span class="font-medium text-blue-900">
            Trading Costs
          </span>
      </div>
      <div class="space-y-2 text-sm">
        <div class="flex justify-between">
          <span class="text-gray-600">Trade Value:</span>
          <span class="font-medium text-gray-900">{{ estimatedValue().toFixed(2) }}</span>
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
    </div>
  `
})
export class CommissionBeginnerPanelComponent extends CommissionBaseComponent {
}
