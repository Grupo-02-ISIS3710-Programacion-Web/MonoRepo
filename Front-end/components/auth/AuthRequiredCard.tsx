"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

type AuthRequiredCardProps = Readonly<{
  redirectPath?: string;
}>;

export default function AuthRequiredCard({
  redirectPath = "/community",
}: AuthRequiredCardProps) {
  const t = useTranslations("Auth");
  const loginHref = `/login?redirect=${encodeURIComponent(redirectPath)}`;

  return (
    <main className="min-h-[70vh] bg-background px-4 py-10 md:px-8">
      <div className="mx-auto max-w-2xl">
        <Card className="border-[#e6e9ef]">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-[#222739]">{t("requiredTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-[#606980]">{t("requiredDescription")}</p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href={loginHref}>{t("goToLogin")}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/community">{t("backToCommunity")}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
