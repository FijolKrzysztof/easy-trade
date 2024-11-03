import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

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

      <div>
        <label class="text-sm text-gray-600 mb-1 block">Order Type</label>
        <select
          formControlName="orderType"
          class="w-full p-2 border rounded bg-gray-50"
          (change)="onOrderTypeChange()"
        >
          <option value="market">Market Order</option>
          <option value="limit">Limit Order</option>
          <option value="stop">Stop Order</option>
        </select>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="text-sm text-gray-600 mb-1 block">Amount</label>
          <input
            type="number"
            formControlName="amount"
            class="w-full p-2 border rounded bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
            placeholder="Number of shares"
            min="1"
          />
        </div>

        @if (showLimitPrice()) {
          <div>
            <label class="text-sm text-gray-600 mb-1 block">Limit Price</label>
            <input
              type="number"
              formControlName="limitPrice"
              class="w-full p-2 border rounded bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
              placeholder="Enter limit price"
              min="0.01"
              step="0.01"
            />
          </div>
        }

        @if (showStopPrice()) {
          <div>
            <label class="text-sm text-gray-600 mb-1 block">Stop Price</label>
            <input
              type="number"
              formControlName="stopPrice"
              class="w-full p-2 border rounded bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
              placeholder="Enter stop price"
              min="0.01"
              step="0.01"
            />
          </div>
        }
      </div>

      <div>
        <label class="text-sm text-gray-600 mb-1 block">Duration</label>
        <select formControlName="duration" class="w-full p-2 border rounded bg-gray-50">
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
export class IntermediateTradeFormComponent implements OnInit {
  @Input() tradeForm!: FormGroup;
  @Output() submitOrder = new EventEmitter<{ type: 'buy' | 'sell' }>();

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    // If form is not provided from parent, create it
    if (!this.tradeForm) {
      this.tradeForm = this.fb.group({
        symbol: ['', [Validators.required]],
        orderType: ['market', [Validators.required]],
        amount: ['', [Validators.required, Validators.min(1)]],
        limitPrice: [{ value: '', disabled: true }],
        stopPrice: [{ value: '', disabled: true }],
        duration: ['day', [Validators.required]]
      });
    }

    // Subscribe to orderType changes to handle form controls
    this.tradeForm.get('orderType')?.valueChanges.subscribe(this.onOrderTypeChange.bind(this));
  }

  onOrderTypeChange() {
    const orderType = this.tradeForm.get('orderType')?.value;
    const limitPriceControl = this.tradeForm.get('limitPrice');
    const stopPriceControl = this.tradeForm.get('stopPrice');

    // Reset and disable all price controls first
    limitPriceControl?.disable();
    stopPriceControl?.disable();
    limitPriceControl?.setValue('');
    stopPriceControl?.setValue('');

    // Enable and set validators based on order type
    switch (orderType) {
      case 'limit':
        limitPriceControl?.enable();
        limitPriceControl?.setValidators([Validators.required, Validators.min(0.01)]);
        break;
      case 'stop':
        stopPriceControl?.enable();
        stopPriceControl?.setValidators([Validators.required, Validators.min(0.01)]);
        break;
    }

    // Update validators
    limitPriceControl?.updateValueAndValidity();
    stopPriceControl?.updateValueAndValidity();
  }

  showLimitPrice(): boolean {
    return this.tradeForm.get('orderType')?.value === 'limit';
  }

  showStopPrice(): boolean {
    return this.tradeForm.get('orderType')?.value === 'stop';
  }

  onSubmit(type: 'buy' | 'sell') {
    if (this.tradeForm.valid) {
      this.submitOrder.emit({ type });
    }
  }
}
