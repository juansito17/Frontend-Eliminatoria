# Frontend - Eliminatoria

Aplicación frontend construida con Next.js y TypeScript para la gestión de labores, cultivos y reportes.

## Tabla de contenido
- [Descripción](#descripción)
- [Stack tecnológico](#stack-tecnológico)
- [Requisitos](#requisitos)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Variables de entorno](#variables-de-entorno)
- [Estructura principal del proyecto](#estructura-principal-del-proyecto)
- [Scripts disponibles](#scripts-disponibles)
- [Despliegue](#despliegue)
- [Contribución](#contribución)
- [Contacto](#contacto)

## Descripción
Frontend para la plataforma Eliminatoria. Proporciona interfaces para:
- Login / registro de usuarios
- Gestión de cultivos, labórs y trabajadores
- Visualización de reportes y dashboard
- Registro de labores y alertas

## Stack tecnológico
- Next.js (App Router)
- TypeScript
- React
- Fetch / API Routes integradas
- Tailwind / CSS global (según configuración del proyecto)

## Requisitos
- Node.js v16+ (recomendado v18+)
- npm o pnpm/yarn

## Instalación y ejecución
1. Clonar el repositorio (si aplica)
2. Instalar dependencias
```bash
npm install
```
3. Levantar en modo desarrollo
```bash
npm run dev
```
4. Compilar para producción
```bash
npm run build
```
5. Ejecutar en producción
```bash
npm run start
```

## Variables de entorno
Crear un archivo `.env.local` en la raíz del frontend si necesitas sobrescribir valores. Ejemplo mínimo:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXTAUTH_SECRET=tu_secreto_si_se_usa
```
Nota: las variables con prefijo `NEXT_PUBLIC_` son expuestas al cliente.

Hay un archivo `Frontend-Eliminatoria/.env.example` con ejemplos que puedes copiar a `.env.local` y completar con tus valores reales. No subas `.env.local` al repositorio.

## Estructura principal del proyecto
- src/app/ — rutas y páginas (App Router)
- src/app/components/ — componentes reutilizables (tablas, formularios, modales, etc.)
- src/app/hooks/ — hooks personalizados para llamadas y lógica
- src/app/context/ — providers (auth, etc.)
- src/app/api/ — rutas API internas (mock / proxys)
- public/ — assets públicos (imágenes, svg)

## Scripts disponibles
Los scripts disponibles en package.json típicamente son:
```bash
npm run dev      # modo desarrollo
npm run build    # compilar para producción
npm run start    # iniciar servidor de producción
npm run lint     # análisis de código
npm run test     # ejecutar tests (si aplica)
```

## Despliegue
La app está lista para desplegar en Vercel o cualquier hosting compatible con Next.js. Asegúrate de configurar las variables de entorno en el panel de despliegue (`NEXT_PUBLIC_API_URL`, `NEXTAUTH_SECRET`, etc.).

## Contribución
- Seguir convenciones de TypeScript y ESLint configuradas en el proyecto.
- Abrir PRs pequeños y con descripción clara.
- Añadir tests o instrucciones si se modifica behavior crítico.

## Notas
- Las llamadas a la API consumen el backend ubicado en `Backend_Eliminatoria`; verifica que el backend esté corriendo o que `NEXT_PUBLIC_API_URL` apunte a la URL correcta.
- Revisar `src/app/context/AuthContext.tsx` para entender la lógica de autenticación y permisos.

## Contacto
Para dudas o problemas: revisar los controladores y hooks en `src/app/api/` y `src/app/hooks/` o contactar al equipo responsable del repositorio.
