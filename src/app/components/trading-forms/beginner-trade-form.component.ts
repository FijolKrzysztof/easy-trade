import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-beginner-trade-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="tradeForm" class="space-y-4">
      <div>
        <label class="text-sm text-gray-600 mb-1 block">Stock Symbol</label>
        <input
          type="text"
          formControlName="symbol"
          class="w-full p-2 border rounded bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
          placeholder="Enter stock symbol (e.g. AAPL)"
          [maxLength]="5"
        />
        @if (tradeForm.get('symbol')?.errors?.['required'] && tradeForm.get('symbol')?.touched) {
          <span class="text-xs text-red-500">Symbol is required</span>
        }
        @if (tradeForm.get('symbol')?.errors?.['pattern']) {
          <span class="text-xs text-red-500">Invalid symbol format</span>
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

      @if (estimatedValue > 0) {
        <div class="p-2 bg-gray-50 rounded text-sm">
          <div class="flex justify-between">
            <span>Estimated Value:</span>
            <span>{{ estimatedValue | currency }}</span>
          </div>
        </div>
      }

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
  @Input() tradeForm!: FormGroup;
  @Output() submitOrder = new EventEmitter<{ type: 'buy' | 'sell'; data: any }>();

  estimatedValue: number = 0;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    if (!this.tradeForm) {
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

    // Subscribe to value changes to update estimated value
    this.tradeForm.valueChanges.subscribe(() => {
      this.updateEstimatedValue();
    });
  }

  updateEstimatedValue() {
    // W rzeczywistej aplikacji tutaj pobieralibyśmy aktualną cenę dla danego symbolu
    const mockPrice = 150; // Mock price for demonstration
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
            orderType: 'market', // Always market order for beginners
            estimatedValue: this.estimatedValue
          }
        });
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
