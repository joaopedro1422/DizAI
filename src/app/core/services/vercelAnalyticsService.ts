import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VercelAnalyticsService {
  private loaded = false;

  init(): void {
    if (this.loaded || typeof window === 'undefined') {
      return;
    }

    this.loaded = true;

    const script = document.createElement('script');
    script.src = '/_vercel/insights/script.js';
    script.defer = true;
    document.head.appendChild(script);
  }
}