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
    defineField({
      name: "ctaLabel",
      title: "Texto del CTA principal",
      type: "string",
      description: "Ej. Reservar cupo, Ver detalles, Ir al live.",
      validation: (Rule) => Rule.max(40),
    }),
    defineField({
      name: "ctaHref",
      title: "Enlace del CTA principal",
      type: "string",
      description: "URL completa o enlace interno (ej. https://..., /producto/slug, #agenda).",
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const hasLabel = Boolean((context as any)?.parent?.ctaLabel);
          if (hasLabel && !value) {
            return "Si defines un CTA, agrega también el enlace.";
          }
          return true;
        }),
    }),
    defineField({
      name: "secondaryCtaLabel",
      title: "Texto del CTA secundario",
      type: "string",
      description: "Opcional. Ej. Ver checklist, Lista de espera.",
      validation: (Rule) => Rule.max(40),
    }),
    defineField({
      name: "secondaryCtaHref",
      title: "Enlace del CTA secundario",
      type: "string",
      hidden: ({ parent }) => !parent?.secondaryCtaLabel,
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const hasLabel = Boolean((context as any)?.parent?.secondaryCtaLabel);
          if (hasLabel && !value) {
            return "Agrega el enlace para el CTA secundario.";
          }
          return true;
        }),
    }),
    defineField({
      name: "showInBanner",
      title: "Destacar en banner del hero",
      type: "boolean",
      description:
        "Si está activo, aparece una alerta brillante en la parte superior del home. Activa como máximo en un drop a la vez.",
      initialValue: false,
    }),
    defineField({
      name: "bannerMessage",
      title: "Mensaje corto para banner",
      type: "string",
      description: "Máximo 90 caracteres. Si se deja vacío se genera automáticamente con la fecha y el título.",
      validation: (Rule) => Rule.max(90),
    }),
    defineField({
      name: "bannerCtaLabel",
      title: "Texto del CTA en el banner",
      type: "string",
      description: "Ej. Ver agenda, Ir al live.",
      validation: (Rule) => Rule.max(32),
    }),
    defineField({
      name: "bannerAction",
      title: "Acción del banner",
      type: "string",
      initialValue: "agenda",
      options: {
        layout: "radio",
        list: [
          { title: "Desplazar a la agenda en la home", value: "agenda" },
          { title: "Abrir el enlace del CTA principal", value: "cta" },
          { title: "Abrir un enlace personalizado", value: "custom" },
        ],
      },
    }),
    defineField({
      name: "bannerHref",
      title: "Enlace personalizado del banner",
      type: "string",
      hidden: ({ parent }) => parent?.bannerAction !== "custom",
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const action = (context as any)?.parent?.bannerAction;
          if (action === "custom" && !value) {
            return "Indica el enlace personalizado para el banner.";
          }
          return true;
        }),
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
