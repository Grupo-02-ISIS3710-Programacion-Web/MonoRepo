import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import LoginFormComponent from "@/components/auth/LoginFormComponent"

export default async function Login({ searchParams }: any) {

  const resolved = await Promise.resolve(searchParams);
  const redirectParam = resolved?.redirect;
  const initialRedirect = typeof redirectParam === 'string' ? redirectParam : Array.isArray(redirectParam) ? redirectParam[0] : undefined;

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{
        backgroundImage: `url(/background-reg.png)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >

      <Card className="w-full max-w-md rounded-3xl bg-white/95 backdrop-blur-sm shadow-xl p-8">

        <CardContent>

          <LoginFormComponent initialRedirect={initialRedirect} />

        </CardContent>

      </Card>

    </div>
  )
}
