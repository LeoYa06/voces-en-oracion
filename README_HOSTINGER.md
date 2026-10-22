# Voces en Oración — versión de presentación

Lema: «A los pies de Jesús».

## Qué incluye
- Identidad visual basada en el emblema proporcionado.
- Sección Evangelio del día con una cita de muestra y preguntas de reflexión.
- Intenciones de oración con formulario demostrativo.
- Próximo encuentro de la comunidad.
- Diseño adaptable a celulares y computadoras.
- Sin acceso de miembros en esta primera versión.

## Antes de compartir
Esta es una versión de presentación. Las intenciones nuevas solo se guardan temporalmente en el navegador donde se escriben; no se comparten entre dispositivos. La cita del Evangelio es una muestra, no una actualización automática diaria. Sustituye la cita y el texto por el Evangelio correcto antes de presentarlo como contenido del día. Confirma también la fecha de la próxima reunión.

## Preparar los archivos para Hostinger
1. Instala Node.js LTS si aún no está instalado: https://nodejs.org/
2. Abre esta carpeta en Visual Studio Code.
3. En Terminal > New Terminal ejecuta:
   ```bash
   npm install
   npm run build
   ```
4. Cuando termine, se creará una carpeta `dist`.
5. En Hostinger abre el administrador de archivos de tu sitio y entra en `public_html` (o en la carpeta de la web donde quieras publicar esta página).
6. Sube **el contenido de la carpeta `dist`**, no la carpeta `dist` completa. Debe quedar `index.html` directamente dentro de `public_html` y también la carpeta `assets` y `logo-voces.png`.
7. Si ya existe una página en ese directorio, descarga una copia antes de reemplazar archivos.
8. Abre tu dominio en una ventana privada para comprobarlo desde cero.

## Importante
No se configura Supabase en esta versión, no se necesita base de datos para mostrar la demostración y no se deben introducir peticiones reales sensibles todavía. Para una versión comunitaria real habrá que añadir almacenamiento compartido, protección contra spam y moderación antes de recibir intenciones públicas.
