import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-blue-50 p-4 rounded-lg mb-4 flex justify-between items-center">
      <div class="flex items-center space-x-2">
        <i class="pi pi-info-circle text-blue-500 text-xl"></i>
        <span>{{message}}</span>
      </div>
      <button (click)="close.emit()" class="text-gray-500 hover:text-gray-700">×</button>
    </div>
  `
})
export class NotificationBannerComponent {
  @Input() message!: string;
  @Output() close = new EventEmitter<void>();
}
