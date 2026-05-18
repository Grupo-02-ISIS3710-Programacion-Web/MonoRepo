"use client"

import { memo, useCallback, useEffect, useState } from "react"
import { createSubscription, getMerchantInfo } from "@/lib/api-client"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Lock } from "lucide-react"

type PremiumCardFormProps = Readonly<{
  userId: string
  userEmail: string
  onSuccess: () => void
  onError: (error: string) => void
}>

type MerchantInfo = {
  presigned_acceptance: { acceptance_token: string; permalink: string }
  presigned_personal_data_auth: { acceptance_token: string; permalink: string }
}

function PremiumCardForm({
  userId,
  userEmail,
  onSuccess,
  onError,
}: PremiumCardFormProps) {
  const [merchantInfo, setMerchantInfo] = useState<MerchantInfo | null>(null)
  const [merchantLoading, setMerchantLoading] = useState(true)
  const [acceptPolicy, setAcceptPolicy] = useState(false)
  const [acceptPersonalData, setAcceptPersonalData] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [cardNumber, setCardNumber] = useState("")
  const [expMonth, setExpMonth] = useState("")
  const [expYear, setExpYear] = useState("")
  const [cvc, setCvc] = useState("")
  const [cardHolder, setCardHolder] = useState("")

  useEffect(() => {
    getMerchantInfo()
      .then(setMerchantInfo)
      .catch(() => onError("Error al obtener información del comercio"))
      .finally(() => setMerchantLoading(false))
  }, [onError])

  const formatCardNumber = useCallback((value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16)
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ")
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!merchantInfo) return
      if (!acceptPolicy || !acceptPersonalData) return
      setSubmitting(true)

      const publicKey = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY || ""
      const useLive = process.env.NEXT_PUBLIC_IS_PRODUCTION === "true"
      const baseUrl = useLive
        ? "https://production.wompi.co/v1"
        : "https://sandbox.wompi.co/v1"

      try {
        const tokenResponse = await fetch(`${baseUrl}/tokens/cards`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${publicKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            number: cardNumber.replace(/\s/g, ""),
            exp_month: expMonth,
            exp_year: expYear,
            cvc,
            card_holder: cardHolder,
          }),
        })

        const tokenResult = await tokenResponse.json()

        if (tokenResult.status !== "CREATED" || !tokenResult.data?.id) {
          throw new Error(tokenResult?.message || JSON.stringify(tokenResult) || "Error al tokenizar la tarjeta")
        }

        const cardToken = tokenResult.data.id

        const freshInfo = await getMerchantInfo()

        await createSubscription({
          token: cardToken,
          acceptanceToken: freshInfo.presigned_acceptance.acceptance_token,
          acceptPersonalAuth: freshInfo.presigned_personal_data_auth.acceptance_token,
          payerEmail: userEmail,
          userId,
        })

        onSuccess()
      } catch (error: any) {
        const msg = error?.message || ""
        const cleanMsg = msg.replace(/^API Error:\s*\d+\s*\w*\s*[—\-]\s*/, "")
        onError(cleanMsg || "Error al procesar el pago")
      } finally {
        setSubmitting(false)
      }
    },
    [
      acceptPolicy,
      acceptPersonalData,
      cardNumber,
      expMonth,
      expYear,
      cvc,
      cardHolder,
      userEmail,
      userId,
      onSuccess,
      onError,
    ],
  )

  if (merchantLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  const allAccepted = acceptPolicy && acceptPersonalData

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="cardHolder">Nombre del titular</Label>
          <Input
            id="cardHolder"
            value={cardHolder}
            onChange={(e) => setCardHolder(e.target.value)}
            placeholder="Pedro Pérez"
            required
            minLength={5}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cardNumber">Número de tarjeta</Label>
          <Input
            id="cardNumber"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            placeholder="4242 4242 4242 4242"
            required
            inputMode="numeric"
            autoComplete="cc-number"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="expMonth">Mes</Label>
            <Input
              id="expMonth"
              value={expMonth}
              onChange={(e) => setExpMonth(e.target.value.replace(/\D/g, "").slice(0, 2))}
              placeholder="MM"
              required
              inputMode="numeric"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="expYear">Año</Label>
            <Input
              id="expYear"
              value={expYear}
              onChange={(e) => setExpYear(e.target.value.replace(/\D/g, "").slice(0, 2))}
              placeholder="AA"
              required
              inputMode="numeric"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cvc">CVC</Label>
            <Input
              id="cvc"
              value={cvc}
              onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="123"
              required
              inputMode="numeric"
              autoComplete="cc-csc"
            />
          </div>
        </div>
      </div>

      {merchantInfo && (
        <div className="space-y-3 rounded-lg border p-3 text-sm">
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptPolicy}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAcceptPolicy(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm text-muted-foreground leading-tight">
              Acepto los{" "}
              <a
                href={merchantInfo.presigned_acceptance.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2"
              >
                términos y condiciones
              </a>{" "}
              de Wompi
            </span>
          </label>
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptPersonalData}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAcceptPersonalData(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm text-muted-foreground leading-tight">
              Acepto la{" "}
              <a
                href={merchantInfo.presigned_personal_data_auth.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2"
              >
                autorización de datos personales
              </a>
            </span>
          </label>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Lock size={14} />
        <span>Protegido por Wompi. Tus datos están cifrados y seguros.</span>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={!allAccepted || submitting}
      >
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Procesando...
          </>
        ) : (
          "Suscribirme ahora"
        )}
      </Button>
    </form>
  )
}

export default memo(PremiumCardForm)
