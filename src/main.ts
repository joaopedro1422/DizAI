import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { registrarServiceWorker } from './app/core/pwa/abertura';

// os pipes de moeda/número com 'pt-BR' (Campanhas) precisam dos dados do idioma: sem isso o pipe dá erro e a tela
// para de desenhar (o placar, o histórico e o modal do resultado saíam vazios)
registerLocaleData(localePt, 'pt-BR');

bootstrapApplication(AppComponent, appConfig)
  .then(() => registrarServiceWorker())
  .catch((err) => console.error(err));
