import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommissionInfoComponent } from '../commission-info/commission-info.component';
import { Stock } from '../../types/market';
import { SimulationService } from '../../services/simulation.service';
import { TradeService } from '../../services/trade.service';

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

      <div class="mb-4">
        <app-commission-info
          level="beginner"
          [estimatedValue]="estimatedValue"
          [amount]="tradeForm.get('amount')?.value || 0"
        />
      </div>

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

    @if (errorMessage) {
      <div class="mt-4 p-3 bg-red-100 text-red-700 rounded">
        {{ errorMessage }}
      </div>
    }
  `
})
export class BeginnerTradeFormComponent implements OnInit {
  @Output() orderSubmitted = new EventEmitter<void>();

  private simulationService = inject(SimulationService);
  private tradeService = inject(TradeService);

  tradeForm: FormGroup;
  estimatedValue: number = 0;
  errorMessage: string | null = null;

  stocks = this.simulationService.getStocks();

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
      this.errorMessage = null;
    });
  }

  getStocks(): Stock[] {
    return this.stocks();
  }

  getCurrentPrice(): number {
    const symbol = this.tradeForm.get('symbol')?.value;
    if (!symbol) return 0;

    const stock = this.stocks().find(s => s.ticker === symbol);
    return stock?.currentPrice || 0;
  }

  updateEstimatedValue() {
    const currentPrice = this.getCurrentPrice();
    const amount = this.tradeForm.get('amount')?.value || 0;
    this.estimatedValue = amount * currentPrice;
  }

  async onSubmitWithConfirmation(type: 'buy' | 'sell') {
    if (this.tradeForm.valid) {
      const order = {
        symbol: this.tradeForm.get('symbol')?.value,
        shares: Number(this.tradeForm.get('amount')?.value),
        type: type,
        orderType: 'market' as 'market',
        price: this.getCurrentPrice()
      };

      const result = this.tradeService.executeMarketOrder(order);

      if (result.success) {
        this.tradeForm.reset();
        this.errorMessage = null;
        this.orderSubmitted.emit();
      } else {
        this.errorMessage = result.error as string;
      }
    }
  }
}
