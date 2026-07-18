// Intérprete de Markdown minimalista y sin dependencias — cubre lo que necesita el contenido de
// "Ayuda para llenar" (encabezados, negrita/cursiva/código inline, enlaces, listas, párrafos).
// No es un parser CommonMark completo a propósito: el contenido lo escribe el propio admin, no
// hace falta soportar la especificación entera.
//
// A diferencia del original en React (que construye nodos JSX), acá se genera un string de HTML
// para usar con `v-html` — el texto crudo se escapa ANTES de aplicar los patrones de markdown, así
// que el HTML final solo contiene las etiquetas que este módulo arma explícitamente.

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function esUrlSegura(url: string): boolean {
  return /^(https?:|mailto:)/i.test(url.trim());
}

function renderInline(textoEscapado: string): string {
  const patron = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|\[(.+?)\]\((.+?)\))/;
  let resultado = '';
  let restante = textoEscapado;
  while (restante) {
    const m = restante.match(patron);
    if (!m || m.index === undefined) {
      resultado += restante;
      break;
    }
    if (m.index > 0) resultado += restante.slice(0, m.index);
    if (m[2] !== undefined) {
      resultado += `<strong>${m[2]}</strong>`;
    } else if (m[3] !== undefined) {
      resultado += `<em>${m[3]}</em>`;
    } else if (m[4] !== undefined) {
      resultado += `<code class="px-1 py-0.5 rounded bg-gray-100 text-[13px] font-mono">${m[4]}</code>`;
    } else if (m[5] !== undefined && m[6] !== undefined) {
      resultado = esUrlSegura(m[6])
        ? resultado + `<a href="${m[6]}" target="_blank" rel="noreferrer" class="text-brand-600 underline">${m[5]}</a>`
        : resultado + m[5];
    }
    restante = restante.slice(m.index + m[0].length);
  }
  return resultado;
}

export function renderMarkdown(texto: string): string {
  if (!texto.trim()) return '';
  const lineas = escapeHtml(texto).split('\n');
  const bloques: string[] = [];
  let lista: { tipo: 'ul' | 'ol'; items: string[] } | null = null;

  const cerrarLista = () => {
    if (!lista) return;
    const clases = lista.tipo === 'ul' ? 'list-disc pl-5 space-y-1 my-2' : 'list-decimal pl-5 space-y-1 my-2';
    const items = lista.items.map((item) => `<li class="text-sm text-gray-700 leading-relaxed">${renderInline(item)}</li>`).join('');
    bloques.push(`<${lista.tipo} class="${clases}">${items}</${lista.tipo}>`);
    lista = null;
  };

  for (const linea of lineas) {
    const trim = linea.trim();
    if (!trim) {
      cerrarLista();
      continue;
    }

    const encabezado = trim.match(/^(#{1,3})\s+(.*)$/);
    if (encabezado) {
      cerrarLista();
      const nivel = encabezado[1].length;
      const clases = nivel === 1 ? 'text-base font-bold text-heading mt-3 mb-1' : nivel === 2 ? 'text-sm font-bold text-heading mt-3 mb-1' : 'text-sm font-semibold text-heading mt-2 mb-1';
      bloques.push(`<h${nivel} class="${clases}">${renderInline(encabezado[2])}</h${nivel}>`);
      continue;
    }

    const itemUl = trim.match(/^[-*]\s+(.*)$/);
    if (itemUl) {
      if (!lista || lista.tipo !== 'ul') { cerrarLista(); lista = { tipo: 'ul', items: [] }; }
      lista.items.push(itemUl[1]);
      continue;
    }

    const itemOl = trim.match(/^\d+\.\s+(.*)$/);
    if (itemOl) {
      if (!lista || lista.tipo !== 'ol') { cerrarLista(); lista = { tipo: 'ol', items: [] }; }
      lista.items.push(itemOl[1]);
      continue;
    }

    cerrarLista();
    bloques.push(`<p class="text-sm text-gray-700 leading-relaxed">${renderInline(trim)}</p>`);
  }
  cerrarLista();

  return `<div class="space-y-1">${bloques.join('')}</div>`;
}
