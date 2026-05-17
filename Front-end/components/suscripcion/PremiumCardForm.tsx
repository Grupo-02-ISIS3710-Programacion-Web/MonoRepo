"use client"

import { memo, useCallback, useEffect, useMemo, useRef } from "react"
import { initMercadoPago, CardPayment } from "@mercadopago/sdk-react"
import { createSubscription } from "@/lib/api-client"

type PremiumCardFormProps = Readonly<{
  userId: string
  userEmail: string
  onSuccess: () => void
  onError: (error: string) => void
}>

function PremiumCardForm({
  userId,
  userEmail,
  onSuccess,
  onError,
}: PremiumCardFormProps) {
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    const useLive = process.env.NEXT_PUBLIC_IS_PRODUCTION === "true"
    const publicKey = useLive
      ? process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY_LIVE || ""
      : process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY_TEST || ""
    initMercadoPago(publicKey, { locale: "es-CO" })
  }, [])

  const initialization = useMemo(
    () => ({
      amount: 20000,
      payer: { email: userEmail },
    }),
    [userEmail],
  )

  const customization = useMemo(
    () => ({
      visual: {
        style: {
          theme: "bootstrap" as const,
          customVariables: {
            baseColor: "#BE3D5E",
            baseColorFirstVariant: "#DB5375",
            baseColorSecondVariant: "#EC9192",
            textPrimaryColor: "#1D1E2C",
            textSecondaryColor: "#59656F",
            buttonTextColor: "#FFFFFF",
            outlinePrimaryColor: "#DB5375",
            outlineSecondaryColor: "#E8ECEF",
            errorColor: "#DC2626",
            successColor: "#16A34A",
            borderRadiusMedium: "8px",
            formPadding: "16px",
          },
        },
      },
    }),
    [],
  )

  const onSubmit = useCallback(
    async (param: { token: string }) => {
      await createSubscription({
        cardTokenId: param.token,
        payerEmail: userEmail,
        userId,
      })
      onSuccess()
    },
    [userEmail, userId, onSuccess],
  )

  const onBrickError = useCallback(
    (error: any) => {
      onError(error?.message || "Error en el formulario de pago")
    },
    [onError],
  )

  return (
    <CardPayment
      initialization={initialization}
      customization={customization}
      locale="es-CO"
      onSubmit={onSubmit}
      onError={onBrickError}
    />
  )
}

export default memo(PremiumCardForm)
