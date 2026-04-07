"use client";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { FormularioRegistroComponent } from "./Formulario";
import { RegisterHero } from "./RegisterHero";

export default function Registro() {
    return (
        <div className="flex min-h-screen items-center justify-center px-4 py-10" style={{ backgroundImage: `url(/background-reg.png)`, backgroundSize: "cover", backgroundPosition: "center" }}>
            <Card className="w-full max-w-xl border-primary/60 overflow-hidden gap-0 py-0">
                <RegisterHero />
                <CardContent className="px-7 pb-7 pt-7 sm:px-8 sm:pb-8 sm:pt-8">
                    <FormularioRegistroComponent />
                </CardContent>
            </Card>
        </div >
    )
}
