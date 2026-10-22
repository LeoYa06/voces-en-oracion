# A los pies de Jesús — prototipo inicial

Aplicación web gratuita para una comunidad católica de oración. Diseñada para móviles y computadoras.

## Qué incluye

- Página pública de bienvenida.
- Secciones de oraciones, intenciones y reuniones.
- Formulario de intención y gesto «Estoy orando por ti».
- Ventana inicial de acceso de miembros mediante enlace por correo.
- Esquema inicial de Supabase con Row Level Security (RLS).

## Importante: estado actual

Este es un **prototipo de desarrollo**, no una aplicación lista para publicar con usuarios reales.
- Sin Supabase configurado, los datos de ejemplo y los cambios se guardan solo en la sesión del navegador.
- La autenticación por correo necesita configuración en Supabase.
- Las intenciones nuevas se envían como `pending`; aún hace falta un panel seguro para aprobarlas.
- El horario de reunión es un dato de ejemplo que debe confirmarse.
- El esquema SQL es una base inicial y debe revisarse/probarse antes de manejar información real.
- No se debe publicar información médica, datos privados ni peticiones sobre terceros sin autorización.

## Requisitos

- Node.js LTS instalado
- Un terminal (PowerShell en Windows funciona)
- Opcional para datos compartidos: una cuenta/proyecto de Supabase

## Ejecutar en tu computadora

1. Descomprime el archivo.
2. Abre una terminal dentro de la carpeta `a_los_pies_de_jesus`.
3. Ejecuta:

   ```bash
   npm install
   npm run dev
   ```

4. Abre la dirección local que Vite muestre, normalmente `http://localhost:5173`.

## Conectar Supabase (cuando estemos listos)

1. Crea un proyecto Supabase.
2. En `supabase/schema.sql`, revisa el esquema y las políticas con cuidado; ejecútalo en SQL Editor solo en un proyecto nuevo/de prueba.
3. Copia `.env.example` como `.env.local`.
4. Completa `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` con la URL y la clave publicable de tu proyecto.
5. Reinicia el servidor de desarrollo.

Nunca coloques la clave `service_role` en una variable `VITE_` ni en el código del navegador.

## Siguientes tareas de desarrollo

1. Probar el proyecto localmente.
2. Crear flujo de alta/invitación y aprobación de miembros.
3. Crear panel de moderación con permisos seguros.
4. Implementar lectura/escritura reales y conteo de apoyos de oración.
5. Añadir gestión de reuniones y políticas de privacidad.
6. Desplegar en un hosting y probar desde varios teléfonos.

## Principios del proyecto

- Gratis para funciones de oración.
- Acceso público de solo lectura al contenido aprobado.
- Publicación mediante cuenta.
- Área privada para miembros aprobados.
- Respeto, moderación y privacidad.
