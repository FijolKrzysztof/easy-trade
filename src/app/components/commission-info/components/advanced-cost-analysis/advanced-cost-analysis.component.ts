import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-advanced-cost-analysis',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mb-3" *ngIf="amount > 0">
      <div class="text-sm font-medium text-blue-800 mb-2">Cost Analysis</div>
      <div class="grid grid-cols-2 gap-x-4 gap-y-1">
        <span class="text-gray-600">Cost per Share:</span>
        <span class="text-right font-medium">{{ metrics.costPerShare.toFixed(4) }}</span>

        <span class="text-gray-600">Fees % of Trade:</span>
        <span class="text-right font-medium">{{ metrics.feesPercentage.toFixed(2) }}%</span>

        <span class="text-gray-600">Break-even Change:</span>
        <span class="text-right font-medium">{{ metrics.breakEvenChange.toFixed(2) }}%</span>
      </div>
    </div>
  `
})
export class AdvancedCostAnalysisComponent {
  @Input() amount: number = 0;
  @Input() metrics: any = {};
}
