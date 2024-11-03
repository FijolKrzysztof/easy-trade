import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-commission-info',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-3 bg-blue-50 rounded-lg">
      <div class="flex items-center justify-between mb-2">
        <span class="font-medium text-blue-900">Trading Fees</span>
        <div class="relative group">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="text-blue-500 cursor-help"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <div class="hidden group-hover:block absolute z-50 right-0 w-64 p-2 bg-white shadow-lg rounded-lg border mt-1">
            <div class="text-sm text-gray-600">
              <p class="mb-2">Commission breakdown:</p>
              <ul class="space-y-1">
                <li>Broker commission: {{ getBrokerCommissionRate() }}% of trade value</li>
                @if (level !== 'beginner') {
                  <li>SEC fee: $0.02 per $1000 (sells only)</li>
                  <li>FINRA TAF: $0.000119 per share</li>
                }
                @if (level === 'advanced') {
                  <li>Exchange fees may apply based on order type</li>
                }
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-1 text-sm">
        <div class="flex justify-between">
          <span class="text-gray-600">Trade Value:</span>
          <span class="font-medium text-gray-900">{{ estimatedValue.toFixed(2) }}</span>
        </div>

        <div class="flex justify-between">
          <span class="text-gray-600">Broker Commission:</span>
          <span class="font-medium text-gray-900">{{ getBrokerCommission().toFixed(2) }}</span>
        </div>

        @if (level !== 'beginner') {
          <div class="flex justify-between">
            <span class="text-gray-600">Regulatory Fees:</span>
            <span class="font-medium text-gray-900">{{ getRegulatoryFees().toFixed(2) }}</span>
          </div>
        }

        @if (level === 'advanced' && orderType !== 'market') {
          <div class="flex justify-between">
            <span class="text-gray-600">Exchange Fee:</span>
            <span class="font-medium text-gray-900">{{ getExchangeFee().toFixed(2) }}</span>
          </div>
        }

        <div class="flex justify-between text-blue-800 font-medium border-t border-blue-200 pt-1 mt-1">
          <span>Total Fees:</span>
          <span>{{ getTotalFees().toFixed(2) }}</span>
        </div>
      </div>

      @if (estimatedValue >= 10000) {
        <div class="mt-2 text-xs text-green-600">
          Volume discount applied to commission rate
        </div>
      }
    </div>
  `,
})
export class CommissionInfoComponent {
  @Input() level: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
  @Input() orderType: string = 'market';
  @Input() estimatedValue: number = 0;
  @Input() shares: number = 0;
  @Input() transactionType: 'buy' | 'sell' = 'buy';

  getBrokerCommissionRate(): number {
    // Malejąca prowizja w zależności od wartości transakcji
    if (this.estimatedValue >= 100000) return 0.1;
    if (this.estimatedValue >= 10000) return 0.2;
    return 0.3;
  }

  getBrokerCommission(): number {
    const rate = this.getBrokerCommissionRate();
    return (this.estimatedValue * rate) / 100;
  }

  getRegulatoryFees(): number {
    if (this.level === 'beginner') return 0;

    let fees = 0;
    // FINRA TAF
    fees += this.shares * 0.000119;

    // SEC fee (tylko dla sprzedaży)
    if (this.transactionType === 'sell') {
      fees += (this.estimatedValue / 1000) * 0.02;
    }

    return fees;
  }

  getExchangeFee(): number {
    if (this.level !== 'advanced' || this.orderType === 'market') return 0;

    // Dodatkowe opłaty dla zleceń specjalnych
    switch (this.orderType) {
      case 'limit':
        return Math.min(this.estimatedValue * 0.0005, 0.5); // 0.05% max $0.50
      case 'stop':
        return Math.min(this.estimatedValue * 0.0007, 0.75); // 0.07% max $0.75
      case 'stopLimit':
      case 'trailingStop':
        return Math.min(this.estimatedValue * 0.001, 1.00); // 0.1% max $1.00
      default:
        return 0;
    }
  }

  getTotalFees(): number {
    return this.getBrokerCommission() +
      this.getRegulatoryFees() +
      this.getExchangeFee();
  }
}
