# Front-end

Aplicacion web del proyecto de Skin4All, construida con Next.js.

## Requisitos previos

- Node.js 22 o superior
- pnpm instalado globalmente
- Docker y Docker Compose (para ejecucion con contenedores)

## Ejecucion local (sin Docker)

1. Instalar dependencias:

```bash
pnpm install
```

2. Iniciar en modo desarrollo:

```bash
pnpm run dev
```

3. Abrir en navegador:

```text
http://localhost:3000
```

## Ejecucion con Docker

El proyecto incluye [Dockerfile](Dockerfile) y [docker-compose.yml](docker-compose.yml).

### Opcion 1: Docker Compose

Desde la raiz de Front-end:

```bash
docker compose up --build
```

La aplicacion quedara disponible en:

```text
http://localhost:3000
```

Para detener los contenedores:

```bash
docker compose down
```

### Opcion 2: Docker CLI

1. Construir imagen:

```bash
docker build -t skin4all-frontend .
```

2. Ejecutar contenedor:

```bash
docker run --rm -p 3000:3000 skin4all-frontend
```

## Scripts principales

- `pnpm run dev`: inicia entorno de desarrollo
- `pnpm run build`: compila la aplicacion para produccion
- `pnpm run start`: ejecuta la aplicacion compilada
- `pnpm run test`: ejecuta todas las pruebas (unitarias y E2E)
- `pnpm run test:unit`: ejecuta pruebas unitarias (Jest)
- `pnpm run test:e2e`: ejecuta pruebas E2E (Playwright)

## Justificaciones tecnicas

1. Next.js 
Se utiliza Next.js para soportar renderizado hibrido (SSR/SSG), optimizacion de rendimiento, y facil manejo de rutas y recursos estaticos.

2. Internacionalizacion con next-intl
Se adopta `next-intl` para manejar multiples idiomas y namespaces de traduccion de forma consistente por ruta y por componente.

3. Arquitectura basada en componentes
Separamos la interfaz en componentes reutilizables y modulares, organizados por funcionalidad y por seccion de la aplicacion.

4. Testing automatizado
Se integran pruebas unitarias (Jest + Testing Library) y pruebas E2E (Playwright) para poder mantener la calidad del codigo.

## Despliegue

El proyecto puede desplegarse de dos formas:

1. Despliegue en Docker, usando la imagen construida desde este repositorio.
2. Despliegue en Vercel, como alternativa para publicacion y hosting de aplicaciones Next.js.

