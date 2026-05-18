"use client";

import { Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function PremiumRequiredCard() {
  const t = useTranslations("AiRoutine.premiumRequired");

  return (
    <main className="min-h-[70vh] bg-background px-4 py-10 md:px-8">
      <div className="mx-auto max-w-2xl">
        <Card className="border-border">
          <CardHeader>
            <div className="mb-4 flex justify-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-amber-100">
                <Crown className="size-7 text-amber-600" />
              </div>
            </div>
            <CardTitle className="text-center text-2xl font-bold text-foreground">
              {t("title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-center text-muted-foreground">
              {t("description")}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/suscripcion">{t("goToPremium")}</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/community">{t("backToCommunity")}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
