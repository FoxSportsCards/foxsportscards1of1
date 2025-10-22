import { defineField, defineType } from "sanity";

export default defineType({
  name: "homeDrop",
  title: "Drop destacado",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Título",
      type: "string",
      validation: (Rule) => Rule.required().min(8).max(120),
    }),
    defineField({
      name: "scheduledAt",
      title: "Fecha y hora",
      type: "datetime",
      description: "Usamos esta fecha para ordenar y generar la etiqueta.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "statusLabel",
      title: "Estado del drop",
      type: "string",
      description: "Ej. Preventa abierta, Reserva tu slot, Lista de espera.",
      validation: (Rule) => Rule.required().max(60),
    }),
    defineField({
      name: "description",
      title: "Descripción breve",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.required().max(240),
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "statusLabel",
      date: "scheduledAt",
    },
    prepare(selection) {
      const { title, subtitle, date } = selection;
      const badge = date ? new Date(date).toLocaleDateString("es-DO", { day: "2-digit", month: "short" }).toUpperCase() : "";
      return {
        title,
        subtitle: [badge, subtitle].filter(Boolean).join(" • "),
      };
    },
  },
  orderings: [
    {
      title: "Fecha más próxima",
      name: "scheduledAsc",
      by: [{ field: "scheduledAt", direction: "asc" }],
    },
    {
      title: "Fecha más lejana",
      name: "scheduledDesc",
      by: [{ field: "scheduledAt", direction: "desc" }],
    },
  ],
});

