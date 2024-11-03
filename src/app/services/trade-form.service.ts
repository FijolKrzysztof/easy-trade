import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class TradeFormService {
  constructor(private fb: FormBuilder) {}

  createTradeForm(level: 'beginner' | 'intermediate' | 'advanced'): FormGroup {
    const baseControls = {
      symbol: ['', [Validators.required, Validators.pattern('^[A-Z]{1,5}$')]],
      amount: ['', [
        Validators.required,
        Validators.min(1),
        Validators.max(100000),
        Validators.pattern('^[0-9]*$')
      ]],
      estimatedValue: [{ value: 0, disabled: true }],
      commission: [{ value: 0, disabled: true }]
    };

    if (level === 'beginner') {
      return this.fb.group(baseControls);
    }

    const intermediateControls = {
      ...baseControls,
      orderType: ['market'],
      limitPrice: [{ value: '', disabled: true }],
      stopPrice: [{ value: '', disabled: true }],
      duration: ['day']
    };

    if (level === 'intermediate') {
      return this.fb.group(intermediateControls);
    }

    const advancedControls = {
      ...intermediateControls,
      trailingAmount: [{ value: '', disabled: true }],
      trailingType: [{ value: 'fixed', disabled: true }],
      tif: ['regular']
    };

    return this.fb.group(advancedControls);
  }
}
