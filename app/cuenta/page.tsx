import { getServerLocale } from "@/lib/getServerLocale";
import AccountClient from "./AccountClient";

export const metadata = {
  title: "Cuenta | Fox Sports Cards 1of1",
};

export const runtime = "edge";

export default function AccountPage() {
  const locale = getServerLocale();
  return <AccountClient locale={locale} />;
}
