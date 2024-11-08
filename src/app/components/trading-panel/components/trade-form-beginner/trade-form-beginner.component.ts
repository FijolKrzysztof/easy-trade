import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Stock } from '../../../../types/market';
import { SimulationService } from '../../../../services/simulation.service';
import { TradeService } from '../../../../services/trade.service';
import { CommissionPanelComponent } from '../commission-info/commission-info.component';

@Component({
  selector: 'app-trade-form-beginner',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CommissionPanelComponent],
  templateUrl: 'trade-form-beginner.component.html',
})
export class TradeFormBeginnerComponent {
  readonly simulationService = inject(SimulationService);
  readonly tradeService = inject(TradeService);
  readonly fb = inject(FormBuilder);

  tradeForm: FormGroup;
  estimatedValue: number = 0;
  errorMessage: string | null = null;
  stocks = this.simulationService.getStocks();

  constructor() {
    this.tradeForm = this.fb.group({
      symbol: ['', [
        Validators.required,
        Validators.pattern('^[A-Z]{1,5}$')
      ]],
      amount: ['', [
        Validators.required,
        Validators.min(1),
        Validators.pattern('^[0-9]*$')
      ]]
    });
    effect(() => {
      this.tradeForm.valueChanges.subscribe(() => {
        this.updateEstimatedValue();
        this.errorMessage = null;
      });
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

  onSubmit(type: 'buy' | 'sell') {
    if (this.tradeForm.valid) {
      const order = {
        symbol: this.tradeForm.get('symbol')?.value,
        shares: Number(this.tradeForm.get('amount')?.value),
        type: type,
        orderType: 'market' as 'market',
        price: this.getCurrentPrice(),
      };

      const result = this.tradeService.executeMarketOrder(order);

      if (result.success) {
        this.tradeForm.reset();
        this.errorMessage = null;
      } else {
        this.errorMessage = result.error as string;
      }
    }
  }
}
