import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommissionInfoComponent } from '../comission-info/comission-info.component';
import { INITIAL_STOCKS } from '../../data/market-data';
import { Stock } from '../../types/market';

@Component({
  selector: 'app-beginner-trade-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CommissionInfoComponent],
  template: `
    <form [formGroup]="tradeForm" class="space-y-4">
      <div>
        <label class="text-sm text-gray-600 mb-1 block">Stock Symbol</label>
        <select
          formControlName="symbol"
          class="w-full p-2 border rounded bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a stock...</option>
          @for (stock of getStocks(); track stock.ticker) {
            <option [value]="stock.ticker">
              {{ stock.ticker }} - {{ stock.name }}
            </option>
          }
        </select>
        @if (tradeForm.get('symbol')?.errors?.['required'] && tradeForm.get('symbol')?.touched) {
          <span class="text-xs text-red-500">Symbol is required</span>
        }
      </div>

      <div>
        <label class="text-sm text-gray-600 mb-1 block">Amount</label>
        <div class="relative">
          <input
            type="number"
            formControlName="amount"
            class="w-full p-2 border rounded bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
            placeholder="Number of shares"
            min="1"
            step="1"
          />
        </div>
        @if (tradeForm.get('amount')?.errors?.['required'] && tradeForm.get('amount')?.touched) {
          <span class="text-xs text-red-500">Amount is required</span>
        }
        @if (tradeForm.get('amount')?.errors?.['min'] && tradeForm.get('amount')?.touched) {
          <span class="text-xs text-red-500">Amount must be at least 1</span>
        }
        @if (tradeForm.get('amount')?.errors?.['max'] && tradeForm.get('amount')?.touched) {
          <span class="text-xs text-red-500">Amount cannot exceed 100,000</span>
        }
      </div>

      <div class="mb-4"></div>

      <app-commission-info
        level="beginner"
        [estimatedValue]="estimatedValue"
        [amount]="tradeForm.get('amount')?.value || 0"
      />

      <div class="flex space-x-2">
        <button
          type="button"
          (click)="onSubmitWithConfirmation('buy')"
          [disabled]="!tradeForm.valid"
          class="flex-1 bg-green-500 text-white p-2 rounded hover:bg-green-600 transition-colors disabled:opacity-50"
        >
          Buy
        </button>
        <button
          type="button"
          (click)="onSubmitWithConfirmation('sell')"
          [disabled]="!tradeForm.valid"
          class="flex-1 bg-red-500 text-white p-2 rounded hover:bg-red-600 transition-colors disabled:opacity-50"
        >
          Sell
        </button>
      </div>
    </form>
  `
})
export class BeginnerTradeFormComponent implements OnInit {
  @Output() submitOrder = new EventEmitter<{ type: 'buy' | 'sell'; data: any }>();

  tradeForm: FormGroup;
  estimatedValue: number = 0;

  constructor(private fb: FormBuilder) {
    this.tradeForm = this.fb.group({
      symbol: ['', [
        Validators.required,
        Validators.pattern('^[A-Z]{1,5}$')
      ]],
      amount: ['', [
        Validators.required,
        Validators.min(1),
        Validators.max(100000),
        Validators.pattern('^[0-9]*$')
      ]]
    });
  }

  ngOnInit() {
    this.tradeForm.valueChanges.subscribe(() => {
      this.updateEstimatedValue();
    });
  }

  getStocks(): Stock[] {
    return INITIAL_STOCKS;
  }

  updateEstimatedValue() {
    const mockPrice = 150;
    const amount = this.tradeForm.get('amount')?.value || 0;
    this.estimatedValue = amount * mockPrice;
  }

  async onSubmitWithConfirmation(type: 'buy' | 'sell') {
    if (this.tradeForm.valid) {
      const confirmed = await this.showConfirmationDialog(type);
      if (confirmed) {
        this.submitOrder.emit({
          type,
          data: {
            ...this.tradeForm.value,
            orderType: 'market',
            estimatedValue: this.estimatedValue
          }
        });
        this.tradeForm.reset();
      }
    }
  }

  private async showConfirmationDialog(type: 'buy' | 'sell'): Promise<boolean> {
    const symbol = this.tradeForm.get('symbol')?.value;
    const amount = this.tradeForm.get('amount')?.value;

    return window.confirm(
      `Are you sure you want to ${type} ${amount} shares of ${symbol}?\n\n` +
      `Estimated value: $${this.estimatedValue.toFixed(2)}`
    );
  }
}
