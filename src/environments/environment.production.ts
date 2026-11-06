export const environment = {
  production: true,
  /**
   * A API no Railway (o navegador chama direto; o backend libera o domínio do front em DIZAI_ORIGENS_PERMITIDAS).
   * Se um dia a API ganhar domínio próprio (ex.: api.dizai.com.br), troque aqui.
   */
  apiUrl: 'https://dizai-backend-production.up.railway.app',
  firebaseStorageBucket: 'dizai-f78bd.firebasestorage.app',
  meta: {
    /** App da Meta e configuração do "Login do Facebook para Empresas" (IDs públicos, os mesmos do desenvolvimento). */
    appId: '28999328156373119',
    configId: '1441580931483580',
    versaoGraphApi: 'v24.0',
  },
};
