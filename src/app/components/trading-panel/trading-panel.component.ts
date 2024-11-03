import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PortfolioItem, TradeOrder } from '../../models/types';
import { PortfolioComponent } from '../portfolio/portfolio.component';
import { BeginnerTradeFormComponent } from '../trading-forms/beginner-trade-form.component';
import { IntermediateTradeFormComponent } from '../trading-forms/intermediate-trade-form.component';
import { AdvancedTradeFormComponent } from '../trading-forms/advanced-trade-form.component';

@Component({
  selector: 'app-trading-panel',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PortfolioComponent,
    BeginnerTradeFormComponent,
    IntermediateTradeFormComponent,
    AdvancedTradeFormComponent
  ],
  template: `
    <div class="space-y-4">
      <div class="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
        <div class="p-4 border-b border-gray-100">
          <h2 class="text-lg font-semibold">Quick Trade</h2>
        </div>
        <div class="p-4">
          @switch (difficultyLevel) {
            @case ('beginner') {
              <app-beginner-trade-form
                [tradeForm]="tradeForm"
                (submitOrder)="submitOrder($event.type)"
              />
            }
            @case ('intermediate') {
              <app-intermediate-trade-form
                [tradeForm]="tradeForm"
                (submitOrder)="submitOrder($event.type)"
              />
            }
            @case ('advanced') {
              <app-advanced-trade-form
                [tradeForm]="tradeForm"
                (submitOrder)="submitOrder($event.type)"
              />
            }
          }
        </div>
      </div>

      <app-portfolio class="block" [portfolioItems]="portfolioItems"></app-portfolio>
    </div>
  `
})
export class TradingPanelComponent implements OnInit {
  private fb = inject(FormBuilder);

  @Input() portfolioItems!: PortfolioItem[];
  @Input() difficultyLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
  @Output() orderSubmit = new EventEmitter<TradeOrder>();

  tradeForm: FormGroup;

  constructor() {
    this.tradeForm = this.fb.group({
      symbol: ['', [Validators.required, Validators.minLength(1)]],
      amount: [0, [Validators.required, Validators.min(1)]],
      priceLimit: [null],
      price: [null],
      stopPrice: [null],
      orderType: ['market'],
      duration: ['day']
    });
  }

  ngOnInit() {
    this.tradeForm.valueChanges.subscribe(() => {
      this.updateValidators();
    });
  }

  submitOrder(type: 'buy' | 'sell') {
    if (this.tradeForm.valid) {
      const order: TradeOrder = {
        ...this.tradeForm.value,
        type,
        difficultyLevel: this.difficultyLevel
      };
      this.orderSubmit.emit(order);
      this.tradeForm.reset({ orderType: 'market', duration: 'day' });
    }
  }

  private updateValidators() {
    const orderType = this.tradeForm.get('orderType')?.value;

    if (this.difficultyLevel === 'intermediate') {
      if (orderType === 'limit') {
        this.tradeForm.get('priceLimit')?.setValidators([Validators.required]);
      } else {
        this.tradeForm.get('priceLimit')?.clearValidators();
      }
    }

    if (this.difficultyLevel === 'advanced') {
      if (orderType === 'limit' || orderType === 'stopLimit') {
        this.tradeForm.get('price')?.setValidators([Validators.required]);
      } else {
        this.tradeForm.get('price')?.clearValidators();
      }

      if (orderType === 'stop' || orderType === 'stopLimit' || orderType === 'trailing') {
        this.tradeForm.get('stopPrice')?.setValidators([Validators.required]);
      } else {
        this.tradeForm.get('stopPrice')?.clearValidators();
      }
    }

    Object.keys(this.tradeForm.controls).forEach(key => {
      this.tradeForm.get(key)?.updateValueAndValidity({ emitEvent: false });
    });
  }

  resetForm(): void {
    const orderType = this.tradeForm.get('orderType')?.value;
    const duration = this.tradeForm.get('duration')?.value;

    this.tradeForm.reset({
      orderType,
      duration
    });
  }

  getPercentageClass(change: number): string {
    return change >= 0 ? 'text-green-500' : 'text-red-500';
  }

  getEstimatedCost(): number {
    const amount = this.tradeForm.get('amount')?.value || 0;
    const price = this.tradeForm.get('price')?.value || 0;
    return amount * price;
  }

  getCommission(): number {
    // Przykładowe obliczenie prowizji
    const estimatedCost = this.getEstimatedCost();
    return Math.min(Math.max(estimatedCost * 0.001, 1), 50); // 0.1% z min $1 i max $50
  }
}

  // tradeForm: FormGroup = this.fb.group({
  //   symbol: ['', [Validators.required, Validators.minLength(1)]],
  //   amount: [0, [Validators.required, Validators.min(1)]]
  // });
  //
  // submitOrder(type: 'buy' | 'sell'): void {
  //   if (this.tradeForm.valid) {
  //     const order: TradeOrder = {
  //       ...this.tradeForm.value,
  //       type
  //     };
  //     this.orderSubmit.emit(order);
  //     this.tradeForm.reset();
  //   }
  // }
  //
  // getPercentageClass(change: number): string {
  //   return change >= 0 ? 'text-green-500' : 'text-red-500';
  // }
// }
