import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommissionInfoComponent } from '../commission-info/commission-info.component';
import { Stock } from '../../../../types/market';
import { INITIAL_STOCKS } from '../../../../data/market-data';

@Component({
  selector: 'app-advanced-trade-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CommissionInfoComponent],
  templateUrl: 'advanced-trade-form.component.html',
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
      limitPrice: [{value: '', disabled: true}],
      stopPrice: [{value: '', disabled: true}],
      trailingAmount: [{value: '', disabled: true}],
      trailingType: [{value: 'fixed', disabled: true}],
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

    Object.values(controls).forEach(control => {
      control?.disable();
      control?.setValue('');
    });

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
    const mockPrice = 150;
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

  getCurrentMarketPrice(): number {
    return 150;
  }

  onSubmit(type: 'buy' | 'sell') {
    if (this.tradeForm.valid && this.validatePrices(type)) {
      // TODO: implement
    }
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
