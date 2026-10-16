import { Routes } from '@angular/router';

import { adminGuard, painelGuard, perfilResolver, redirecionarParaPainel, visitanteGuard } from './core/auth/painel.guard';

/** Telas do painel: ficam em /painel/{uuid-do-perfil}/... e só abrem para o dono da loja. */
const rotasDoPainel: Routes = [
  {
    path: '',
    title: 'Painel | DizAI',
    loadComponent: () =>
      import('./features/painel/painel-page.component').then((m) => m.PainelPageComponent),
  },
  {
    path: 'produtos',
    title: 'Produtos | DizAI',
    loadComponent: () =>
      import('./features/produtos/produtos-page.component').then((m) => m.ProdutosPageComponent),
  },
  {
    path: 'perguntas',
    title: 'Perguntas frequentes | DizAI',
    loadComponent: () =>
      import('./features/perguntas/perguntas-page.component').then((m) => m.PerguntasPageComponent),
  },
  {
    path: 'galeria',
    title: 'Galeria | DizAI',
    loadComponent: () =>
      import('./features/galeria/galeria-page.component').then((m) => m.GaleriaPageComponent),
  },
  {
    path: 'estatisticas',
    title: 'Estatísticas | DizAI',
    loadComponent: () =>
      import('./features/estatisticas/estatisticas-page.component').then((m) => m.EstatisticasPageComponent),
  },
  {
    path: 'agenda',
    title: 'Agenda | DizAI',
    loadComponent: () => import('./features/agenda/agenda-page.component').then((m) => m.AgendaPageComponent),
  },
  {
    path: 'chats',
    title: 'Chats | DizAI',
    loadComponent: () =>
      import('./features/chats/chats-page.component').then((m) => m.ChatsPageComponent),
  },
  {
    path: 'conectar-whatsapp',
    title: 'Conectar WhatsApp | DizAI',
    loadComponent: () =>
      import('./features/conectar-whatsapp/conectar-whatsapp-page.component').then(
        (m) => m.ConectarWhatsappPageComponent,
      ),
  },
  {
    path: 'contatos-ignorados',
    title: 'Contatos a ignorar | DizAI',
    loadComponent: () =>
      import('./features/contatos-ignorados/contatos-ignorados-page.component').then(
        (m) => m.ContatosIgnoradosPageComponent,
      ),
  },
  {
    path: 'admin',
    title: 'Gerenciamento | DizAI',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/admin-page.component').then((m) => m.AdminPageComponent),
  },
];

export const routes: Routes = [
  {
    path: '',
    title: 'DizAI — atendente com IA no WhatsApp para pequenos negócios',
    loadComponent: () =>
      import('./features/landing/landing-page.component').then((m) => m.LandingPageComponent),
  },
  {
    path: 'cadastro',
    title: 'Criar minha loja | DizAI',
    canActivate: [visitanteGuard],
    loadComponent: () =>
      import('./features/cadastro/cadastro-page.component').then((m) => m.CadastroPageComponent),
  },
  {
    path: 'entrar',
    title: 'Entrar | DizAI',
    canActivate: [visitanteGuard],
    loadComponent: () =>
      import('./features/entrar/entrar-page.component').then((m) => m.EntrarPageComponent),
  },
  { path: 'painel', pathMatch: 'full', redirectTo: redirecionarParaPainel },
  {
    path: 'painel/:perfilId',
    canActivate: [painelGuard],
    resolve: { perfilCarregado: perfilResolver },
    children: rotasDoPainel,
  },
  {
    path: 'privacidade',
    title: 'Política de Privacidade | DizAI',
    loadComponent: () =>
      import('./features/privacidade/privacidade-page.component').then((m) => m.PrivacidadePageComponent),
  },
  {
    // galeria pública: endereço curto, ex.: dizai.com/l/studio-bella
    path: 'l/:slug',
    title: 'Galeria de trabalhos',
    loadComponent: () =>
      import('./features/vitrine-publica/vitrine-publica-page.component').then(
        (m) => m.VitrinePublicaPageComponent,
      ),
  },
  {
    // a mesma página já aberta na aba Agenda (link para divulgar), ex.: dizai.com/l/studio-bella/agenda
    path: 'l/:slug/agenda',
    title: 'Agenda online',
    data: { aba: 'agenda' },
    loadComponent: () =>
      import('./features/vitrine-publica/vitrine-publica-page.component').then(
        (m) => m.VitrinePublicaPageComponent,
      ),
  },
  // endereço antigo da galeria: links já enviados aos clientes continuam funcionando
  { path: 'loja/:slug', redirectTo: 'l/:slug' },
  { path: '**', redirectTo: '' },
];
