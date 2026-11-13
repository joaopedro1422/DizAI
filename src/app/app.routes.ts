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
    path: 'atendimento',
    title: 'Como o assistente atende | DizAI',
    loadComponent: () =>
      import('./features/atendimento/atendimento-page.component').then((m) => m.AtendimentoPageComponent),
  },
  {
    path: 'estatisticas',
    title: 'Estatísticas | DizAI',
    loadComponent: () =>
      import('./features/estatisticas/estatisticas-page.component').then((m) => m.EstatisticasPageComponent),
  },
  {
    // gerador de posts para redes sociais (artes com a logo, as cores e as fotos da loja)
    path: 'posts',
    title: 'Posts para redes sociais | DizAI',
    loadComponent: () => import('./features/posts/posts-page.component').then((m) => m.PostsPageComponent),
  },
  {
    // campanhas de WhatsApp: promoção, novidade, convite, datas especiais e as oportunidades que o DizAI encontra
    path: 'campanhas',
    title: 'Campanhas | DizAI',
    loadComponent: () => import('./features/campanhas/campanhas-page.component').then((m) => m.CampanhasPageComponent),
  },
  {
    path: 'agenda',
    title: 'Agenda | DizAI',
    loadComponent: () => import('./features/agenda/agenda-page.component').then((m) => m.AgendaPageComponent),
  },
  {
    // lojas de produtos: os pedidos confirmados no Chats até a entrega, e o faturamento
    path: 'pedidos',
    title: 'Pedidos | DizAI',
    loadComponent: () => import('./features/pedidos/pedidos-page.component').then((m) => m.PedidosPageComponent),
  },
  {
    path: 'chats',
    title: 'Chats | DizAI',
    loadComponent: () =>
      import('./features/chats/chats-page.component').then((m) => m.ChatsPageComponent),
  },
  {
    path: 'clientes',
    title: 'Clientes | DizAI',
    loadComponent: () =>
      import('./features/clientes/clientes-page.component').then((m) => m.ClientesPageComponent),
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
    pathMatch: 'full',
    title: 'DizAI — atendente com IA no WhatsApp para pequenos negócios',
    loadComponent: () => import('./features/landing-nova/hub/hub-page.component').then((m) => m.HubPageComponent),
  },
  // as duas landings na marca nova (landing-nova): o tipo vai no data e chega como input (withComponentInputBinding)
  {
    path: 'vendas',
    data: { tipo: 'produtos' },
    loadComponent: () =>
      import('./features/landing-nova/landing/landing-nova.component').then((m) => m.LandingNovaComponent),
  },
  {
    path: 'agendamentos',
    data: { tipo: 'servicos' },
    loadComponent: () =>
      import('./features/landing-nova/landing/landing-nova.component').then((m) => m.LandingNovaComponent),
  },
  // páginas de cada recurso (vitrine, posts e campanhas), por público: o tipo vem no data
  {
    path: 'vendas/vitrine',
    data: { tipo: 'produtos' },
    title: 'Vitrine online para a bio do Instagram | DizAI',
    loadComponent: () =>
      import('./features/landing-nova/recursos/vitrine/recurso-vitrine.component').then((m) => m.RecursoVitrineComponent),
  },
  {
    path: 'agendamentos/vitrine',
    data: { tipo: 'servicos' },
    title: 'Vitrine e agenda online | DizAI',
    loadComponent: () =>
      import('./features/landing-nova/recursos/vitrine/recurso-vitrine.component').then((m) => m.RecursoVitrineComponent),
  },
  {
    path: 'vendas/posts',
    data: { tipo: 'produtos' },
    title: 'Posts para o Instagram com a sua marca | DizAI',
    loadComponent: () =>
      import('./features/landing-nova/recursos/posts/recurso-posts.component').then((m) => m.RecursoPostsComponent),
  },
  {
    path: 'agendamentos/posts',
    data: { tipo: 'servicos' },
    title: 'Posts para o Instagram com a sua marca | DizAI',
    loadComponent: () =>
      import('./features/landing-nova/recursos/posts/recurso-posts.component').then((m) => m.RecursoPostsComponent),
  },
  {
    path: 'vendas/campanhas',
    data: { tipo: 'produtos' },
    title: 'Campanhas no WhatsApp para vender mais | DizAI',
    loadComponent: () =>
      import('./features/landing-nova/recursos/campanhas/recurso-campanhas.component').then((m) => m.RecursoCampanhasComponent),
  },
  {
    path: 'agendamentos/campanhas',
    data: { tipo: 'servicos' },
    title: 'Campanhas no WhatsApp para encher a agenda | DizAI',
    loadComponent: () =>
      import('./features/landing-nova/recursos/campanhas/recurso-campanhas.component').then((m) => m.RecursoCampanhasComponent),
  },
  {
    path: 'demonstracao',
    title: 'Veja o DizAI atendendo | DizAI',
    loadComponent: () =>
      import('./features/demonstracao/demonstracao-page.component').then((m) => m.DemonstracaoPageComponent),
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
    // uma foto da galeria, sozinha: o link que o cliente manda pelo "Enviar pelo WhatsApp", ex.: dizai.com/l/studio-bella/foto/42
    path: 'l/:slug/foto/:fotoId',
    title: 'Foto',
    loadComponent: () =>
      import('./features/vitrine-publica/foto-compartilhada/foto-compartilhada-page.component').then(
        (m) => m.FotoCompartilhadaPageComponent,
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
  {
    // a mesma página já aberta na aba Orçamento (lojas de produtos), ex.: dizai.com/l/mix-salgados/orcamento
    path: 'l/:slug/orcamento',
    title: 'Orçamento',
    data: { aba: 'orcamento' },
    loadComponent: () =>
      import('./features/vitrine-publica/vitrine-publica-page.component').then(
        (m) => m.VitrinePublicaPageComponent,
      ),
  },
  // endereço antigo da galeria: links já enviados aos clientes continuam funcionando
  { path: 'loja/:slug', redirectTo: 'l/:slug' },
  { path: '**', redirectTo: '' },
];
