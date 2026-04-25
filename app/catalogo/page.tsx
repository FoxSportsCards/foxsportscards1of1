import { getCatalogProducts } from "@/lib/products";
import { getServerLocale } from "@/lib/getServerLocale";
import { CatalogClient } from "./CatalogClient";

export const runtime = "edge";
export const revalidate = 180;

export const metadata = {
  title: "Catálogo | Fox Sports Cards 1of1",
};

type CatalogPageProps = {
  searchParams?: {
    filtro?: string | string[];
    pagina?: string | string[];
  };
};

function statusPriority(status?: string) {
  switch (status) {
    case "available":
      return 0;
    case "reserved":
      return 1;
    case "upcoming":
      return 2;
    case "sold":
      return 3;
    default:
      return 2;
  }
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const locale = getServerLocale();
  const rawPage = searchParams?.pagina;
  const page = Math.max(1, Number(Array.isArray(rawPage) ? rawPage[0] : rawPage) || 1);
  const pageSize = 24;
  const { products, total } = await getCatalogProducts(page, pageSize);
  const sorted = [...products].sort((a, b) => statusPriority(a.status) - statusPriority(b.status));
  const rawFilter = searchParams?.filtro;
  const initialFilter = Array.isArray(rawFilter) ? rawFilter[0] ?? "Todos" : rawFilter?.trim() ?? "Todos";

  return (
    <div className="container py-14 sm:py-16">
      <CatalogClient
        products={sorted}
        locale={locale}
        initialFilter={initialFilter}
        page={page}
        pageSize={pageSize}
        totalProducts={total}
      />
    </div>
  );
}
