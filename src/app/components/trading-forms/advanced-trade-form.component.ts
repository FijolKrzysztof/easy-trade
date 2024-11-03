// trading-forms/advanced-trade-form.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-advanced-trade-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="tradeForm" class="space-y-3">
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="text-sm text-gray-600 mb-1 block">Symbol</label>
          <input
            type="text"
            formControlName="symbol"
            class="w-full p-2 border rounded bg-gray-50"
            placeholder="Enter symbol..."
          />
        </div>
        <div>
          <label class="text-sm text-gray-600 mb-1 block">Amount</label>
          <input
            type="number"
            formControlName="amount"
            class="w-full p-2 border rounded bg-gray-50"
            placeholder="Shares"
          />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="text-sm text-gray-600 mb-1 block">Price</label>
          <input
            type="number"
            formControlName="price"
            class="w-full p-2 border rounded bg-gray-50"
            placeholder="Limit price"
          />
        </div>
        <div>
          <label class="text-sm text-gray-600 mb-1 block">Stop</label>
          <input
            type="number"
            formControlName="stopPrice"
            class="w-full p-2 border rounded bg-gray-50"
            placeholder="Stop price"
          />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <select formControlName="orderType" class="p-2 border rounded bg-gray-50">
          <option value="market">Market Order</option>
          <option value="limit">Limit Order</option>
          <option value="stop">Stop Order</option>
          <option value="stopLimit">Stop Limit</option>
          <option value="trailing">Trailing Stop</option>
        </select>
        <select formControlName="duration" class="p-2 border rounded bg-gray-50">
          <option value="day">Day Only</option>
          <option value="gtc">Good til Cancelled</option>
          <option value="fok">Fill or Kill</option>
          <option value="ioc">Immediate or Cancel</option>
        </select>
      </div>

      <div class="p-2 bg-gray-50 rounded text-sm">
        <div class="flex justify-between mb-1">
          <span>Estimated Cost:</span>
          <span>{{ getEstimatedCost() | currency }}</span>
        </div>
        <div class="flex justify-between">
          <span>Commission:</span>
          <span>{{ getCommission() | currency }}</span>
        </div>
      </div>

      <div class="flex space-x-2">
        <button
          type="button"
          (click)="onSubmit('buy')"
          [disabled]="!tradeForm.valid"
          class="flex-1 bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          Buy
        </button>
        <button
          type="button"
          (click)="onSubmit('sell')"
          [disabled]="!tradeForm.valid"
          class="flex-1 bg-red-500 text-white p-2 rounded hover:bg-red-600 disabled:opacity-50"
        >
          Sell
        </button>
      </div>
    </form>
  `
})
export class AdvancedTradeFormComponent {
  @Input() tradeForm!: FormGroup;
  @Output() submitOrder = new EventEmitter<{ type: 'buy' | 'sell' }>();

  onSubmit(type: 'buy' | 'sell') {
    if (this.tradeForm.valid) {
      this.submitOrder.emit({ type });
    }
  }

  getEstimatedCost(): number {
    const amount = this.tradeForm.get('amount')?.value || 0;
    const price = this.tradeForm.get('price')?.value || 0;
    return amount * price;
  }

  getCommission(): number {
    const estimatedCost = this.getEstimatedCost();
    // 0.1% prowizji z minimum $1 i maximum $50
    return Math.min(Math.max(estimatedCost * 0.001, 1), 50);
  }
}
