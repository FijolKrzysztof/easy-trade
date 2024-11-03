import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-intermediate-trade-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
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
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="text-sm text-gray-600 mb-1 block">Amount</label>
          <input
            type="number"
            formControlName="amount"
            class="w-full p-2 border rounded bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
            placeholder="Shares"
          />
        </div>
        <div>
          <label class="text-sm text-gray-600 mb-1 block">Price Limit</label>
          <input
            type="number"
            formControlName="priceLimit"
            class="w-full p-2 border rounded bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
            placeholder="Max price"
          />
        </div>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <select formControlName="orderType" class="p-2 border rounded bg-gray-50">
          <option value="market">Market Order</option>
          <option value="limit">Limit Order</option>
          <option value="stop">Stop Order</option>
        </select>
        <select formControlName="duration" class="p-2 border rounded bg-gray-50">
          <option value="day">Day Only</option>
          <option value="gtc">Good til Cancelled</option>
        </select>
      </div>
      <div class="flex space-x-2">
        <button
          type="button"
          (click)="onSubmit('buy')"
          [disabled]="!tradeForm.valid"
          class="flex-1 bg-green-500 text-white p-2 rounded hover:bg-green-600 transition-colors disabled:opacity-50"
        >
          Buy
        </button>
        <button
          type="button"
          (click)="onSubmit('sell')"
          [disabled]="!tradeForm.valid"
          class="flex-1 bg-red-500 text-white p-2 rounded hover:bg-red-600 transition-colors disabled:opacity-50"
        >
          Sell
        </button>
      </div>
    </form>
  `
})
export class IntermediateTradeFormComponent {
  @Input() tradeForm!: FormGroup;
  @Output() submitOrder = new EventEmitter<{ type: 'buy' | 'sell' }>();

  onSubmit(type: 'buy' | 'sell') {
    if (this.tradeForm.valid) {
      this.submitOrder.emit({ type });
    }
  }
}
