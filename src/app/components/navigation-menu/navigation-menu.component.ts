import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationItem } from '../../models/types';

@Component({
  selector: 'app-navigation-menu',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white p-2 rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.1)] mb-4 overflow-x-auto">
      <div class="flex min-w-max sm:min-w-0 space-x-2">
        @for (item of items; track item.name) {
          <button
            (click)="tabChange.emit(item.name.toLowerCase())"
            [class]="getNavButtonClass(item.name.toLowerCase())"
          >
            <span [innerHTML]="item.icon" class="block sm:inline"></span>
            <span class="hidden sm:inline ml-2">{{item.name}}</span>
          </button>
        }
      </div>
    </div>
  `
})
export class NavigationMenuComponent {
  @Input() items!: NavigationItem[];
  @Input() selectedTab!: string;
  @Output() tabChange = new EventEmitter<string>();

  getNavButtonClass(tabName: string): string {
    const baseClasses = 'flex items-center justify-center sm:justify-start p-2 sm:px-4 sm:py-2 rounded-lg transition-all min-w-[44px] sm:min-w-0';
    return this.selectedTab === tabName
      ? `${baseClasses} bg-blue-600 text-white shadow-sm`
      : `${baseClasses} bg-white hover:bg-gray-50 text-gray-700`;
  }
}
