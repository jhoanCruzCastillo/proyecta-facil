import type { SolicitudAsesoria, MensajeAsesoria, TipoAsesoria } from '@/types';

export interface CrearSolicitudAsesoriaData {
  clienteId: string;
  docenteId: string;
  tipo: TipoAsesoria;
  mensajeInicial?: string;
  ejemploId?: string;
}

export interface AsesoriaApi {
  misSolicitudes(usuarioId: string, rol: 'cliente' | 'docente'): Promise<SolicitudAsesoria[]>;
  crear(data: CrearSolicitudAsesoriaData): Promise<SolicitudAsesoria>;
  aceptar(solicitudId: string, linkReunion?: string): Promise<SolicitudAsesoria>;
  rechazar(solicitudId: string): Promise<SolicitudAsesoria>;
  finalizar(solicitudId: string): Promise<SolicitudAsesoria>;
  mensajes(solicitudId: string): Promise<MensajeAsesoria[]>;
  enviarMensaje(solicitudId: string, autorId: string, texto: string): Promise<MensajeAsesoria[]>;
}
