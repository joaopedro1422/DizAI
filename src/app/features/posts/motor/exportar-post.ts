/**
 * A arte (HTML/CSS) vira PNG no navegador com o html-to-image (import dinâmico: só carrega ao baixar ou compartilhar).
 * As fontes do Google entram embutidas na imagem: o CSS delas é lido dos links do index.html e os arquivos .woff2
 * viram data URLs (só os subconjuntos latinos das famílias que a arte usa). As fotos já chegam em data URL
 * (PostsService.imagem), então nada depende de CORS na hora de desenhar.
 */

const cssDosLinks = new Map<string, Promise<string>>();
const arquivosDeFonte = new Map<string, Promise<string>>();

/** "'Playfair Display', serif" -> "Playfair Display" */
export function nomeDaFamilia(fonteCss: string): string {
  return fonteCss.split(',')[0].replace(/['"]/g, '').trim();
}

function lerCss(href: string): Promise<string> {
  if (!cssDosLinks.has(href)) {
    cssDosLinks.set(href, fetch(href).then((r) => (r.ok ? r.text() : '')).catch(() => ''));
  }
  return cssDosLinks.get(href)!;
}

function arquivoComoDataUrl(url: string): Promise<string> {
  if (!arquivosDeFonte.has(url)) {
    arquivosDeFonte.set(
      url,
      fetch(url)
        .then((r) => r.blob())
        .then(
          (blob) =>
            new Promise<string>((resolver, rejeitar) => {
              const leitor = new FileReader();
              leitor.onload = () => resolver(String(leitor.result));
              leitor.onerror = () => rejeitar(leitor.error);
              leitor.readAsDataURL(blob);
            }),
        ),
    );
  }
  return arquivosDeFonte.get(url)!;
}

/** O @font-face (com os arquivos embutidos) das famílias usadas na arte. */
async function cssDasFontes(familias: string[]): Promise<string> {
  const links = [...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"][href*="fonts.googleapis.com"]')]
    .map((link) => link.href);
  const css = (await Promise.all(links.map(lerCss))).join('\n');
  const blocos = [...css.matchAll(/\/\*\s*([\w-]+)\s*\*\/\s*(@font-face\s*\{[^}]*\})/g)]
    .filter(([, subconjunto, bloco]) => {
      const familia = /font-family:\s*['"]?([^;'"]+)/.exec(bloco)?.[1]?.trim();
      return (subconjunto === 'latin' || subconjunto === 'latin-ext') && !!familia && familias.includes(familia);
    })
    .map(([, , bloco]) => bloco);
  const embutidos = await Promise.all(
    blocos.map(async (bloco) => {
      const url = /url\(([^)]+)\)/.exec(bloco)?.[1]?.replace(/['"]/g, '');
      if (!url) return bloco;
      try {
        return bloco.replace(url, await arquivoComoDataUrl(url));
      } catch {
        return bloco;
      }
    }),
  );
  return embutidos.join('\n');
}

/** A arte em PNG, no tamanho real (1080 px de largura). */
export async function gerarPng(elemento: HTMLElement, largura: number, altura: number, familias: string[]): Promise<Blob> {
  const [{ toBlob }, fontEmbedCSS] = await Promise.all([import('html-to-image'), cssDasFontes(familias)]);
  await document.fonts.ready;
  const opcoes = {
    width: largura,
    height: altura,
    pixelRatio: 1,
    fontEmbedCSS,
    // a prévia está reduzida por transform: a imagem sai sem ela, no tamanho real
    style: { transform: 'none', left: '0', top: '0' },
  };
  // a primeira passada aquece as imagens no Safari (sem ela, às vezes a foto sai em branco)
  await toBlob(elemento, opcoes).catch(() => null);
  const blob = await toBlob(elemento, opcoes);
  if (!blob) {
    throw new Error('Não foi possível gerar a imagem.');
  }
  return blob;
}

/** Salva o PNG no aparelho. */
export function baixarArquivo(blob: Blob, nome: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nome;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/** No celular, abre o compartilhamento do sistema (Instagram, WhatsApp...) com a imagem. false = não suportado. */
export async function compartilharArquivo(blob: Blob, nome: string, texto: string): Promise<boolean> {
  const arquivo = new File([blob], nome, { type: 'image/png' });
  if (!navigator.canShare?.({ files: [arquivo] })) {
    return false;
  }
  try {
    await navigator.share({ files: [arquivo], text: texto });
  } catch (erro) {
    // o usuário fechou o compartilhamento: não é erro
    if ((erro as DOMException)?.name !== 'AbortError') throw erro;
  }
  return true;
}
