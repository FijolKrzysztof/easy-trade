import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TradeOrder } from '../../models/types';
import { PortfolioComponent } from '../portfolio/portfolio.component';
import { BeginnerTradeFormComponent } from '../trading-forms/beginner-trade-form.component';
import { IntermediateTradeFormComponent } from '../trading-forms/intermediate-trade-form.component';
import { AdvancedTradeFormComponent } from '../trading-forms/advanced-trade-form.component';

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
          @switch (difficultyLevel) {
            @case ('beginner') {
              <app-beginner-trade-form
                (submitOrder)="submitOrder($event)"
              />
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
  @Input() difficultyLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
  @Output() orderSubmit = new EventEmitter<TradeOrder>();

  submitOrder(order: { type: 'buy' | 'sell'; data: any }) {
    this.orderSubmit.emit({
      ...order.data,
      type: order.type,
      difficultyLevel: this.difficultyLevel
    });
  }
}
