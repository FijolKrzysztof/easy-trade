import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioComponent } from '../portfolio/portfolio.component';
import { TradeFormBeginnerComponent } from './components/trade-form-beginner/trade-form-beginner.component';
import { TradeFormIntermediateComponent } from './components/trade-form-intermediate/trade-form-intermediate.component';
import { TradeFormAdvancedComponent } from './components/trade-form-advanced/trade-form-advanced.component';

@Component({
  selector: 'app-trading-panel',
  standalone: true,
  imports: [
    CommonModule,
    PortfolioComponent,
    TradeFormBeginnerComponent,
    TradeFormIntermediateComponent,
    TradeFormAdvancedComponent
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
              <app-trade-form-beginner />
            }
            @case ('intermediate') {
              <app-trade-form-intermediate />
            }
            @case ('advanced') {
              <app-trade-form-advanced />
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
