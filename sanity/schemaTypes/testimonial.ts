import { defineField, defineType } from "sanity";

export default defineType({
  name: "testimonial",
  title: "Testimonio",
  type: "document",
  fields: [
    defineField({
      name: "quote",
      title: "Testimonio",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.required().min(20).max(400),
    }),
    defineField({
      name: "author",
      title: "Autor",
      type: "string",
      validation: (Rule) => Rule.required().min(4).max(80),
    }),
    defineField({
      name: "location",
      title: "Ubicación / Nota",
      type: "string",
      description: "Ej. Santo Domingo, República Dominicana",
    }),
    defineField({
      name: "order",
      title: "Orden manual",
      type: "number",
      description: "Opcional. Úsalo para definir el orden del carrusel (números menores salen primero).",
    }),
  ],
  preview: {
    select: {
      title: "author",
      subtitle: "location",
    },
  },
  orderings: [
    {
      title: "Orden manual (asc)",
      name: "orderAsc",
      by: [
        { field: "order", direction: "asc" },
        { field: "_createdAt", direction: "desc" },
      ],
    },
    {
      title: "Más recientes",
      name: "createdDesc",
      by: [{ field: "_createdAt", direction: "desc" }],
    },
  ],
});

