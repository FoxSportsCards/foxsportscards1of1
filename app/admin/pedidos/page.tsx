import AdminOrdersClient from "./AdminOrdersClient";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin pedidos | Fox Sports Cards 1of1",
};

export default function AdminOrdersPage() {
  return <AdminOrdersClient />;
}
