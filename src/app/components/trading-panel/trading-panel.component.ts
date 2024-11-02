import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PortfolioItem, TradeOrder } from '../../models/types';

@Component({
  selector: 'app-trading-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-4">
      <div class="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
        <div class="p-4 border-b border-gray-100">
          <h2 class="text-lg font-semibold">Quick Trade</h2>
        </div>
        <div class="p-4">
          <form [formGroup]="tradeForm" class="space-y-3">
            <div>
              <label class="text-sm text-gray-600 mb-1 block">Stock Symbol</label>
              <input
                type="text"
                formControlName="symbol"
                class="w-full p-2 border rounded bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
                placeholder="Enter stock symbol..."
              />
            </div>
            <div>
              <label class="text-sm text-gray-600 mb-1 block">Amount</label>
              <input
                type="number"
                formControlName="amount"
                class="w-full p-2 border rounded bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
                placeholder="Number of shares"
              />
            </div>
            <div class="flex space-x-2">
              <button
                type="button"
                (click)="submitOrder('buy')"
                class="flex-1 bg-green-500 text-white p-2 rounded hover:bg-green-600 transition-colors"
              >
                Buy
              </button>
              <button
                type="button"
                (click)="submitOrder('sell')"
                class="flex-1 bg-red-500 text-white p-2 rounded hover:bg-red-600 transition-colors"
              >
                Sell
              </button>
            </div>
          </form>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
        <div class="p-4 border-b border-gray-100">
          <h2 class="text-lg font-semibold">Your Portfolio</h2>
        </div>
        <div class="p-4">
          <div class="space-y-3">
            @for (item of portfolioItems; track item.symbol) {
              <div class="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                <div>
                  <div class="font-medium">{{item.symbol}}</div>
                  <div class="text-sm text-gray-500">{{item.shares}} shares</div>
                </div>
                <div class="text-right">
                  <div [class]="getPercentageClass(item.change)">
                    {{item.change > 0 ? '+' : ''}}{{item.change}}%
                  </div>
                  <div class="text-sm text-gray-500">{{item.value.toLocaleString()}}</div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class TradingPanelComponent {
  private fb = inject(FormBuilder);

  @Input() portfolioItems!: PortfolioItem[];
  @Output() orderSubmit = new EventEmitter<TradeOrder>();

  tradeForm: FormGroup = this.fb.group({
    symbol: ['', [Validators.required, Validators.minLength(1)]],
    amount: [0, [Validators.required, Validators.min(1)]]
  });

  submitOrder(type: 'buy' | 'sell'): void {
    if (this.tradeForm.valid) {
      const order: TradeOrder = {
        ...this.tradeForm.value,
        type
      };
      this.orderSubmit.emit(order);
      this.tradeForm.reset();
    }
  }

  getPercentageClass(change: number): string {
    return change >= 0 ? 'text-green-500' : 'text-red-500';
  }
}
