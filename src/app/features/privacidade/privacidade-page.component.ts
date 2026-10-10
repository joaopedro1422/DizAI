import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { EMAIL_SUPORTE } from '../../core/constants/contato';
import { IconeComponent } from '../../shared/components/icone/icone.component';
import { LogoComponent } from '../../shared/components/logo/logo.component';

interface SecaoIndice {
  id: string;
  titulo: string;
}

/**
 * Política de privacidade pública (exigida pela Meta para o app do WhatsApp e pela LGPD).
 * A seção "exclusao-de-dados" é a URL de instruções de exclusão informada no painel da Meta.
 */
@Component({
  selector: 'app-privacidade-page',
  imports: [RouterLink, LogoComponent, IconeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './privacidade-page.component.html',
  styleUrl: './privacidade-page.component.css',
})
export class PrivacidadePageComponent {
  protected readonly emailContato = EMAIL_SUPORTE;
  protected readonly atualizadaEm = '7 de outubro de 2026';

  protected readonly indice: SecaoIndice[] = [
    { id: 'quem-somos', titulo: 'Quem somos e a quem esta política se aplica' },
    { id: 'papeis', titulo: 'Quem decide sobre cada dado' },
    { id: 'dados-coletados', titulo: 'Quais dados tratamos' },
    { id: 'finalidades', titulo: 'Para que usamos os dados' },
    { id: 'inteligencia-artificial', titulo: 'Como a inteligência artificial usa os dados' },
    { id: 'compartilhamento', titulo: 'Com quem compartilhamos' },
    { id: 'transferencia-internacional', titulo: 'Transferência internacional' },
    { id: 'retencao', titulo: 'Por quanto tempo guardamos' },
    { id: 'seguranca', titulo: 'Como protegemos os dados' },
    { id: 'direitos', titulo: 'Seus direitos' },
    { id: 'clientes-das-lojas', titulo: 'Para quem conversa com uma loja' },
    { id: 'exclusao-de-dados', titulo: 'Como excluir seus dados' },
    { id: 'navegador', titulo: 'Armazenamento no navegador' },
    { id: 'menores', titulo: 'Menores de idade' },
    { id: 'alteracoes', titulo: 'Alterações desta política' },
    { id: 'contato', titulo: 'Contato' },
  ];
}
