import type { StructureResolver } from "sanity/structure";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Contenido")
    .items([
      S.documentTypeListItem("product").title("Productos"),
      S.divider(),
      ...S.documentTypeListItems().filter((item) => item.getId() !== "product"),
    ]);
