import type { ColumnaTabla, ConfigTabla, SubtipoTabla } from '../types';

export interface FilaDinamica { [colId: string]: string | string[] }
export interface GrupoFilas {
  grupo: string;
  filas: FilaDinamica[];
  /** Valores propios de la fila de título del grupo, en las columnas que quedan a la derecha de
   * `agrupadorAbarcaColumnas` (ej. una fila-resumen como "Nivel de cobertura..." que no tiene filas
   * hijas propias, solo un valor por columna en su propia fila fusionada). */
  valoresGrupo?: FilaDinamica;
}

/** 'jerarquica' y 'jerarquica_dinamica' comparten el mismo árbol de niveles (la variante dinámica
 * solo agrega una columna que se repite por período) — este helper evita repetir el OR en cada
 * archivo que necesita distinguir "es alguna variante jerárquica" de las tablas planas. */
export function esJerarquica(subtipo: SubtipoTabla): boolean {
  return subtipo === 'jerarquica' || subtipo === 'jerarquica_dinamica';
}

export interface TreeNode {
  /** Array cuando este nivel de profundidad es `config.columnaDinamicaId` (un valor por período), string en cualquier otro nivel */
  value: string | string[];
  children: TreeNode[];
}

/** Lista editable de nombres de las columnas dinámicas generadas (ej. años, tareas, alternativas...) */
export function getPeriodos(config: ConfigTabla): string[] {
  return config.periodos ?? [];
}

function emptyRow(config: ConfigTabla): FilaDinamica {
  const row: FilaDinamica = {};
  if (config.columnaDinamicaId) row[config.columnaDinamicaId] = getPeriodos(config).map(() => '');
  return row;
}

export function newEmptyRow(config: ConfigTabla): FilaDinamica {
  return emptyRow(config);
}

export function parseDynamicRows(value: string, config: ConfigTabla): FilaDinamica[] {
  try {
    const p = JSON.parse(value);
    if (Array.isArray(p) && (p.length === 0 || (!('value' in p[0]) && !('filas' in p[0])))) return p;
  } catch { /* valor previo no es JSON (placeholder viejo) */ }
  return Array.from({ length: config.filasIniciales ?? 3 }, () => emptyRow(config));
}

export function parseGroupedRows(value: string, config: ConfigTabla): GrupoFilas[] {
  try {
    const p = JSON.parse(value);
    if (Array.isArray(p) && p.length > 0 && 'filas' in p[0]) return p;
  } catch { /* valor previo no es JSON (placeholder viejo) */ }
  return [{ grupo: 'Grupo 1', filas: Array.from({ length: config.filasIniciales ?? 3 }, () => emptyRow(config)) }];
}

function valorInicialNivel(columns: ColumnaTabla[], config: ConfigTabla, depth: number): string | string[] {
  return columns[depth]?.id === config.columnaDinamicaId ? getPeriodos(config).map(() => '') : '';
}

export function createNodeChain(columns: ColumnaTabla[], config: ConfigTabla, depth = 0): TreeNode {
  const value = valorInicialNivel(columns, config, depth);
  if (depth >= columns.length - 1) return { value, children: [] };
  return { value, children: [createNodeChain(columns, config, depth + 1)] };
}

/** Profundidad (índice en columns) del primer nivel "hijo" después de la cadena de niveles "padre"
 * — es el nivel que, con config.agrupador activo en una tabla jerárquica, se renderiza como fila de
 * título de grupo de ancho completo en vez de celda fusionada a la izquierda (igual patrón visual
 * que GroupedRowsEditor usa para tablas planas). */
export function agrupadorProfundidad(columns: ColumnaTabla[]): number {
  const idx = columns.findIndex((c) => c.nivel !== 'padre');
  return idx === -1 ? 0 : idx;
}

export function parseTree(value: string, columns: ColumnaTabla[], config: ConfigTabla): TreeNode[] {
  try {
    const p = JSON.parse(value);
    if (Array.isArray(p) && p.length > 0 && 'value' in p[0]) return p;
  } catch { /* valor previo no es JSON (placeholder viejo) */ }
  return [createNodeChain(columns, config)];
}
