import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { urlDoPerfil } from '../../core/api/api-url';
import { buscarCorMarca } from '../../core/constants/cores-marca';
import { PerfilService } from '../../core/services/perfil.service';

/** Um número em destaque no topo do relatório (o primeiro sai em cor, como o card azul da tela). */
export interface DestaqueRelatorio {
  rotulo: string;
  valor: string;
  nota?: string;
}

/** Uma tabela do relatório. `direita`: índices das colunas alinhadas à direita (números e valores). */
export interface SecaoRelatorio {
  titulo: string;
  subtitulo?: string;
  colunas: string[];
  linhas: string[][];
  direita?: number[];
  /** Texto quando não há linhas. */
  vazio: string;
}

/** O gráfico de colunas do faturamento (por dia, semana ou mês). */
export interface GraficoRelatorio {
  titulo: string;
  subtitulo: string;
  pontos: { rotulo: string; valor: number }[];
  formatar: (valor: number) => string;
  vazio: string;
}

export interface RelatorioNumeros {
  /** "Relatório da agenda" / "Relatório de pedidos". */
  titulo: string;
  /** "Outubro de 2026", "Ano de 2026" ou "Últimos 30 dias (26/09 a 25/10/2026)". */
  periodo: string;
  /** Nome do arquivo, sem ".pdf". */
  arquivo: string;
  destaques: DestaqueRelatorio[];
  grafico?: GraficoRelatorio;
  secoes: SecaoRelatorio[];
}

// A4 em milímetros
const LARGURA = 210;
const ALTURA = 297;
const MARGEM = 16;
const UTIL = LARGURA - 2 * MARGEM;
const RODAPE = 14;
const CINZA = '#5B6475';
const CINZA_CLARO = '#E3E7EE';
const TEXTO = '#141A26';

/**
 * Relatório dos Números (agenda e pedidos) em PDF, gerado no navegador: cabeçalho com a logo e o nome da loja na cor
 * da marca, o período escolhido, os números em destaque, o gráfico do faturamento e as tabelas. O jsPDF só é baixado
 * quando alguém exporta (não pesa no carregamento do painel). A logo vem do backend (GET .../arquivos/logo), porque o
 * Firebase Storage não libera CORS; sem logo, saem as iniciais.
 */
@Injectable({ providedIn: 'root' })
export class RelatorioPdfService {
  private readonly http = inject(HttpClient);
  private readonly perfil = inject(PerfilService).perfil;

