import { Component, input, model } from '@angular/core';

@Component({
  selector: 'app-notification-banner',
  standalone: true,
  template: `
    @if (isVisible()) {
      <div
        class="bg-blue-50 p-4 rounded-lg mb-4 flex justify-between items-center"
        role="alert"
      >
        <div class="flex items-center space-x-2">
          <i class="pi pi-info-circle text-blue-500 text-xl"></i>
          <span>{{message()}}</span>
        </div>
        <button
          (click)="isVisible.set(false)"
          class="text-gray-500 hover:text-gray-700"
          aria-label="Close notification"
        >×</button>
      </div>
    }
  `,
})
export class NotificationBannerComponent {
  message = input.required<string>();
  isVisible = model(true);
}
