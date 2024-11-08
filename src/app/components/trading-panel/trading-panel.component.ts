import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioComponent } from '../portfolio/portfolio.component';
import { BeginnerTradeFormComponent } from './components/beginner-trade-form/beginner-trade-form.component';
import { IntermediateTradeFormComponent } from './components/intermediate-trade-form/intermediate-trade-form.component';
import { AdvancedTradeFormComponent } from './components/advanced-trade-form/advanced-trade-form.component';

@Component({
  selector: 'app-trading-panel',
  standalone: true,
  imports: [
    CommonModule,
    PortfolioComponent,
    BeginnerTradeFormComponent,
    IntermediateTradeFormComponent,
    AdvancedTradeFormComponent
  ],
  template: `
    <div class="space-y-4">
      <div class="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
        <div class="p-4 border-b border-gray-100">
          <h2 class="text-lg font-semibold">Quick Trade</h2>
        </div>
        <div class="p-4">
          @switch (difficultyLevel()) {
            @case ('beginner') {
              <app-beginner-trade-form />
            }
            @case ('intermediate') {
              <app-intermediate-trade-form
                (submitOrder)="submitOrder($event)"
              />
            }
            @case ('advanced') {
              <app-advanced-trade-form
                (submitOrder)="submitOrder($event)"
              />
            }
          }
        </div>
      </div>

      <app-portfolio class="block" />
    </div>
  `
})
export class TradingPanelComponent {
  difficultyLevel = input<'beginner' | 'intermediate' | 'advanced'>('beginner');

  submitOrder(order: { type: 'buy' | 'sell'; data: any }) {
    // TODO: implement
  }
}
