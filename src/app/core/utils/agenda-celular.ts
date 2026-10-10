import { normalizarTelefoneBrasil } from './telefone.utils';

/**
 * Seletor de contatos do navegador (Contact Picker API).
 * O celular abre a própria agenda e o site recebe só os contatos que a pessoa escolheu.
 * Funciona no Chrome do Android; no iPhone e no computador o botão não aparece.
 */
interface ContatoDaAgenda {
  name?: string[];
  tel?: string[];
}

interface SeletorDeContatos {
  select(propriedades: ('name' | 'tel')[], opcoes?: { multiple?: boolean }): Promise<ContatoDaAgenda[]>;
}

type NavegadorComAgenda = Navigator & { contacts: SeletorDeContatos };

export function agendaDoCelularDisponivel(): boolean {
  return typeof window !== 'undefined' && 'contacts' in navigator && 'ContactsManager' in window;
}

/** Abre a agenda e devolve os contatos escolhidos que têm um número brasileiro válido. */
export async function escolherContatosDaAgenda(): Promise<{ nome: string; whatsapp: string }[]> {
  const escolhidos = await (navigator as NavegadorComAgenda).contacts.select(['name', 'tel'], { multiple: true });
  return escolhidos.flatMap((contato) => {
    const whatsapp = (contato.tel ?? []).map(normalizarTelefoneBrasil).find((numero) => numero !== null);
    return whatsapp ? [{ nome: contato.name?.[0]?.trim() ?? '', whatsapp }] : [];
  });
}
