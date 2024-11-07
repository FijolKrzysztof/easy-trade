import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-commission-tooltip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="hidden group-hover:block absolute z-50 right-0 w-72 p-2 bg-white shadow-lg rounded-lg border mt-1">
      <div class="text-sm text-gray-600">
        <p class="font-medium mb-1">Commission Structure:</p>
        <ul class="space-y-1 mb-2">
          <li>• Base Commission: 0.0035 per share (min 0.35)</li>
          @if (level === 'intermediate') {
            <li>• Additional fees include exchange, routing, and regulatory fees</li>
          } @else if (level === 'advanced') {
            <li>• Routing Fee: 0.0030 for market orders</li>
            <li>• Exchange Fees: varies by venue</li>
            <li>• SEC: 0.02 per 1,000 of sell orders</li>
            <li>• FINRA TAF: 0.000119 per share</li>
          }
        </ul>
      </div>
    </div>
  `
})
export class CommissionTooltipComponent {
  @Input() level: string = 'beginner';
}
