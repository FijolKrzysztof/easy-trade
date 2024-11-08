import { Component, input } from '@angular/core';
import { CommissionBeginnerPanelComponent } from './components/commission-beginner-panel.component';
import { CommissionIntermediatePanelComponent } from './components/commission-intermediate-panel.component';
import { CommissionAdvancedPanelComponent } from './components/commission-advanced-panel.component';

@Component({
  selector: 'app-commission-info',
  standalone: true,
  imports: [
    CommissionBeginnerPanelComponent,
    CommissionIntermediatePanelComponent,
    CommissionAdvancedPanelComponent
  ],
  template: `
    @switch (level()) {
      @case ('beginner') {
        <app-commission-beginner-panel
          [estimatedValue]="estimatedValue()"
          [amount]="amount()"
          [orderType]="orderType()"
        />
      }
      @case ('intermediate') {
        <app-commission-intermediate-panel
          [estimatedValue]="estimatedValue()"
          [amount]="amount()"
          [orderType]="orderType()"
        />
      }
      @case ('advanced') {
        <app-commission-advanced-panel
          [estimatedValue]="estimatedValue()"
          [amount]="amount()"
          [orderType]="orderType()"
        />
      }
    }
  `
})
export class CommissionPanelComponent {
  level = input<'beginner' | 'intermediate' | 'advanced'>('beginner');
  orderType = input<string>('market');
  estimatedValue = input<number>(0);
  amount = input<number>(0);
}
