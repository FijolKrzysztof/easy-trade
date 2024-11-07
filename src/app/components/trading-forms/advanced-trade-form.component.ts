import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommissionInfoComponent } from '../commission-info/commission-info.component';
import { Stock } from '../../types/market';
import { INITIAL_STOCKS } from '../../data/market-data';

@Component({
  selector: 'app-advanced-trade-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CommissionInfoComponent],
  template: `
    <form [formGroup]="tradeForm" class="space-y-3">
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="text-sm text-gray-600 mb-1 block">Symbol</label>
          <select
            formControlName="symbol"
            class="w-full p-2 border rounded bg-gray-50"
          >
            <option value="">Select a stock...</option>
            @for (stock of getStocks(); track stock.ticker) {
              <option [value]="stock.ticker">
                {{ stock.ticker }} - {{ stock.name }}
              </option>
            }
          </select>
        </div>
        <div>
          <label class="text-sm text-gray-600 mb-1 block">Amount</label>
          <input
            type="number"
            formControlName="amount"
            class="w-full p-2 border rounded bg-gray-50"
            placeholder="Shares"
            min="1"
            step="1"
          />
        </div>
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
          <option value="stopLimit">Stop Limit</option>
          <option value="trailingStop">Trailing Stop</option>
        </select>
      </div>

      <div class="grid grid-cols-2 gap-2">
        @if (showLimitPrice()) {
          <div>
            <label class="text-sm text-gray-600 mb-1 block">Limit Price</label>
            <input
              type="number"
              formControlName="limitPrice"
              class="w-full p-2 border rounded bg-gray-50"
              placeholder="Limit price"
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
              class="w-full p-2 border rounded bg-gray-50"
              placeholder="Stop price"
              min="0.01"
              step="0.01"
            />
          </div>
        }

        @if (showTrailingAmount()) {
          <div>
            <label class="text-sm text-gray-600 mb-1 block">Trailing Amount</label>
            <input
              type="number"
              formControlName="trailingAmount"
              class="w-full p-2 border rounded bg-gray-50"
              placeholder="Amount or %"
              min="0.01"
              step="0.01"
            />
            <select formControlName="trailingType" class="mt-1 w-full p-2 border rounded bg-gray-50">
              <option value="fixed">Fixed Amount ($)</option>
              <option value="percentage">Percentage (%)</option>
            </select>
          </div>
        }
      </div>

      <div class="grid grid-cols-2 gap-2">
        <select formControlName="duration" class="p-2 border rounded bg-gray-50">
          <option value="day">Day Only</option>
          <option value="gtc">Good til Cancelled</option>
          <option value="fok">Fill or Kill</option>
          <option value="ioc">Immediate or Cancel</option>
        </select>

        <select formControlName="tif" class="p-2 border rounded bg-gray-50">
          <option value="regular">Regular Hours</option>
          <option value="extended">Extended Hours</option>
          <option value="premarket">Pre-market Only</option>
          <option value="afterhours">After Hours Only</option>
        </select>
      </div>

      <div class="mb-4"></div>

      <app-commission-info
        level="advanced"
        [orderType]="tradeForm.get('orderType')?.value"
        [estimatedValue]="estimatedValue"
        [amount]="tradeForm.get('amount')?.value || 0"
      />

      <div class="flex space-x-2">
        <button
          type="button"
          (click)="onSubmitWithConfirmation('buy')"
          [disabled]="!tradeForm.valid"
          class="flex-1 bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          Buy
        </button>
        <button
          type="button"
          (click)="onSubmitWithConfirmation('sell')"
          [disabled]="!tradeForm.valid"
          class="flex-1 bg-red-500 text-white p-2 rounded hover:bg-red-600 disabled:opacity-50"
        >
          Sell
        </button>
      </div>
    </form>
  `
})
export class AdvancedTradeFormComponent implements OnInit {
  @Output() submitOrder = new EventEmitter<{ type: 'buy' | 'sell'; data: any }>();

