import { defineField, defineType } from "sanity";

const sportOptions = [
  { title: "Baloncesto", value: "nba" },
  { title: "Béisbol", value: "mlb" },
  { title: "Fútbol", value: "soccer" },
  { title: "TCG", value: "tcg" },
  { title: "F1", value: "f1" },
  { title: "Otros", value: "other" },
];

const productTypeOptions = [
  { title: "Single", value: "single" },
  { title: "Sealed Box", value: "sealed" },
  { title: "Memorabilia", value: "memorabilia" },
  { title: "Break", value: "break" },
];

const rarityOptions = [
  { title: "Common", value: "common" },
  { title: "Short Print", value: "short-print" },
  { title: "Serializada /99", value: "serial-99" },
  { title: "Serializada /25", value: "serial-25" },
  { title: "Serializada /10", value: "serial-10" },
  { title: "One of One", value: "one-of-one" },
];

const statusOptions = [
  { title: "Disponible", value: "available" },
  { title: "Reservado", value: "reserved" },
  { title: "Vendido", value: "sold" },
  { title: "Próximo lanzamiento", value: "upcoming" },
];

export default defineType({
  name: "product",
  title: "Producto",
  type: "document",
  groups: [
    { name: "market", title: "Mercadeo" },
    { name: "details", title: "Detalles" },
    { name: "content", title: "Contenido" },
    { name: "media", title: "Medios" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Título",
      type: "string",
      group: "market",
      validation: (Rule) => Rule.required().min(4).max(120),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "market",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "status",
      title: "Estado",
      type: "string",
      initialValue: "available",
      group: "market",
      options: {
        list: statusOptions,
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "releaseDate",
      title: "Fecha de disponibilidad",
      type: "date",
      group: "market",
      description: "Visible cuando el estado es 'Próximo lanzamiento'. Usa una fecha estimada futura.",
      options: { calendarTodayLabel: "Hoy" },
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const status = (context as any)?.document?.status;
          if (status === "upcoming") {
            if (!value) {
              return "Ingresa la fecha estimada de disponibilidad.";
            }
            if (value < new Date().toISOString().slice(0, 10)) {
              return "La fecha debe ser futura.";
            }
          }
          return true;
        }),
    }),
    defineField({
      name: "featured",
      title: "Destacado en home",
      type: "boolean",
      group: "market",
      description: "Si está activo, se muestra primero en las secciones de destacados.",
      initialValue: false,
    }),
    defineField({
      name: "price",
      title: "Precio",
      type: "number",
      group: "market",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "currency",
      title: "Moneda",
      type: "string",
      group: "market",
      initialValue: "DOP",
      options: {
        list: [
          { title: "DOP", value: "DOP" },
          { title: "USD", value: "USD" },
        ],
        layout: "dropdown",
      },
    }),
    defineField({
      name: "whatsappMessage",
      title: "Mensaje WhatsApp personalizado",
      type: "string",
      group: "market",
      description: "Mensaje prellenado para el botón de WhatsApp. Si se deja vacío, se genera automáticamente.",
    }),
    defineField({
      name: "sport",
      title: "Deporte",
      type: "string",
      group: "details",
      options: {
        list: sportOptions,
        layout: "dropdown",
      },
    }),
    defineField({
      name: "productType",
      title: "Tipo de producto",
      type: "string",
      group: "details",
      options: {
        list: productTypeOptions,
        layout: "dropdown",
      },
    }),
    defineField({
      name: "rarity",
      title: "Rareza",
      type: "string",
      group: "details",
      options: {
        list: rarityOptions,
        layout: "dropdown",
      },
    }),
    defineField({
      name: "year",
      title: "Año",
      type: "number",
      group: "details",
      validation: (Rule) => Rule.min(1900).max(new Date().getFullYear() + 1),
    }),
    defineField({
      name: "certification",
      title: "Certificación / Grading",
      type: "string",
      group: "details",
      description: "Ejemplo: PSA 10, BGS 9.5, Raw, Sealed.",
    }),
    defineField({
      name: "inventory",
      title: "Inventario disponible",
      type: "number",
      group: "details",
      initialValue: 1,
    }),
    defineField({
      name: "tags",
      title: "Etiquetas",
      type: "array",
      group: "details",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "shortDescription",
      title: "Descripción corta",
      type: "text",
      rows: 3,
      group: "content",
      validation: (Rule) => Rule.max(180),
    }),
    defineField({
      name: "highlights",
      title: "Highlights",
      type: "array",
      group: "content",
      description: "Puntos clave para mostrar en bullets.",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "description",
      title: "Descripción detallada",
      type: "array",
      group: "content",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "gallery",
      title: "Galería de imágenes",
      type: "array",
      group: "media",
      of: [
        defineField({
          name: "image",
          type: "image",
          title: "Imagen",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              type: "string",
              title: "Texto alternativo",
            }),
            defineField({
              name: "displayName",
              type: "string",
              title: "Etiqueta",
              description: "Ej. Front, Back, Detalle, etc.",
            }),
          ],
        }),
      ],
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: "heroVideo",
      title: "Video Hero (opcional)",
      type: "file",
      group: "media",
      options: {
        accept: "video/mp4,video/quicktime",
      },
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "sport",
      media: "gallery.0",
      status: "status",
    },
    prepare(selection) {
      const { title, subtitle, media, status } = selection;
      return {
        title,
        subtitle: [subtitle && subtitle.toUpperCase(), status && `• ${status}`].filter(Boolean).join(" "),
        media,
      };
    },
  },
  orderings: [
    {
      title: "Últimos publicados",
      name: "publishedAtDesc",
      by: [{ field: "_createdAt", direction: "desc" }],
    },
    {
      title: "Precio alto → bajo",
      name: "priceDesc",
      by: [{ field: "price", direction: "desc" }],
    },
    {
      title: "Precio bajo → alto",
      name: "priceAsc",
      by: [{ field: "price", direction: "asc" }],
    },
  ],
});
