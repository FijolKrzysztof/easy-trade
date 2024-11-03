import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioItem } from '../../models/types';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
      <div class="p-4 border-b border-gray-100">
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-semibold">Your Portfolio</h2>
          <div class="text-sm text-gray-500">
            Total Value: {{ getTotalValue() | currency }}
          </div>
        </div>
      </div>
      <div class="p-4">
        <div class="space-y-3">
          @for (item of portfolioItems; track item.symbol) {
            <div class="flex justify-between items-center p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div>
                <div class="font-medium">{{item.symbol}}</div>
                <div class="text-sm text-gray-500">{{item.shares}} shares</div>
              </div>
              <div class="text-right">
                <div [class]="getPercentageClass(item.change)">
                  {{item.change > 0 ? '+' : ''}}{{item.change}}%
                </div>
                <div class="text-sm text-gray-500">{{item.value | currency}}</div>
              </div>
            </div>
          }

          @if (portfolioItems.length === 0) {
            <div class="text-center p-4 text-gray-500">
              <i class="fas fa-folder-open mb-2"></i>
              <p>No stocks in your portfolio</p>
            </div>
          }
        </div>

        <!-- Portfolio Summary -->
        @if (portfolioItems.length > 0) {
          <div class="mt-4 pt-4 border-t border-gray-100">
            <div class="grid grid-cols-2 gap-4">
              <div class="p-3 bg-gray-50 rounded-lg">
                <div class="text-sm text-gray-500">Daily Change</div>
                <div [class]="getPercentageClass(getDailyChange())">
                  {{ getDailyChange() > 0 ? '+' : '' }}{{ getDailyChange().toFixed(2) }}%
                </div>
              </div>
              <div class="p-3 bg-gray-50 rounded-lg">
                <div class="text-sm text-gray-500">Total Return</div>
                <div [class]="getPercentageClass(getTotalReturn())">
                  {{ getTotalReturn() > 0 ? '+' : '' }}{{ getTotalReturn().toFixed(2) }}%
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class PortfolioComponent {
  @Input() portfolioItems: PortfolioItem[] = [];

  getPercentageClass(change: number): string {
    return change >= 0 ? 'text-green-500' : 'text-red-500';
  }

  getTotalValue(): number {
    return this.portfolioItems.reduce((sum, item) => sum + item.value, 0);
  }

  getDailyChange(): number {
    const totalValue = this.getTotalValue();
    if (totalValue === 0) return 0;

    return this.portfolioItems.reduce((sum, item) => {
      const weight = item.value / totalValue;
      return sum + (item.change * weight);
    }, 0);
  }

  getTotalReturn(): number {
    // W rzeczywistej aplikacji wartość początkowa byłaby przechowywana w bazie
    // Tutaj używamy przykładowej wartości
    const initialInvestment = 10000;
    const currentValue = this.getTotalValue();
    return ((currentValue - initialInvestment) / initialInvestment) * 100;
  }
}
