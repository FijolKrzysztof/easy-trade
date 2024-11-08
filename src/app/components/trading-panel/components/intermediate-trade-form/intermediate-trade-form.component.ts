import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommissionInfoComponent } from '../commission-info/commission-info.component';
import { Stock } from '../../../../types/market';
import { INITIAL_STOCKS } from '../../../../data/market-data';

@Component({
  selector: 'app-intermediate-trade-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CommissionInfoComponent],
  templateUrl: 'intermediate-trade-form.component.html',
})
export class IntermediateTradeFormComponent implements OnInit {
  @Output() submitOrder = new EventEmitter<{ type: 'buy' | 'sell'; data: any }>();

  tradeForm: FormGroup;
  estimatedValue: number = 0;

  constructor(private fb: FormBuilder) {
    this.tradeForm = this.fb.group({
      symbol: ['', [Validators.required]],
      orderType: ['market', [Validators.required]],
      amount: ['', [Validators.required, Validators.min(1)]],
      limitPrice: [{ value: '', disabled: true }],
      stopPrice: [{ value: '', disabled: true }],
      duration: ['day', [Validators.required]]
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
    const amount = this.tradeForm.get('amount')?.value || 0;
    const orderType = this.tradeForm.get('orderType')?.value;
    let price = 0;

    switch (orderType) {
      case 'market':
        price = this.getCurrentMarketPrice();
        break;
      case 'limit':
        price = this.tradeForm.get('limitPrice')?.value || this.getCurrentMarketPrice();
        break;
      case 'stop':
        price = this.tradeForm.get('stopPrice')?.value || this.getCurrentMarketPrice();
        break;
    }

    this.estimatedValue = amount * price;
  }

  getCurrentMarketPrice(): number {
    return 150;
  }

  onOrderTypeChange() {
    const orderType = this.tradeForm.get('orderType')?.value;
    const limitPriceControl = this.tradeForm.get('limitPrice');
    const stopPriceControl = this.tradeForm.get('stopPrice');

    limitPriceControl?.disable();
    stopPriceControl?.disable();
    limitPriceControl?.setValue('');
    stopPriceControl?.setValue('');

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
      this.submitOrder.emit({
        type,
        data: {
          ...this.tradeForm.value,
          estimatedValue: this.estimatedValue
        }
      });
      this.tradeForm.reset({ orderType: 'market', duration: 'day' });
    }
  }
}
