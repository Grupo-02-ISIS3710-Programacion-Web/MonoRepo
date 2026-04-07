import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import RouteTransition from "@/components/RouteTransition";
import { Toaster } from "@/components/ui/sonner";
import { locales, type AppLocale } from "@/i18n/routing";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

type LocaleLayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!locales.includes(locale as AppLocale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = (await import(`../../messages/${locale}.json`)).default;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <NavBar />
      <RouteTransition>{children}</RouteTransition>
      <Footer locale={locale} />
      <Toaster />
    </NextIntlClientProvider>
  );
}
