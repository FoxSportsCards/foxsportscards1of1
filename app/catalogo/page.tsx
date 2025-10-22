import { getAllProducts } from "@/lib/products";
import { CatalogClient } from "./CatalogClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "edge";
export const preferredRegion = "auto";

export const metadata = {
  title: "Catálogo | foxsportscards1of1",
};

export default async function CatalogPage() {
  const products = await getAllProducts();
  const sorted = [...products].sort((a, b) => {
    const priority = (status?: string) => {
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
    };
    return priority(a.status) - priority(b.status);
  });

  return (
    <div className="container py-16">
      <CatalogClient products={sorted} />
    </div>
  );
}
