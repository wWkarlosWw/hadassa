# Fundación Hadassa — sitio web y plataforma de donaciones

Monolito modular en **Next.js 16** (App Router) con **Supabase** (Auth + Storage + Postgres) y **Prisma 7** (esquema, migraciones y seed). Reemplaza al frontend React/Vite y a la API NestJS/MongoDB anteriores. Una sola app, un solo despliegue.

> Hadassa es un grupo de mujeres conformado para ayudar a otras mujeres, llevando el aroma de Cristo.

## Qué incluye

**Sitio público** (diseñado según la maqueta *MAQUETA PÁGINA WEB FUNDACIÓN HADASSA*):
inicio con pétalos de mirto que caen y reaccionan al mouse, proyectos como tarjetas‑puerta, presentación de la directora, misión y visión, valores como frutos del árbol de mirto, organigrama por áreas, Casa de Fruto, landing de donación con QR y cuenta bancaria, actividades y contacto. Todos los textos e imágenes se editan desde el panel (CMS).

**Sistema interno** (`/panel`), con un menú distinto para cada rol:

| Rol | Funciones |
| --- | --- |
| Donante (`USER`) | Registrar donaciones con comprobante, historial, inscribirse a actividades, canjear recompensas con puntos, ver movimientos de puntos y nivel, editar perfil |
| Supervisor | Validar donaciones (aprobar o rechazar) y asistencia a las actividades que tiene asignadas |
| Administrador | Todo lo anterior + proyectos, actividades y supervisores, aliados, recompensas y canjes, usuarios y roles, ajuste de puntos, donaciones manuales, contenido del sitio, valores, organigrama y mensajes de contacto |

**Reglas de puntos:** donación aprobada = `monto × puntos por Bs.` (configurable, 10 por defecto); asistencia validada = puntos de la actividad (50 por defecto). Cada movimiento queda en un libro (`points_transactions`) y se actualiza dentro de una transacción. Las aprobaciones y los canjes son atómicos: no se duplican puntos y el saldo nunca queda negativo.

## Arquitectura

Todo (frontend y backend) vive en esta única app Next.js: no hay API separada. La lógica de negocio está en `src/modules/*/service.ts` y se expone mediante Server Components y Server Actions.

```
docs/                    maqueta (PDF), documento del proyecto de grado, guía E2E
prisma/                  schema.prisma · migraciones · seed.ts
supabase/config.toml     Supabase local (Auth, Storage: buckets media y receipts)
src/
├─ app/
│  ├─ (site)/            sitio público
│  ├─ (auth)/            /ingresar · /registro
│  └─ panel/             sistema interno (protegido por rol)
├─ modules/              un módulo por dominio
│  ├─ auth/              sesión (Supabase Auth), guards por rol, login/registro
│  ├─ cms/               contenido editable (definitions.ts = campos y textos por defecto)
│  ├─ pages/ menu/ media/   páginas personalizadas, menú editable, biblioteca de imágenes
│  ├─ projects/ donations/ events/ rewards/ points/ users/
│  │   ├─ schemas.ts     validación (zod)
│  │   ├─ service.ts     lógica de negocio + Prisma (solo servidor)
│  │   ├─ actions.ts     Server Actions (autorización → validación → servicio)
│  │   └─ components/    UI del módulo
│  ├─ site/              componentes del sitio público
│  └─ panel/             layout y navegación del panel
├─ shared/               ui/ (botones, formularios, tablas…) · lib/ (prisma, supabase, storage, utils)
└─ proxy.ts              refresca la sesión y protege /panel
```

- **Seguridad:** el navegador nunca accede a la base de datos. RLS está activado en todas las tablas sin políticas, así que la API REST pública de Supabase no expone nada. Toda lectura y escritura pasa por el servidor, que verifica la sesión (`getClaims`) y el rol en cada página y en cada acción.
- **Identidad:** `profiles.id` es igual a `auth.users.id`. El perfil se crea al registrarse y, si falta, al iniciar sesión.
- **Archivos:** las imágenes del CMS van al bucket público `media`. Los comprobantes van al bucket privado `receipts` y se ven con URLs firmadas que duran 10 minutos.

## Desarrollo local

Requisitos: Node 20.9+ y Docker (para Supabase local).

```bash
npm install
cp .env.example .env            # luego completa las claves con `npm run db:status`
npm run db:start                # levanta Supabase local (Postgres, Auth, Storage, Studio)
npm run db:deploy               # aplica las migraciones
npm run db:seed                 # usuarios demo + datos iniciales
npm run dev                     # http://localhost:3000
```

Usuarios demo (contraseña `SEED_DEFAULT_PASSWORD`, por defecto `Hadassa2026!`):

| Correo | Rol |
| --- | --- |
| admin@hadassa.org | Administrador |
| supervisor@hadassa.org | Supervisor |
| usuario@hadassa.org | Donante |

Herramientas: Supabase Studio en http://127.0.0.1:54323, correos de prueba (Mailpit) en http://127.0.0.1:54324 y `npm run db:studio` (Prisma Studio).

### Scripts

| Script | Descripción |
| --- | --- |
| `dev` / `build` / `start` | Next.js |
| `lint` · `typecheck` | ESLint · TypeScript |
| `test` | Pruebas unitarias (Vitest) |
| `test:integration` | Pruebas de reglas de negocio contra la base local |
| `db:migrate` | Crea una migración nueva tras cambiar `schema.prisma` |
| `db:deploy` | Aplica las migraciones pendientes |
| `db:seed` · `db:reset` | Seed · reinicia la base y la vuelve a sembrar |

## Despliegue (Vercel + Supabase cloud)

1. Crea un proyecto en [Supabase](https://supabase.com). En *Storage* crea los buckets `media` (público) y `receipts` (privado). En *Authentication → URL Configuration* pon la URL del sitio.
2. Aplica el esquema desde tu máquina:
   ```bash
   DIRECT_URL="postgresql://postgres.<ref>:<pass>@aws-0-<region>.pooler.supabase.com:5432/postgres" npx prisma migrate deploy
   # opcional: datos iniciales
   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... DIRECT_URL=... npm run db:seed
   ```
3. Importa el repositorio en Vercel y define estas variables de entorno: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL` (pooler, puerto 6543, `?pgbouncer=true`), `DIRECT_URL` (puerto 5432) y `NEXT_PUBLIC_SITE_URL`.
4. Despliega. El build no necesita conectarse a la base de datos, porque las páginas que leen datos se generan en cada request.

Después del primer despliegue, entra como admin y cambia las contraseñas demo, o elimina esos usuarios. Luego carga el QR y los datos bancarios reales en **Panel → Contenido → Donaciones**.
