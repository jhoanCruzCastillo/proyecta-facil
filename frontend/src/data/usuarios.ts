import type { Usuario } from '@/types';

// Credenciales de demostración. Cuando el backend real (CodeIgniter 4 + MariaDB) exponga
// autenticación, este archivo desaparece y la validación se hace contra la API.
export const usuarios: Usuario[] = [
  {
    id: 'usr-1',
    nombre: 'Carlos Núñez',
    usuario: 'superuser',
    password: 'Super#2026',
    rol: 'superusuario',
  },
  {
    id: 'usr-2',
    nombre: 'María Quispe',
    usuario: 'admin',
    password: 'Admin#2026',
    rol: 'administrador',
  },
  {
    id: 'usr-3',
    nombre: 'Juan Pérez',
    usuario: 'cliente',
    password: 'Cliente#2026',
    rol: 'cliente',
  },
];
