import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationItem } from '../../models/types';
import { Router } from "@angular/router";

@Component({
  selector: 'app-navigation-menu',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white p-2 rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.1)] mb-4 overflow-x-auto">
      <div class="flex min-w-max sm:min-w-0 space-x-2">
        @for (item of navigationItems(); track item.name) {
          <button
            (click)="setSelectedTab(item.name.toLowerCase())"
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
  readonly router = inject(Router);

  selectedTab = signal('dashboard');
  navigationItems = signal<NavigationItem[]>([
    {
      name: 'Dashboard',
      icon: `<i class="pi pi-chart-line"></i>`,
      route: '/dashboard'
    },
    {
      name: 'Learn',
      icon: `<i class="pi pi-book"></i>`,
      route: '/learn'
    },
    {
      name: 'Portfolio',
      icon: `<i class="pi pi-chart-pie"></i>`,
      route: '/portfolio'
    },
    {
      name: 'Community',
      icon: `<i class="pi pi-users"></i>`,
      route: '/community'
    },
    {
      name: 'Help',
      icon: `<i class="pi pi-question-circle"></i>`,
      route: '/help'
    }
  ]);

  getNavButtonClass(tabName: string): string {
    const baseClasses = 'flex items-center justify-center sm:justify-start p-2 sm:px-4 sm:py-2 rounded-lg transition-all min-w-[44px] sm:min-w-0';
    return this.selectedTab() === tabName
      ? `${baseClasses} bg-blue-600 text-white shadow-sm`
      : `${baseClasses} bg-white hover:bg-gray-50 text-gray-700`;
  }

  setSelectedTab(tab: string): void {
    this.selectedTab.set(tab);
    const navItem = this.navigationItems().find(item => item.name.toLowerCase() === tab);
    if (navItem) {
      this.router.navigate([navItem.route]).finally();
    }
  }
}
