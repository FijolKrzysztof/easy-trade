import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-beginner-trade-form',
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
        @if (tradeForm.get('symbol')?.errors?.['required'] && tradeForm.get('symbol')?.touched) {
          <span class="text-xs text-red-500">Symbol is required</span>
        }
      </div>
      <div>
        <label class="text-sm text-gray-600 mb-1 block">Amount</label>
        <input
          type="number"
          formControlName="amount"
          class="w-full p-2 border rounded bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
          placeholder="Number of shares"
        />
        @if (tradeForm.get('amount')?.errors?.['required'] && tradeForm.get('amount')?.touched) {
          <span class="text-xs text-red-500">Amount is required</span>
        }
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
export class BeginnerTradeFormComponent {
  @Input() tradeForm!: FormGroup;
  @Output() submitOrder = new EventEmitter<{ type: 'buy' | 'sell' }>();

  onSubmit(type: 'buy' | 'sell') {
    if (this.tradeForm.valid) {
      this.submitOrder.emit({ type });
    }
  }
}