  estimatedValue: number = 0;
  tradeForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.tradeForm = this.fb.group({
      symbol: ['', [Validators.required, Validators.pattern('^[A-Z]{1,5}$')]],
      amount: ['', [Validators.required, Validators.min(1), Validators.max(100000)]],
      orderType: ['market'],
      limitPrice: [{ value: '', disabled: true }],
      stopPrice: [{ value: '', disabled: true }],
      trailingAmount: [{ value: '', disabled: true }],
      trailingType: [{ value: 'fixed', disabled: true }],
      duration: ['day'],
      tif: ['regular']
    });
  }

  ngOnInit() {
    this.tradeForm.get('orderType')?.valueChanges.subscribe(this.onOrderTypeChange.bind(this));

    this.tradeForm.valueChanges.subscribe(() => {
      this.updateEstimatedValue();
    });
  }

  getStocks(): Stock[] {
    return INITIAL_STOCKS;
  }

  onOrderTypeChange() {
    const orderType = this.tradeForm.get('orderType')?.value;
    const controls = {
      limitPrice: this.tradeForm.get('limitPrice'),
      stopPrice: this.tradeForm.get('stopPrice'),
      trailingAmount: this.tradeForm.get('trailingAmount'),
      trailingType: this.tradeForm.get('trailingType')
    };

    // Reset and disable all price-related controls
    Object.values(controls).forEach(control => {
      control?.disable();
      control?.setValue('');
    });

    // Enable and set validators based on order type
    switch (orderType) {
      case 'limit':
        controls.limitPrice?.enable();
        controls.limitPrice?.setValidators([Validators.required, Validators.min(0.01)]);
        break;
      case 'stop':
        controls.stopPrice?.enable();
        controls.stopPrice?.setValidators([Validators.required, Validators.min(0.01)]);
        break;
      case 'stopLimit':
        controls.stopPrice?.enable();
        controls.limitPrice?.enable();
        controls.stopPrice?.setValidators([Validators.required, Validators.min(0.01)]);
        controls.limitPrice?.setValidators([Validators.required, Validators.min(0.01)]);
        break;
      case 'trailingStop':
        controls.trailingAmount?.enable();
        controls.trailingType?.enable();
        controls.trailingAmount?.setValidators([Validators.required, Validators.min(0.01)]);
        break;
    }

    Object.values(controls).forEach(control => control?.updateValueAndValidity());
  }

  updateEstimatedValue() {
    const amount = this.tradeForm.get('amount')?.value || 0;
    const mockPrice = 150; // taka sama wartość jak w intermediate
    this.estimatedValue = amount * mockPrice;
  }

  showLimitPrice(): boolean {
    const orderType = this.tradeForm.get('orderType')?.value;
    return orderType === 'limit' || orderType === 'stopLimit';
  }

  showStopPrice(): boolean {
    const orderType = this.tradeForm.get('orderType')?.value;
    return orderType === 'stop' || orderType === 'stopLimit';
  }

  showTrailingAmount(): boolean {
    return this.tradeForm.get('orderType')?.value === 'trailingStop';
  }

  getEstimatedValue(): number {
    const amount = this.tradeForm.get('amount')?.value || 0;
    const orderType = this.tradeForm.get('orderType')?.value;
    let price = 0;

    switch (orderType) {
      case 'market':
        price = this.getCurrentMarketPrice();
        break;
      case 'limit':
        price = this.tradeForm.get('limitPrice')?.value || 0;
        break;
      case 'stop':
        price = this.tradeForm.get('stopPrice')?.value || 0;
        break;
      case 'stopLimit':
        price = this.tradeForm.get('limitPrice')?.value || 0;
        break;
      case 'trailingStop':
        price = this.getCurrentMarketPrice();
        const trailingAmount = this.tradeForm.get('trailingAmount')?.value || 0;
        const trailingType = this.tradeForm.get('trailingType')?.value;
        if (trailingType === 'percentage') {
          price = price * (1 - (trailingAmount / 100));
        } else {
          price = price - trailingAmount;
        }
        break;
    }

    return amount * price;
  }

  getCurrentMarketPrice(): number {
    return 150;
  }

  getCommission(): number {
    const estimatedValue = this.getEstimatedValue();
    const orderType = this.tradeForm.get('orderType')?.value;
    const baseCommission = Math.min(Math.max(estimatedValue * 0.001, 1), 50);

    switch (orderType) {
      case 'market':
        return baseCommission;
      case 'limit':
      case 'stop':
        return baseCommission * 1.1;
      case 'stopLimit':
      case 'trailingStop':
        return baseCommission * 1.2;
      default:
        return baseCommission;
    }
  }

  async onSubmitWithConfirmation(type: 'buy' | 'sell') {
    if (this.tradeForm.valid && this.validatePrices(type)) {
      const confirmed = await this.showConfirmationDialog(type);
      if (confirmed) {
        const orderData = {
          ...this.tradeForm.value,
          estimatedValue: this.getEstimatedValue(),
          commission: this.getCommission(),
          total: this.getEstimatedValue() + this.getCommission()
        };

        this.submitOrder.emit({ type, data: orderData });
        this.tradeForm.reset({
          orderType: 'market',
          duration: 'day',
          tif: 'regular',
          trailingType: 'fixed'
        });
      }
    } else {
      alert('Invalid price configuration for this order type');
    }
  }

  private async showConfirmationDialog(type: 'buy' | 'sell'): Promise<boolean> {
    const orderType = this.tradeForm.get('orderType')?.value;
    const symbol = this.tradeForm.get('symbol')?.value;
    const amount = this.tradeForm.get('amount')?.value;
    const estimatedValue = this.getEstimatedValue();
    const commission = this.getCommission();

    let message = `Are you sure you want to ${type} ${amount} shares of ${symbol}?\n\n`;
    message += `Order Type: ${orderType}\n`;
    message += `Estimated Value: $${estimatedValue.toFixed(2)}\n`;
    message += `Commission: $${commission.toFixed(2)}\n`;
    message += `Total: $${(estimatedValue + commission).toFixed(2)}\n\n`;

    switch (orderType) {
      case 'market':
        message += 'Warning: Market orders execute at the best available price, which may differ from the estimated value.';
        break;
      case 'limit':
        message += 'Note: Limit orders may not execute if the price conditions are not met.';
        break;
      case 'stop':
      case 'stopLimit':
        message += 'Note: Stop orders will trigger only when the stop price is reached.';
        break;
      case 'trailingStop':
        message += 'Note: Trailing stop price will adjust as the market price moves in your favor.';
        break;
    }

    return window.confirm(message);
  }

  validatePrices(type: 'buy' | 'sell'): boolean {
    const orderType = this.tradeForm.get('orderType')?.value;
    const stopPrice = this.tradeForm.get('stopPrice')?.value;
    const limitPrice = this.tradeForm.get('limitPrice')?.value;
    const currentPrice = this.getCurrentMarketPrice();

    switch (orderType) {
      case 'stopLimit':
        if (type === 'buy' && stopPrice <= limitPrice) {
          return false;
        }
        if (type === 'sell' && stopPrice >= limitPrice) {
          return false;
        }
        break;

      case 'trailingStop':
        const trailingAmount = this.tradeForm.get('trailingAmount')?.value;
        const trailingType = this.tradeForm.get('trailingType')?.value;

        if (trailingType === 'percentage' && (trailingAmount <= 0 || trailingAmount >= 100)) {
          return false;
        }
        if (trailingType === 'fixed' && (trailingAmount <= 0 || trailingAmount >= currentPrice)) {
          return false;
        }
        break;
    }

    return true;
  }
}
