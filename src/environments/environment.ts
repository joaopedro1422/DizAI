/**
 * Configuração usada no `ng serve` (desenvolvimento).
 * Em produção, o angular.json troca este arquivo por `environment.production.ts`.
 */
export const environment = {
  production: false,
  /**
   * Vazio = mesmo endereço do front. No `ng serve`, o proxy.conf.json repassa /api, /public e /arquivos
   * para o backend em http://localhost:8080, então o navegador nem precisa de CORS em desenvolvimento.
   */
  apiUrl: '',
  /** App da Meta usado no cadastro incorporado do WhatsApp (Embedded Signup). */
  /**
   * Bucket do Firebase Storage onde o backend grava as imagens (o mesmo de dizai.firebase.bucket),
   * ex.: 'meu-projeto.firebasestorage.app'. Vazio: as imagens vêm da pasta local do backend ({apiUrl}/arquivos).
   */
  firebaseStorageBucket: 'dizai-f78bd.firebasestorage.app',
  meta: {
    appId: '28999328156373119',
    /** ID da configuração do "Login do Facebook para Empresas" criada para o WhatsApp. */
    configId: '1441580931483580',
    versaoGraphApi: 'v24.0',
  },
};
