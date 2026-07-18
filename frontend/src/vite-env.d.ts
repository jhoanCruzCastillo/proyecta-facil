/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MOCK_SECTORES: string
  readonly VITE_MOCK_PLANTILLAS: string
  readonly VITE_MOCK_EJEMPLOS: string
  readonly VITE_MOCK_USUARIOS: string
  readonly VITE_MOCK_MENTORIAS: string
  readonly VITE_MOCK_FACTURACION: string
  readonly VITE_MOCK_ARCHIVOS_EXCEL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
