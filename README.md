# foxsportscards1of1

Sitio de coleccionables premium (Next.js + Tailwind) con catálogo gestionado vía Sanity y checkout manual por WhatsApp.

## Requisitos previos

1. Instala dependencias una única vez:
   ```bash
   npm install
   ```
2. Crea un proyecto en [Sanity.io](https://www.sanity.io/) y un dataset público o con token de lectura read-only.
3. Copia `.env.example` a `.env.local` y completa:
   ```env
   SANITY_PROJECT_ID=xxxxx       # ID del proyecto (Settings → API → Project ID)
   SANITY_DATASET=production     # Dataset creado en Sanity
   SANITY_API_VERSION=2024-10-01 # Puedes fijar la fecha más reciente que quieras congelar
   SANITY_READ_TOKEN=            # Opcional: solo si el dataset no es público
   ```

## Desarrollo local

```bash
# Arranca el frontend en http://localhost:3000
npm run dev

# En otra terminal abre el estudio en http://localhost:3000/studio
npm run sanity:dev
```

Desde el Studio puedes crear productos (`Documento → Producto`). Los campos principales:

- **Estado**: controla si aparece como disponible, reservado o vendido.
- **Destacado**: prioriza la tarjeta en la home.
- **Galería**: sube mínimo una imagen en alta; se procesan vía CDN de Sanity.
- **Mensaje WhatsApp**: texto personalizado para el CTA (opcional).

Cada cambio publicado en Sanity se refleja en el sitio gracias a ISR (`revalidate = 60`). Para forzar recarga manual, reinicia el servidor local.

## WhatsApp

Edita el número por defecto en `components/WhatsAppBuy.tsx` (`formato internacional sin +`).  
El mensaje puede personalizarse por producto desde Sanity; las utilidades para el carrito están en `lib/whatsapp.ts`.

## Cloudflare Pages

1. Usa `npm run build` para asegurarte de que compila.
2. Crea un proyecto Pages (preset **Next.js**).
3. Configura las mismas variables `SANITY_*` en *Settings → Environment variables*.
4. (Opcional) Añade un Worker para revalidar ISR cuando recibas webhooks de Sanity.

Con esto puedes iterar en localhost y publicar en Cloudflare sin depender de servidores propios.
