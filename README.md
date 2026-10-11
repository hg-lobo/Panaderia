<div align="center">

# 🥖 El Horno de Don Christopher

### Sistema Experto de Punto de Venta

Una consola moderna para panaderías y pastelerías que quieren dejar de perder dinero por errores humanos, olvidos de promociones y falta de visibilidad del negocio.

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)

</div>

---

## 📋 Tabla de contenidos

- [¿Qué es esto?](#-qué-es-esto)
- [Características](#-características)
- [Capturas](#-capturas)
- [Stack tecnológico](#-stack-tecnológico)
- [Arquitectura](#-arquitectura)
- [Motor de inferencia](#-motor-de-inferencia)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Instalación](#-instalación)
- [Base de datos](#-base-de-datos)
- [Reglas de negocio](#-reglas-de-negocio)
- [Scripts disponibles](#-scripts-disponibles)
- [Roadmap](#-roadmap)
- [Licencia](#-licencia)

---

## 🎯 ¿Qué es esto?

**El Horno de Don Christopher** es un sistema experto de punto de venta (POS) diseñado específicamente para **panaderías y pastelerías**. A diferencia de otras soluciones genéricas, este sistema:

- **Detecta combos automáticamente** cuando el cliente lleva los productos correctos juntos
- **Avisa de productos por vencer** antes de que se echen a perder
- **Alerta de stock bajo** para que nunca pierdas una venta por falta de producto
- **Bloquea ventas imposibles** (productos agotados, precios mal configurados)
- **Analiza patrones** de venta por día, hora, categoría y producto

Todo desde una sola consola operada por el cajero/administrador.

---

## ✨ Características

### 🛒 Punto de venta
- Búsqueda instantánea por nombre o SKU
- Carrito con control de cantidades
- Detección automática de combos con descuento aplicado al instante
- Alertas visuales cuando hay riesgos (producto por vencer, stock bajo)
- Checkout transaccional atómico (venta + detalles + stock + traza)

### 📊 Dashboard ejecutivo
- KPIs de HOY vs. AYER (ventas, facturas, ganancia, ticket promedio)
- KPIs del MES vs. MES ANTERIOR con variación real
- Contador de productos con stock bajo
- Gráfica de ingresos vs. utilidad (últimos 30 días)
- Top productos más vendidos
- Distribución de ventas por categoría (dona)
- Patrón semanal (ingresos por día de la semana)
- Distribución horaria (ingresos por hora del día)
- Tabla de productos próximos a vencer (con ventana configurable)
- Panel de devoluciones con monto reembolsado

### 📦 Gestión de productos
- CRUD completo con formulario validado
- Filtros por categoría y búsqueda por nombre/SKU
- Estado activo/inactivo (soft delete)
- Control de stock y stock mínimo
- Fechas de vencimiento con alertas automáticas

### 🎁 Combos y promociones
- Cards visuales con vista previa del descuento
- Soporte para precio fijo o porcentaje
- Detección automática en el carrito
- Vigencia por fecha de inicio/fin

### ↩️ Devoluciones
- Búsqueda en el histórico de ventas
- Expansión para ver detalles de cada factura
- Reintegro automático de stock
- Registro del motivo y monto reembolsado
- Validación de que no se devuelva más de lo vendido

### 📈 Reportes
- Rango configurable: 7d / 30d / 90d
- Top productos con unidades vendidas e ingresos
- Ventas por categoría
- Métricas de devoluciones (tasa sobre ventas, motivo más común)

### 🧠 Reglas del sistema
- Base de conocimiento editable sin código
- Asistente guiado para crear reglas (sin JSON)
- 4 tipos de automatización:
  - Descuento por combo
  - Alerta de vencimiento
  - Alerta de stock bajo
  - Bloqueo de venta
- Vista previa en lenguaje natural
- Activar/desactivar reglas al instante

### 👤 Autenticación
- Login con email/contraseña
- Login con Google OAuth
- Recuperación de contraseña por email
- Cambio de contraseña desde el perfil
- Perfil editable con nombre, rol y fecha de alta

---

## 🖼️ Capturas

> Las capturas se agregarán cuando el proyecto esté en producción.

<!-- 
![Login](./docs/login.png)
![Dashboard](./docs/dashboard.png)
![POS](./docs/pos.png)
![Reglas](./docs/reglas.png)
-->

---

## 🛠️ Stack tecnológico

| Capa | Tecnología | Por qué |
|------|-----------|---------|
| **Frontend** | React 18 + Vite | Renderizado concurrente, HMR ultrarrápido, ecosistema maduro |
| **Lenguaje** | TypeScript (strict) | Seguridad de tipos en tiempo de compilación, cero `any` |
| **Estilos** | Tailwind CSS v4 | Utility-first, sin CSS muerto, paleta consistente |
| **Base de datos** | Supabase (PostgreSQL 15) | Realtime, RLS nativo, Auth integrado, RPC con PL/pgSQL |
| **Auth** | Supabase Auth | Email + Google OAuth + recuperación de contraseña |
| **Estado global** | Zustand | Liviano, sin boilerplate, ideal para carrito |
| **Data fetching** | TanStack Query | Cache, invalidación, refetch automático |
| **Formularios** | React Hook Form + Zod | Validación en tiempo real con schemas reutilizables |
| **Gráficas** | Recharts | Composable, tipado, ligero |
| **Iconos** | Lucide React | SVGs limpios, tree-shakeable |
| **Fuentes** | Syne (display) + Inter (cuerpo) | Editorial + legible |

---

## 🏗️ Arquitectura

El proyecto sigue una arquitectura **feature-based** con separación clara de responsabilidades:

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTACIÓN                          │
│  features/ → componentes, páginas, hooks de UI          │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│                      DOMINIO                             │
│  core/ → entidades, motor de inferencia, schemas Zod    │
│  Es puro TypeScript. NO conoce React ni Supabase.       │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│                  INFRAESTRUCTURA                         │
│  infrastructure/ → cliente Supabase, queries, tipos     │
│  Es la única capa que habla con la BD.                  │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│                    BASE DE DATOS                         │
│  PostgreSQL (Supabase) con RLS, RPCs y triggers         │
└─────────────────────────────────────────────────────────┘
```

**Principios aplicados:**
- **SOLID** — responsabilidad única, inversión de dependencias
- **Clean Architecture** — el dominio no conoce la infraestructura
- **Immutabilidad** — el motor de inferencia nunca muta su entrada
- **Type safety** — sin `any`, con Zod validando fronteras

---

## 🧠 Motor de inferencia

El corazón del sistema experto es un **motor de reglas con encadenamiento hacia adelante** (forward chaining).

### ¿Cómo funciona?

```
1. Usuario agrega productos al carrito
2. El sistema genera HECHOS:
   - "el carrito contiene X"
   - "el producto Y tiene stock Z"
   - "el combo W requiere A + B"
3. El motor evalúa REGLAS ordenadas por prioridad
4. Cuando una regla dispara, ejecuta una ACCIÓN:
   - Aplicar descuento
   - Mostrar alerta
   - Bloquear venta
5. Cada disparo queda registrado en inferencias_log
```

### Base de conocimiento

Vive en la tabla `reglas_negocio` como pares `(condición, acción)` en JSONB:

```json
{
  "codigo": "VENCIMIENTO_ALERTA_ROJA",
  "categoria": "VENCIMIENTO",
  "condicion": {
    "tipo": "producto",
    "campo": "fecha_vencimiento",
    "operador": "<=",
    "valor": "hoy+7d"
  },
  "accion": {
    "tipo": "alerta",
    "nivel": "ROJO",
    "mensaje": "Producto vence en menos de 7 días"
  },
  "prioridad": 90,
  "activa": true
}
```

### Reglas incluidas por defecto

| Código | Qué hace |
|--------|----------|
| `COMBO_APLICA` | Aplica el descuento cuando el carrito tiene todos los items de un combo activo |
| `VENCIMIENTO_ALERTA_ROJA` | Alerta crítica si un producto vence en ≤ 7 días |
| `VENCIMIENTO_ALERTA_AMARILLA` | Aviso si un producto vence en ≤ 30 días |
| `STOCK_BAJO` | Aviso si el stock ≤ stock mínimo configurado |
| `BLOQUEAR_VENTA_SIN_STOCK` | Impide vender productos agotados |

### Explicabilidad

Cada disparo guarda en `inferencias_log`:
- Regla que disparó
- Hechos de entrada
- Hechos de salida
- Justificación en texto plano

Así el cajero puede ver **por qué** se aplicó un descuento o apareció una alerta.

---

## 📁 Estructura del proyecto

```
pos-experto/
├─ public/
│  └─ logo-don-christopher.png    # Logo de la panadería (favicon + sidebar + login)
│
├─ src/
│  ├─ app/
│  │  └─ providers.tsx            # QueryClient, ErrorBoundary
│  │
│  ├─ core/                       # ── DOMINIO PURO ──
│  │  ├─ domain/
│  │  │  └─ schemas/              # Zod schemas (auth, producto, combo)
│  │  └─ inference/               # Motor de inferencia
│  │     ├─ types.ts              # Hecho, Regla, Condicion, Accion
│  │     ├─ forward-chaining.engine.ts
│  │     ├─ inference.service.ts  # Orquestador
│  │     ├─ regla-legible.ts      # Traductor regla → lenguaje natural
│  │     ├─ evaluators/           # Evaluadores de condiciones
│  │     └─ executors/            # Ejecutores de acciones
│  │
│  ├─ infrastructure/             # ── INFRAESTRUCTURA ──
│  │  ├─ supabase/
│  │  │  ├─ client.ts             # Cliente Supabase
│  │  │  └─ queries/              # Hooks de TanStack Query
│  │  │     ├─ dashboard.queries.ts
│  │  │     ├─ kpis.queries.ts
│  │  │     ├─ reportes.queries.ts
│  │  │     ├─ graficas.queries.ts
│  │  │     ├─ productos.mutations.ts
│  │  │     ├─ ventas.mutations.ts
│  │  │     ├─ devoluciones.queries.ts
│  │  │     └─ reglas.mutations.ts
│  │  └─ types/
│  │     └─ database.types.ts     # Tipos de las tablas
│  │
│  ├─ features/                   # ── PRESENTACIÓN ──
│  │  ├─ auth/
│  │  │  ├─ AuthPage.tsx
│  │  │  ├─ ResetPasswordPage.tsx
│  │  │  ├─ components/AuthForm.tsx
│  │  │  └─ hooks/useAuth.ts
│  │  │
│  │  ├─ panel/
│  │  │  ├─ PanelLayout.tsx
│  │  │  ├─ DashboardPage.tsx
│  │  │  ├─ ProductosPage.tsx
│  │  │  ├─ CombosPage.tsx
│  │  │  ├─ DevolucionesPage.tsx
│  │  │  ├─ ReportesPage.tsx
│  │  │  ├─ ReglasPage.tsx
│  │  │  ├─ PerfilPage.tsx
│  │  │  ├─ NotFoundPage.tsx
│  │  │  └─ components/
│  │  │     ├─ Sidebar.tsx
│  │  │     ├─ UserMenu.tsx
│  │  │     ├─ KpiCard.tsx
│  │  │     ├─ ChartCard.tsx
│  │  │     ├─ ProductoForm.tsx
│  │  │     ├─ ReglaForm.tsx
│  │  │     └─ asistente/
│  │  │        ├─ AsistenteRegla.tsx
│  │  │        ├─ PasoAccion.tsx
│  │  │        ├─ PasoCombo.tsx
│  │  │        ├─ PasoAlerta.tsx
│  │  │        └─ PasoRevision.tsx
│  │  │
│  │  └─ pos/
│  │     ├─ PosPage.tsx
│  │     ├─ hooks/usePos.ts
│  │     └─ store/carrito.store.ts
│  │
│  ├─ shared/
│  │  └─ ui/
│  │     ├─ Modal.tsx
│  │     └─ ErrorBoundary.tsx
│  │
│  ├─ index.css                  # Tailwind + tema
│  ├─ main.tsx
│  └─ App.tsx                    # Router manual + layouts
│
├─ supabase/
│  └─ migrations/                # SQL versionado
│
├─ .env.local                    # Variables de entorno (NO SUBIR)
├─ .gitignore
├─ index.html
├─ package.json
├─ tsconfig.json
├─ vite.config.ts
└─ README.md
```

---

## 🚀 Instalación

### Requisitos previos

| Herramienta | Versión mínima | Cómo verificar |
|-------------|----------------|----------------|
| Node.js | 18+ | `node -v` |
| npm | 9+ | `npm -v` |
| Cuenta de Supabase | — | [supabase.com](https://supabase.com) |

### Paso a paso

**1. Clonar el repositorio**

```bash
git clone https://github.com/tu-usuario/pos-don-christopher.git
cd pos-don-christopher
```

**2. Instalar dependencias**

```bash
npm install
```

**3. Configurar variables de entorno**

Crea un archivo `.env.local` en la raíz:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=tu_clave_publica
```

> Las claves las encuentras en **Supabase → Project Settings → API**.

**4. Ejecutar las migraciones SQL**

Ve a **Supabase → SQL Editor** y ejecuta en orden:

1. El script completo de creación de tablas, tipos, funciones y triggers
2. El script de RLS (Row Level Security)
3. El script de seed con datos de prueba y reglas por defecto

> Los scripts están documentados en la carpeta `supabase/migrations/`.

**5. Configurar autenticación (opcional para Google OAuth)**

En **Supabase → Authentication → URL Configuration**:

```
Site URL: http://localhost:5173
Redirect URLs:
  - http://localhost:5173/**
  - http://localhost:5173/reset-password
```

Para Google OAuth, configurar el proveedor en **Authentication → Providers → Google**.

**6. Arrancar el servidor**

```bash
npm run dev
```

Abre **http://localhost:5173** en tu navegador.

**7. Crear el primer usuario**

En **Supabase → Authentication → Users** → **Add user**:
- Email: `admin@donchristopher.com`
- Password: (una segura)
- ✅ Auto Confirm User: **marcado**

El trigger `on_auth_user_created` creará automáticamente su perfil en la tabla `perfiles`.

---

## 🗄️ Base de datos

### Tablas principales

| Tabla | Propósito |
|-------|-----------|
| `perfiles` | Extiende `auth.users` con datos de negocio |
| `categorias` | Agrupación de productos |
| `productos` | Catálogo con precio, stock, vencimiento |
| `combos` | Promociones del tipo "A + B por precio especial" |
| `combo_items` | Productos que forman cada combo |
| `ventas` | Cabecera de cada factura |
| `detalles_ventas` | Líneas de cada factura (snapshot de precios) |
| `devoluciones` | Registro de devoluciones con reintegro de stock |
| `reglas_negocio` | Base de conocimiento del motor de inferencia |
| `inferencias_log` | Traza de cada disparo del motor (auditoría) |

### Normalización

Todas las tablas cumplen **BCNF** (Boyce-Codd Normal Form), con excepciones justificadas:

- `detalles_ventas` guarda `precio_unitario` y `precio_costo_unitario` como **snapshots históricos** — correcto en 3FN porque son valores pactados en el momento de la venta, no derivables.

### Seguridad (RLS)

Todas las tablas tienen **Row Level Security** activado. Las políticas garantizan:

- Solo usuarios autenticados acceden a los datos
- Un cajero solo puede insertar ventas con su propio `cajero_id`
- Los detalles de venta son **inmutables** (solo INSERT, nunca UPDATE)
- Las reglas son editables pero auditables

### Funciones RPC

| Función | Qué hace |
|---------|----------|
| `fn_dashboard_kpis(desde, hasta)` | KPIs agregados del periodo |
| `fn_productos_por_vencer(dias)` | Productos próximos a caducar |
| `fn_reglas_activas()` | Devuelve las reglas del motor |
| `fn_registrar_inferencia(...)` | Guarda la traza de un disparo |
| `fn_registrar_venta(payload)` | Transacción atómica: venta + detalles + stock + traza |
| `fn_registrar_devolucion(payload)` | Transacción atómica: devolución + reintegro de stock |
| `fn_ventas_con_detalle(limite)` | Ventas con sus líneas expandidas |

---

## ⚙️ Reglas de negocio

Las reglas son la **base de conocimiento** del sistema experto. Se administran desde la interfaz sin escribir código.

### Crear una regla con el asistente

1. Ve a **Reglas → Nueva regla**
2. Elige el tipo de acción (4 opciones visuales)
3. Configura los detalles (productos del combo, umbrales, mensajes)
4. Revisa la vista previa en lenguaje natural
5. Confirma

El asistente genera el JSON por detrás y crea:
- La regla en `reglas_negocio`
- Si es un combo, además el registro en `combos` + `combo_items`

### Editar una regla existente

Clic en el ícono de lápiz → formulario técnico con JSON (para casos avanzados).

---

## 🛠️ Scripts disponibles

| Comando | Qué hace |
|---------|----------|
| `npm run dev` | Servidor de desarrollo con HMR en `http://localhost:5173` |
| `npm run build` | Compila TypeScript y genera build optimizado en `dist/` |
| `npm run preview` | Sirve el build de producción localmente |
| `npm run lint` | Ejecuta ESLint sobre todo el código |

---

## 🗺️ Roadmap

### Versión actual (v0.1)
- [x] Autenticación con email y Google
- [x] Recuperación de contraseña por email
- [x] Dashboard con KPIs y gráficas en tiempo real
- [x] CRUD de productos y combos
- [x] Punto de venta con detección automática de combos
- [x] Checkout transaccional
- [x] Devoluciones con reintegro de stock
- [x] Motor de inferencia con forward chaining
- [x] Asistente guiado para crear reglas
- [x] Reportes avanzados

### Próximas versiones
- [ ] Impresión de tickets (PDF / térmica)
- [ ] Modo offline con sincronización
- [ ] Notificaciones push en tiempo real
- [ ] Exportación de reportes a Excel/CSV
- [ ] Búsqueda global (productos, ventas, clientes)
- [ ] Multi-sucursal
- [ ] Control de caja y arqueos
- [ ] Programa de fidelización de clientes
- [ ] Tests automatizados (Vitest + Playwright)

---

## 🤝 Contribuir

Este es un proyecto privado. Si formas parte del equipo de **El Horno de Don Christopher**, contacta al administrador para acceso.

### Convención de commits

```
feat:     nueva funcionalidad
fix:      corrección de bug
style:    cambios de diseño, sin lógica
refactor: reorganización de código
docs:     actualización de documentación
test:     agregar o modificar tests
chore:    tareas de mantenimiento
```

---

## 📝 Licencia

**Todos los derechos reservados © 2026 El Horno de Don Christopher**

Este software es propiedad privada. No está permitido su uso, copia, modificación o distribución sin autorización expresa del propietario.

---

<div align="center">

Hecho con 🥖 y mucho ☕ para **El Horno de Don Christopher**

*"El pan se vende solo cuando el sistema trabaja bien."*

</div>