  async exportar(relatorio: RelatorioNumeros): Promise<void> {
    const perfil = this.perfil();
    const [{ jsPDF }, moduloTabela, logo] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable'),
      this.carregarLogo(perfil.id),
    ]);
    // o jspdf-autotable é CommonJS: no import dinâmico a função pode vir em default ou em default.default
    const comoModulo = moduloTabela as unknown as { default: unknown; autoTable?: unknown };
    const autoTable = (typeof comoModulo.default === 'function'
      ? comoModulo.default
      : (comoModulo.default as { default?: unknown; autoTable?: unknown }).default ??
        (comoModulo.default as { autoTable?: unknown }).autoTable ??
        comoModulo.autoTable) as typeof moduloTabela.default;
    const cor = buscarCorMarca(perfil.corMarca).hex;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    let y = this.cabecalho(doc, relatorio, perfil.nomeLoja, logo, cor);

    // ------------------------------------------------------------ destaques (3 por linha)
    const porLinha = 3;
    const espaco = 4;
    const largura = (UTIL - espaco * (porLinha - 1)) / porLinha;
    const altura = 22;
    relatorio.destaques.forEach((destaque, i) => {
      const coluna = i % porLinha;
      if (coluna === 0 && i > 0) y += altura + espaco;
      const x = MARGEM + coluna * (largura + espaco);
      const principal = i === 0;
      doc.setDrawColor(principal ? cor : CINZA_CLARO);
      doc.setFillColor(principal ? cor : '#F7F8FB');
      doc.roundedRect(x, y, largura, altura, 2.5, 2.5, 'FD');
      doc.setTextColor(principal ? '#FFFFFF' : CINZA);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(destaque.rotulo, x + 4, y + 6);
      doc.setTextColor(principal ? '#FFFFFF' : TEXTO);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text(destaque.valor, x + 4, y + 13.5);
      if (destaque.nota) {
        doc.setTextColor(principal ? '#FFFFFF' : CINZA);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.text(doc.splitTextToSize(destaque.nota, largura - 8)[0], x + 4, y + 19);
      }
    });
    y += altura + 10;

    // ------------------------------------------------------------ gráfico do faturamento
    if (relatorio.grafico) {
      y = this.garantirEspaco(doc, y, 70);
      y = this.tituloSecao(doc, relatorio.grafico.titulo, relatorio.grafico.subtitulo, y);
      y = this.grafico(doc, relatorio.grafico, y, cor) + 8;
    }

    // ------------------------------------------------------------ tabelas
    for (const secao of relatorio.secoes) {
      y = this.garantirEspaco(doc, y, 30);
      y = this.tituloSecao(doc, secao.titulo, secao.subtitulo, y);
      if (secao.linhas.length === 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(CINZA);
        doc.text(secao.vazio, MARGEM, y + 3);
        y += 12;
        continue;
      }
      const direita = new Set(secao.direita ?? []);
      autoTable(doc, {
        startY: y,
        margin: { left: MARGEM, right: MARGEM, bottom: RODAPE + 4 },
        head: [secao.colunas],
        body: secao.linhas,
        theme: 'grid',
        styles: { font: 'helvetica', fontSize: 9, cellPadding: 2.2, textColor: TEXTO, lineColor: CINZA_CLARO, lineWidth: 0.2 },
        headStyles: { fillColor: cor, textColor: '#FFFFFF', fontStyle: 'bold', lineColor: cor },
        alternateRowStyles: { fillColor: '#F7F8FB' },
        columnStyles: Object.fromEntries([...direita].map((i) => [i, { halign: 'right' as const }])),
        didParseCell: (dados) => {
          if (dados.section === 'head' && direita.has(dados.column.index)) dados.cell.styles.halign = 'right';
        },
      });
      y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 9;
    }

    this.rodapes(doc);
    doc.save(`${relatorio.arquivo}.pdf`);
  }

  /** Logo, nome da loja, o título e o período; uma faixa na cor da marca separa do resto. Devolve o y seguinte. */
  private cabecalho(
    doc: import('jspdf').jsPDF,
    relatorio: RelatorioNumeros,
    nomeLoja: string,
    logo: string | null,
    cor: string,
  ): number {
    const tamanho = 20;
    const topo = 14;
    if (logo) {
      doc.saveGraphicsState();
      doc.roundedRect(MARGEM, topo, tamanho, tamanho, 4, 4, null);
      doc.clip();
      doc.discardPath();
      doc.addImage(logo, 'JPEG', MARGEM, topo, tamanho, tamanho);
      doc.restoreGraphicsState();
    } else {
      doc.setFillColor(cor);
      doc.roundedRect(MARGEM, topo, tamanho, tamanho, 4, 4, 'F');
      doc.setTextColor('#FFFFFF');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text(iniciais(nomeLoja), MARGEM + tamanho / 2, topo + tamanho / 2 + 1.6, { align: 'center' });
    }

    const x = MARGEM + tamanho + 6;
    doc.setTextColor(TEXTO);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.text(doc.splitTextToSize(nomeLoja || 'Minha loja', 105)[0], x, topo + 7.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(CINZA);
    doc.text(relatorio.titulo, x, topo + 13.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(cor);
    doc.text(relatorio.periodo, x, topo + 19);

    const agora = new Date();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(CINZA);
    doc.text('Gerado em', LARGURA - MARGEM, topo + 6, { align: 'right' });
    doc.text(
      `${agora.toLocaleDateString('pt-BR')} às ${agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
      LARGURA - MARGEM,
      topo + 10.5,
      { align: 'right' },
    );

    const faixa = topo + tamanho + 6;
    doc.setFillColor(cor);
    doc.rect(MARGEM, faixa, UTIL, 0.9, 'F');
    return faixa + 8;
  }

  private tituloSecao(doc: import('jspdf').jsPDF, titulo: string, subtitulo: string | undefined, y: number): number {
    doc.setTextColor(TEXTO);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(titulo, MARGEM, y);
    if (!subtitulo) return y + 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(CINZA);
    doc.text(doc.splitTextToSize(subtitulo, UTIL)[0], MARGEM, y + 4.8);
    return y + 8.5;
  }

  /** Colunas na cor da marca, com o topo e a metade do eixo; rótulos embaixo (todos até 12 pontos). */
  private grafico(doc: import('jspdf').jsPDF, grafico: GraficoRelatorio, y: number, cor: string): number {
    const altura = 46;
    const eixo = 24;   // largura dos rótulos do eixo
    const maximo = Math.max(0, ...grafico.pontos.map((p) => p.valor));
    if (maximo === 0) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(CINZA);
      doc.text(grafico.vazio, MARGEM, y + 3);
      return y + 6;
    }
    const topo = topoRedondo(maximo);
    const area = { x: MARGEM + eixo, y, largura: UTIL - eixo, altura };
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(CINZA);
    doc.setDrawColor(CINZA_CLARO);
    doc.setLineWidth(0.2);
    for (const fracao of [1, 0.5, 0]) {
      const linha = area.y + area.altura * (1 - fracao);
      doc.line(area.x, linha, area.x + area.largura, linha);
      if (fracao > 0) doc.text(grafico.formatar(topo * fracao), area.x - 2, linha + 1, { align: 'right' });
    }
    const n = grafico.pontos.length;
    const passo = area.largura / n;
    const barra = Math.max(0.6, passo * 0.68);
    const meio = Math.floor((n - 1) / 2);
    grafico.pontos.forEach((ponto, i) => {
      const alturaBarra = ponto.valor > 0 ? Math.max(0.6, (ponto.valor / topo) * area.altura) : 0;
      const x = area.x + i * passo + (passo - barra) / 2;
      // a cor de preenchimento é a mesma do texto no jsPDF: define de novo a cada barra (os rótulos mudam para cinza)
      doc.setFillColor(cor);
      if (alturaBarra > 0) doc.rect(x, area.y + area.altura - alturaBarra, barra, alturaBarra, 'F');
      if (n <= 12 || i === 0 || i === meio || i === n - 1) {
        doc.text(ponto.rotulo, x + barra / 2, area.y + area.altura + 4.5, { align: 'center' });
      }
    });
    return area.y + area.altura + 6;
  }

  /** Começa outra página quando o bloco não cabe no que sobrou desta. */
  private garantirEspaco(doc: import('jspdf').jsPDF, y: number, necessario: number): number {
    if (y + necessario <= ALTURA - RODAPE - 4) return y;
    doc.addPage();
    return 18;
  }

  private rodapes(doc: import('jspdf').jsPDF): void {
    const total = doc.getNumberOfPages();
    for (let pagina = 1; pagina <= total; pagina++) {
      doc.setPage(pagina);
      doc.setDrawColor(CINZA_CLARO);
      doc.setLineWidth(0.2);
      doc.line(MARGEM, ALTURA - RODAPE, LARGURA - MARGEM, ALTURA - RODAPE);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(CINZA);
      doc.text('Relatório gerado pelo DizAI', MARGEM, ALTURA - RODAPE + 5);
      doc.text(`Página ${pagina} de ${total}`, LARGURA - MARGEM, ALTURA - RODAPE + 5, { align: 'right' });
    }
  }

  /** A logo quadrada (recortada no centro, fundo branco) em JPEG; null sem logo ou se não deu para baixar. */
  private async carregarLogo(perfilId: string): Promise<string | null> {
    try {
      const resposta = await firstValueFrom(
        this.http.get(urlDoPerfil(perfilId, '/arquivos/logo'), { responseType: 'blob', observe: 'response' }),
      );
      if (resposta.status !== 200 || !resposta.body || resposta.body.size === 0) return null;
      const endereco = URL.createObjectURL(resposta.body);
      try {
        const imagem = await carregarImagem(endereco);
        const lado = Math.min(imagem.naturalWidth, imagem.naturalHeight);
        const tela = document.createElement('canvas');
        tela.width = tela.height = Math.min(lado, 300);   // no PDF ela ocupa 2 cm
        const contexto = tela.getContext('2d');
        if (!contexto) return null;
        contexto.fillStyle = '#FFFFFF';
        contexto.fillRect(0, 0, tela.width, tela.height);
        contexto.drawImage(
          imagem,
          (imagem.naturalWidth - lado) / 2,
          (imagem.naturalHeight - lado) / 2,
          lado,
          lado,
          0,
          0,
          tela.width,
          tela.height,
        );
        return tela.toDataURL('image/jpeg', 0.9);
      } finally {
        URL.revokeObjectURL(endereco);
      }
    } catch {
      return null;
    }
  }
}

function carregarImagem(endereco: string): Promise<HTMLImageElement> {
  return new Promise((resolver, rejeitar) => {
    const imagem = new Image();
    imagem.onload = () => resolver(imagem);
    imagem.onerror = rejeitar;
    imagem.src = endereco;
  });
}

/** "Studio Camila Rocha" -> "SR". */
function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  return ((partes[0][0] ?? '') + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase();
}

/** Topo "redondo" do eixo: 137 -> 150, 820 -> 1000. */
function topoRedondo(maximo: number): number {
  const potencia = 10 ** Math.floor(Math.log10(maximo));
  const passo = [1, 2, 2.5, 5, 10].find((p) => p * potencia >= maximo) ?? 10;
  return passo * potencia;
}

/** "Últimos 30 dias (26/09 a 25/10/2026)", "Outubro de 2026" ou "Ano de 2026". */
export function periodoDoRelatorio(n: { dias: number; mes: string | null; ano?: string | null }, nomeDoMes: (m: string) => string): string {
  if (n.ano) return `Ano de ${n.ano}`;
  if (n.mes) return nomeDoMes(n.mes);
  const hoje = new Date();
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - (n.dias - 1));
  const dia = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  return `Últimos ${n.dias} dias (${dia(inicio)} a ${dia(hoje)}/${hoje.getFullYear()})`;
}

/** Final do nome do arquivo: "2026-10", "2026" ou "ultimos-30-dias". */
export function sufixoDoArquivo(n: { dias: number; mes: string | null; ano?: string | null }): string {
  return n.ano ?? n.mes ?? `ultimos-${n.dias}-dias`;
}

/** SEG -> "Segunda". */
export const DIA_DA_SEMANA_POR_EXTENSO: Record<string, string> = {
  SEG: 'Segunda',
  TER: 'Terça',
  QUA: 'Quarta',
  QUI: 'Quinta',
  SEX: 'Sexta',
  SAB: 'Sábado',
  DOM: 'Domingo',
};
