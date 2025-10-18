# Frontend - Eliminatoria

Aplicación web moderna construida con Next.js 15, React 19 y TypeScript para la gestión integral de operaciones agrícolas de precisión.

## Tabla de contenido
- [Descripción](#descripción)
- [Características principales](#características-principales)
- [Stack tecnológico](#stack-tecnológico)
- [Requisitos](#requisitos)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Variables de entorno](#variables-de-entorno)
- [Estructura principal del proyecto](#estructura-principal-del-proyecto)
- [Módulos principales](#módulos-principales)
- [Scripts disponibles](#scripts-disponibles)
- [Despliegue](#despliegue)
- [Contribución](#contribución)
- [Contacto](#contacto)

## Descripción
Frontend para el Sistema de Agricultura de Precisión "Eliminatoria". Proporciona una interfaz intuitiva y responsive para gestionar todos los aspectos de las operaciones agrícolas, desde el registro de labores hasta la visualización de reportes y métricas en tiempo real.

## Características principales
- ✅ **Autenticación segura** con JWT y gestión de sesiones
- ✅ **Dashboard interactivo** con métricas y gráficos de producción
- ✅ **Gestión completa de cultivos y lotes** con visualización geográfica
- ✅ **Registro de labores agrícolas** con formularios dinámicos y validación
- ✅ **Sistema de alertas en tiempo real** mediante WebSockets
- ✅ **Reportes visuales** con Chart.js (gráficos de línea, barras, etc.)
- ✅ **Gestión de usuarios y roles** con control de permisos
- ✅ **Administración de trabajadores** y asignación de labores
- ✅ **Interfaz responsive** optimizada para desktop, tablet y móvil
- ✅ **Modo claro/oscuro** (según configuración de Tailwind)

## Stack tecnológico
- **Framework:** Next.js 15.5.6 (App Router con Turbopack)
- **UI Library:** React 19.1.0
- **Lenguaje:** TypeScript 5
- **Estilos:** Tailwind CSS 4 (PostCSS)
- **Gráficos:** Chart.js 4.5.1 + react-chartjs-2 5.3.0
- **WebSockets:** Socket.IO Client 4.8.1
- **Gestión de cookies:** js-cookie 3.0.5
- **Linting:** ESLint 9 + eslint-config-next

## Requisitos
- Node.js v18+ (recomendado LTS v20+)
- npm v8+ o pnpm/yarn
- Backend corriendo en `http://localhost:3000` (ver [Backend_Eliminatoria](../Backend_Eliminatoria/README.md))

## Instalación y ejecución

### 1. Clonar el repositorio
```bash
git clone https://github.com/juansito17/Frontend-Eliminatoria.git
cd Frontend-Eliminatoria
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crea un archivo `.env.local` en la raíz del proyecto (ver sección [Variables de entorno](#variables-de-entorno)).

### 4. Asegurar que el backend esté corriendo
El frontend requiere que el backend esté ejecutándose en `http://localhost:3000` (o la URL configurada).

### 5. Ejecutar en modo desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:3001` (o el siguiente puerto disponible).

### 6. Compilar para producción
```bash
npm run build
```

### 7. Ejecutar en producción
```bash
npm start
```

## Variables de entorno
Crea un archivo `.env.local` en la raíz del frontend con las siguientes variables:

```bash
# URL del backend API
NEXT_PUBLIC_API_URL=http://localhost:3000

# URL del servidor Socket.IO (normalmente la misma que el backend)
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000

# Entorno de ejecución
NODE_ENV=development
```

**Notas importantes:**
- Variables con prefijo `NEXT_PUBLIC_` son expuestas al cliente (browser)
- **NO** subas el archivo `.env.local` al repositorio
- Para producción, ajusta las URLs a tus dominios reales
- Puedes usar `ENVIRONMENT_EXAMPLES.md` como referencia

## Estructura principal del proyecto
```
Frontend-Eliminatoria/
├── src/
│   └── app/                          # App Router de Next.js 15
│       ├── layout.tsx                # Layout principal
│       ├── page.tsx                  # Página de inicio
│       ├── globals.css               # Estilos globales con Tailwind
│       ├── DashboardLayout.tsx       # Layout del dashboard
│       │
│       ├── login/                    # Módulo de autenticación
│       │   └── page.tsx
│       ├── registro/                 # Registro de usuarios
│       │   └── page.tsx
│       │
│       ├── dashboard/                # Dashboard principal
│       │   ├── page.tsx
│       │   └── components/
│       │
│       ├── cultivos/                 # Gestión de cultivos
│       │   ├── page.tsx
│       │   └── [id]/
│       │
│       ├── lotes/                    # Gestión de lotes
│       │   ├── page.tsx
│       │   └── components/
│       │
│       ├── labores-agricolas/        # Gestión de labores
│       │   ├── page.tsx
│       │   └── components/
│       │
│       ├── labores-tipos/            # Tipos de labores
│       │   └── page.tsx
│       │
│       ├── trabajadores/             # Gestión de trabajadores
│       │   └── page.tsx
│       │
│       ├── usuarios/                 # Gestión de usuarios
│       │   └── page.tsx
│       │
│       ├── roles/                    # Gestión de roles
│       │   └── page.tsx
│       │
│       ├── alertas/                  # Sistema de alertas
│       │   └── page.tsx
│       │
│       ├── reportes/                 # Reportes y estadísticas
│       │   └── page.tsx
│       │
│       ├── mis-labores/              # Labores del usuario actual
│       │   └── page.tsx
│       │
│       ├── registro-labor/           # Formulario de registro de labor
│       │   └── page.tsx
│       │
│       ├── components/               # Componentes reutilizables
│       │   ├── Nav.tsx               # Barra de navegación
│       │   ├── Pagination.tsx        # Componente de paginación
│       │   ├── ConfirmModal.tsx      # Modal de confirmación
│       │   ├── LaboresTable.tsx      # Tabla de labores
│       │   ├── LaboresFilters.tsx    # Filtros de labores
│       │   ├── LaborForm.tsx         # Formulario de labor
│       │   ├── LaboresTiposTable.tsx # Tabla de tipos de labores
│       │   ├── LaborTipoForm.tsx     # Formulario de tipo de labor
│       │   └── ...
│       │
│       ├── context/                  # Context API de React
│       │   └── AuthContext.tsx       # Contexto de autenticación
│       │
│       ├── hooks/                    # Custom hooks
│       │   ├── useAuth.ts
│       │   ├── useFetch.ts
│       │   └── useSocket.ts
│       │
│       └── api/                      # API Routes (proxy/mock)
│           ├── auth/
│           ├── cultivos/
│           ├── labores-agricolas/
│           ├── trabajadores/
│           ├── usuarios/
│           ├── alertas/
│           └── dashboard/
│
├── public/                           # Assets estáticos
│   ├── images/
│   └── icons/
│
├── next.config.ts                    # Configuración de Next.js
├── tsconfig.json                     # Configuración de TypeScript
├── tailwind.config.js                # Configuración de Tailwind
├── postcss.config.mjs                # Configuración de PostCSS
├── eslint.config.mjs                 # Configuración de ESLint
└── package.json
```

## Módulos principales

### 🔐 Autenticación y Autorización
- **Login/Registro:** Formularios de autenticación con validación
- **AuthContext:** Gestión global del estado de autenticación
- **Protección de rutas:** Middleware para rutas protegidas por rol

### 📊 Dashboard
- **Métricas en tiempo real:** Producción diaria, labores completadas
- **Gráficos interactivos:** Chart.js para visualización de datos
- **Resumen de alertas:** Notificaciones importantes

### 🌾 Gestión de Cultivos y Lotes
- **CRUD de cultivos:** Crear, leer, actualizar y eliminar cultivos
- **CRUD de lotes:** Gestión de parcelas con ubicación GPS
- **Asignación:** Vincular cultivos con lotes específicos

### 👷 Gestión de Trabajadores
- **Registro de trabajadores:** Datos personales y documentación
- **Asignación de labores:** Vincular trabajadores con tareas específicas
- **Historial de trabajo:** Seguimiento de labores realizadas

### 📝 Labores Agrícolas
- **Registro de labores:** Formularios dinámicos según tipo de labor
- **Filtros avanzados:** Por fecha, cultivo, lote, trabajador, tipo
- **Mis labores:** Vista personalizada para cada trabajador
- **Tipos de labores:** Configuración de categorías (siembra, riego, etc.)

### 👥 Gestión de Usuarios y Roles
- **CRUD de usuarios:** Administración de cuentas
- **Asignación de roles:** Administrador, Supervisor, Operario
- **Permisos granulares:** Control de acceso por módulo

### 🔔 Sistema de Alertas
- **Notificaciones en tiempo real:** WebSocket con Socket.IO
- **Alertas prioritarias:** Clasificación por urgencia
- **Historial:** Registro de todas las alertas generadas

### 📈 Reportes
- **Reportes de producción:** Exportar a PDF y Excel
- **Gráficos estadísticos:** Tendencias y análisis
- **Filtros personalizados:** Por rango de fechas, cultivo, etc.

## Scripts disponibles

### Desarrollo
```bash
# Iniciar servidor de desarrollo con Turbopack
npm run dev

# El servidor se levantará en http://localhost:3001 (o siguiente puerto disponible)
# Hot reload automático al guardar cambios
```

### Producción
```bash
# Compilar la aplicación para producción
npm run build

# Iniciar el servidor de producción
npm start

# La aplicación estará optimizada y lista para deployment
```

### Linting
```bash
# Ejecutar ESLint para análisis de código
npm run lint

# Corregir problemas automáticamente
npm run lint -- --fix
```

## Despliegue

### Despliegue en Vercel (Recomendado)
Next.js está optimizado para Vercel. El despliegue es automático:

1. **Conectar repositorio a Vercel:**
   - Visita [vercel.com](https://vercel.com)
   - Importa tu repositorio de GitHub
   - Vercel detectará automáticamente que es un proyecto Next.js

2. **Configurar variables de entorno:**
   ```
   NEXT_PUBLIC_API_URL=https://api.tudominio.com
   NEXT_PUBLIC_SOCKET_URL=https://api.tudominio.com
   ```

3. **Deploy automático:**
   - Cada push a `main` desplegará automáticamente
   - Preview deployments para PRs

### Despliegue manual (Node.js server)

1. **Compilar el proyecto:**
```bash
npm run build
```

2. **Subir archivos al servidor:**
```bash
# Archivos necesarios:
- .next/
- public/
- node_modules/
- package.json
- next.config.ts
```

3. **Instalar dependencias en el servidor:**
```bash
npm install --production
```

4. **Configurar variables de entorno:**
```bash
# Crear .env.local en el servidor
NEXT_PUBLIC_API_URL=https://api.tudominio.com
NEXT_PUBLIC_SOCKET_URL=https://api.tudominio.com
```

5. **Iniciar con PM2:**
```bash
npm install -g pm2
pm2 start npm --name "frontend-eliminatoria" -- start
pm2 save
pm2 startup
```

### Despliegue con Docker

1. **Crear Dockerfile:**
```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

2. **Construir y ejecutar:**
```bash
docker build -t frontend-eliminatoria .
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://backend:3000 frontend-eliminatoria
```

### Configuración de Nginx (Proxy reverso)
```nginx
server {
    listen 80;
    server_name tudominio.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Contribución

### Flujo de trabajo
1. Fork del repositorio
2. Crear rama para tu feature: `git checkout -b feature/nueva-funcionalidad`
3. Hacer commits descriptivos: `git commit -m "feat: agregar componente X"`
4. Push a tu fork: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

### Convenciones de código
- **TypeScript:** Usar tipos explícitos siempre que sea posible
- **Componentes:** 
  - Functional components con hooks
  - Nombrar archivos en PascalCase (`MiComponente.tsx`)
- **Estilos:** Usar Tailwind CSS, evitar CSS inline
- **Estructura:**
  - Un componente por archivo
  - Separar lógica en custom hooks
- **Naming:**
  - Variables y funciones en camelCase
  - Componentes en PascalCase
  - Constantes en UPPER_SNAKE_CASE
- **Imports:** Ordenar de más general a más específico
  ```typescript
  // 1. Librerías externas
  import { useState } from 'react';
  import Image from 'next/image';
  
  // 2. Imports internos
  import { Nav } from '@/app/components/Nav';
  import { useAuth } from '@/app/hooks/useAuth';
  
  // 3. Tipos e interfaces
  import type { Usuario } from '@/types';
  ```

### Guía de estilo
```typescript
// ✅ Bueno
interface UsuarioProps {
  nombre: string;
  rol: 'admin' | 'supervisor' | 'operario';
}

export function CardUsuario({ nombre, rol }: UsuarioProps) {
  const [loading, setLoading] = useState(false);
  
  return (
    <div className="rounded-lg border p-4 shadow-sm">
      <h3 className="text-lg font-semibold">{nombre}</h3>
      <p className="text-sm text-gray-600">{rol}</p>
    </div>
  );
}

// ❌ Evitar
function card(props) {
  return <div style={{borderRadius: '8px'}}>{props.name}</div>
}
```

## Contacto

- **Repositorio Frontend:** [github.com/juansito17/Frontend-Eliminatoria](https://github.com/juansito17/Frontend-Eliminatoria)
- **Repositorio Backend:** [github.com/juansito17/Backend_Eliminatoria](https://github.com/juansito17/Backend_Eliminatoria)
- **Issues:** [github.com/juansito17/Frontend-Eliminatoria/issues](https://github.com/juansito17/Frontend-Eliminatoria/issues)

Para dudas técnicas, reportar bugs o sugerir mejoras, abre un issue en GitHub.

---

**Versión:** 0.1.0

**Última actualización:** Octubre 2025

**Licencia:** Privado
