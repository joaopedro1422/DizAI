import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { registrarServiceWorker } from './app/core/pwa/abertura';

bootstrapApplication(AppComponent, appConfig)
  .then(() => registrarServiceWorker())
  .catch((err) => console.error(err));
