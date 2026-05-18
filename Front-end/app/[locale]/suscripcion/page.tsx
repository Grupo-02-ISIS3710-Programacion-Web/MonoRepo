"use client"

import AuthRequiredCard from "@/components/auth/AuthRequiredCard"
import PremiumCardForm from "@/components/suscripcion/PremiumCardForm"
import { getPremiumStatus } from "@/lib/api-client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Check,
  Crown,
  Loader2,
  Sparkles,
  Star,
  AlertCircle,
} from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { Link } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { useAuthSession } from "@/lib/hooks/use-auth-session"

type PageState = "loading" | "form" | "already-premium" | "success"

const WOMPI_ERROR_MAP: Record<string, string> = {
  "El token de aceptación ya fue usado": "Tu sesión expiró. Intenta de nuevo.",
  "Card declined": "La tarjeta fue rechazada por el banco. Usa otra tarjeta.",
  "card declined": "La tarjeta fue rechazada por el banco. Usa otra tarjeta.",
  "insufficient funds": "La tarjeta no tiene fondos suficientes. Usa otra tarjeta.",
  "expired card": "La tarjeta está vencida. Usa otra tarjeta.",
  "invalid card": "El número de tarjeta no es válido. Revisa los datos.",
}

function userFriendlyError(raw: string): string {
  for (const [key, msg] of Object.entries(WOMPI_ERROR_MAP)) {
    if (raw.toLowerCase().includes(key.toLowerCase())) return msg
  }
  if (/^4\d{2}\s/.test(raw)) return raw.replace(/^4\d{2}\s/, "").trim()
  if (raw.length > 120) return raw.slice(0, 120) + "…"
  return raw
}

export default function SuscripcionPage() {
  const t = useTranslations("Suscripcion")
  const { user, isReady } = useAuthSession()
  const [pageState, setPageState] = useState<PageState>("loading")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isReady) return
    if (!user) {
      setPageState("form")
      return
    }
    getPremiumStatus(user.id)
      .then((res) => {
        setPageState(res.isPremium ? "already-premium" : "form")
      })
      .catch(() => {
        setPageState("form")
      })
  }, [user, isReady])

  if (!isReady) {
    return (
      <main className="min-h-[70vh] bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    )
  }

  if (!user) {
    return <AuthRequiredCard redirectPath="/suscripcion" />
  }

  const handleSuccess = useCallback(() => {
    setPageState("success")
  }, [])

  const handleError = useCallback((msg: string) => {
    setError(userFriendlyError(msg))
  }, [])

  if (pageState === "already-premium") {
    return (
      <main className="min-h-[70vh] bg-background px-4 py-10 md:px-8">
        <div className="mx-auto max-w-lg text-center space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-secondary/20 p-4">
              <Crown className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            {t("alreadyPremiumTitle")}
          </h1>
          <p className="text-muted-foreground">
            {t("alreadyPremiumDescription")}
          </p>
          <Badge variant="secondary" className="text-sm px-4 py-1 text-primary border-primary/40">
            <Star className="mr-1 h-4 w-4 fill-current text-primary" />
            {t("premiumBadge")}
          </Badge>
          <div className="flex gap-3 justify-center pt-4">
            <Button asChild variant="outline">
              <Link href="/profile">{t("goToProfile")}</Link>
            </Button>
            <Button asChild>
              <Link href="/">{t("goHome")}</Link>
            </Button>
          </div>
        </div>
      </main>
    )
  }

  if (pageState === "success") {
    return (
      <main className="min-h-[70vh] bg-background px-4 py-10 md:px-8">
        <div className="mx-auto max-w-lg text-center space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 p-4">
              <Check className="h-12 w-12 text-green-500" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            {t("thankYouTitle")}
          </h1>
          <p className="text-muted-foreground">
            {t("thankYouDescription")}
          </p>
          <Badge className="text-sm px-4 py-1 bg-primary text-primary-foreground">
            {t("premiumActivated")}
          </Badge>
          <div className="flex gap-3 justify-center pt-4">
            <Button asChild variant="outline">
              <Link href="/profile">{t("goToProfile")}</Link>
            </Button>
            <Button asChild>
              <Link href="/">{t("goHome")}</Link>
            </Button>
          </div>
        </div>
      </main>
    )
  }

  const features = t.raw("benefits") as string[]

  return (
    <main className="min-h-[70vh] bg-background px-4 py-10 md:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
          Volver al inicio
        </Link>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            {t("title")}
          </h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge className="bg-primary text-primary-foreground">{t("planBadge")}</Badge>
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-xl mt-2">{t("planName")}</CardTitle>
              <CardDescription>{t("planDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-foreground">$20.000</span>
                <span className="text-muted-foreground"> COP/{t("month")}</span>
              </div>
              <Separator />
              <ul className="space-y-3">
                {features.map((feature: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("paymentTitle")}</CardTitle>
              <CardDescription>{t("paymentDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 mt-0.5 shrink-0 text-red-500" />
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-red-800">
                        Error al procesar el pago
                      </p>
                      <p className="text-sm text-red-700 leading-relaxed">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <PremiumCardForm
                userId={user.id}
                userEmail={user.email}
                onSuccess={handleSuccess}
                onError={handleError}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
