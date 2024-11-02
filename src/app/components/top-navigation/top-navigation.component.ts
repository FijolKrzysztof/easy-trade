import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-top-navigation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white p-4 rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.1)] mb-4">
      <div class="flex justify-between items-center">
        <div class="text-2xl font-bold text-blue-600">EasyTrade</div>
        <div class="flex items-center space-x-6">
          <div class="flex items-center space-x-2">
            <i class="pi pi-bell text-blue-500 text-xl"></i>
            <span class="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {{notifications}}
            </span>
          </div>
          <div class="flex flex-col items-end">
            <span class="text-green-500 font-semibold">{{balance.toLocaleString()}}</span>
            <span class="text-sm text-gray-500">{{username}}</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TopNavigationComponent {
  @Input() balance!: number;
  @Input() username!: string;
  @Input() notifications!: number;
}
