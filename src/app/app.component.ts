import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
<!--    <app-navbar />-->
    <router-outlet />
  `
})
export class AppComponent {}
