import { getServerLocale } from "@/lib/getServerLocale";
import LoginClient from "./LoginClient";

export const metadata = {
  title: "Iniciar sesión | Fox Sports Cards 1of1",
};

export default function LoginPage() {
  const locale = getServerLocale();
  return <LoginClient locale={locale} />;
}
