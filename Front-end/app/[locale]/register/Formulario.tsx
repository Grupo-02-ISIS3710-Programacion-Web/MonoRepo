"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SubmitHandler, useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { tiposPiel } from "@/lib/constants/TipoPiel";
import { formasEnteroDeNosotros } from "@/lib/constants/FormasDeContacto";
import { DatePickerSimple } from "@/components/ui/datepicker";
import { Link } from "@/i18n/navigation";
import { useState } from "react";

export type FormularioRegistro = {
    nombre: string;
    fechaNacimiento: string;
    tipoPiel: string;
    probadoSkinCare?: boolean;
    comoEnteroDeNosotros: string;
    email: string;
    contrasenia: string;
    confirmarContrasenia: string;
    avatarUrl?: string;
}

export function FormularioRegistroComponent() {
    const t = useTranslations("registro");
    const { register, handleSubmit, watch, formState: { errors }, setValue } = useForm<FormularioRegistro>({
        defaultValues: {
            nombre: "",
            fechaNacimiento: "",
            tipoPiel: "",
            probadoSkinCare: undefined,
            comoEnteroDeNosotros: "",
            email: "",
            contrasenia: "",
            confirmarContrasenia: "",
            avatarUrl: "",
        }
    });

    const campoObligatorio = t("validaciones.requerido");

    const [mensaje, setMensaje] = useState("");
    const [errorRegistro, setErrorRegistro] = useState("");
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [subiendoImagen, setSubiendoImagen] = useState(false);

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setAvatarPreview(URL.createObjectURL(file));
        setSubiendoImagen(true);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/upload/avatar`, 
                { method: "POST", body: formData }
            );
            const data = await res.json();
            setValue("avatarUrl", data.url); 
        } catch {
            setErrorRegistro("Error al subir la imagen");
        } finally {
            setSubiendoImagen(false);
        }
    };

    const onSubmit: SubmitHandler<FormularioRegistro> = async (data) => {
        setMensaje("");
        setErrorRegistro("");

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    Array.isArray(result.message)
                        ? result.message[0]
                        : result.message || "Ocurrió un error"
                );
            }

            localStorage.setItem("skin4all.auth.token", result.token);
            setMensaje("Usuario registrado correctamente");

            setTimeout(() => {
                window.location.href = "/";
            }, 1500);

        } catch (error) {
            if (error instanceof Error) {
                setErrorRegistro(error.message);
            } else {
                setErrorRegistro("Ocurrió un error inesperado");
            }
        }
    };

    const haProbadoSkinCare = watch("probadoSkinCare");

    const selectClasses =
        "border-secondary bg-transparent h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";
    const inputPrimaryClasses =
        "border-secondary/60 focus-visible:border-primary focus-visible:ring-primary/40";

    const fechaNacimiento = watch("fechaNacimiento");
    const selectedBirthDate = fechaNacimiento ? new Date(`${fechaNacimiento}T00:00:00`) : undefined;

    const formatDateToISO = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* Avatar */}
            <div className="flex flex-col items-center gap-3">
                <div className="relative w-24 h-24">
                    {avatarPreview ? (
                        <img
                            src={avatarPreview}
                            alt="Avatar"
                            className="w-24 h-24 rounded-full object-cover border-2 border-primary"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-secondary/20 border-2 border-dashed border-secondary flex items-center justify-center text-3xl">
                            👤
                        </div>
                    )}
                    {subiendoImagen && (
                        <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                            <span className="text-white text-xs">Subiendo...</span>
                        </div>
                    )}
                </div>
                <label className="cursor-pointer text-sm text-primary underline underline-offset-2 hover:text-secondary">
                    {t("campos.fotoPerfil.label")}
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                    />
                </label>
                <input type="hidden" {...register("avatarUrl")} />
            </div>

            <div className="space-y-2">
                <p className="text-sm font-medium">{t("campos.nombre.label")}</p>
                <Input
                    type="text"
                    className={inputPrimaryClasses}
                    placeholder={t("campos.nombre.placeholder")}
                    {...register("nombre", { required: campoObligatorio })}
                />
                {errors.nombre && <span className="text-red-500 text-sm">{errors.nombre.message}</span>}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                    <p className="text-sm font-medium">{t("campos.fechaNacimiento.label")}</p>
                    <DatePickerSimple
                        value={selectedBirthDate}
                        onChange={(date) => setValue("fechaNacimiento", date ? formatDateToISO(date) : "", { shouldDirty: true, shouldValidate: true })}
                        placeholder={t("campos.fechaNacimiento.label")}
                        className={`w-full justify-start font-normal ${inputPrimaryClasses}`}
                    />
                    <input type="hidden" {...register("fechaNacimiento", { required: campoObligatorio })} />
                    {errors.fechaNacimiento && <span className="text-red-500 text-sm">{errors.fechaNacimiento.message}</span>}
                </div>

                <div className="space-y-2">
                    <label htmlFor="register-tipo-piel" className="text-sm font-medium">{t("campos.tipoPiel.label")}</label>
                    <select id="register-tipo-piel" className={selectClasses} {...register("tipoPiel", { required: campoObligatorio })}>
                        <option value="">{t("campos.tipoPiel.placeholder")}</option>
                        {tiposPiel.map((tipo) => (
                            <option key={tipo.value} value={tipo.value}>{t(`campos.tipoPiel.opciones.${tipo.value}`)}</option>
                        ))}
                    </select>
                    {errors.tipoPiel && <span className="text-red-500 text-sm">{errors.tipoPiel.message}</span>}
                </div>
            </div>

            <div className="space-y-2">
                <p className="text-sm font-medium">{t("campos.probadoSkinCare.label")}</p>
                <div className="grid grid-cols-2 gap-2">
                    <Button
                        type="button"
                        className="border-secondary"
                        variant={haProbadoSkinCare === true ? "default" : "outline"}
                        onClick={() => setValue("probadoSkinCare", true, { shouldDirty: true, shouldValidate: true })}
                    >
                        {t("campos.probadoSkinCare.si")}
                    </Button>
                    <Button
                        type="button"
                        className="border-secondary"
                        variant={haProbadoSkinCare === false ? "default" : "outline"}
                        onClick={() => setValue("probadoSkinCare", false, { shouldDirty: true, shouldValidate: true })}
                    >
                        {t("campos.probadoSkinCare.no")}
                    </Button>
                </div>
                <input
                    type="hidden"
                    {...register("probadoSkinCare", {
                        validate: (value) => typeof value === "boolean" || campoObligatorio,
                    })}
                />
                {errors.probadoSkinCare && <span className="text-red-500 text-sm">{errors.probadoSkinCare.message}</span>}
            </div>

            <div className="space-y-2">
                <label htmlFor="register-como-entero" className="text-sm font-medium">{t("campos.comoEnteroDeNosotros.label")}</label>
                <select id="register-como-entero" className={selectClasses} {...register("comoEnteroDeNosotros", { required: campoObligatorio })}>
                    <option value="">{t("campos.comoEnteroDeNosotros.placeholder")}</option>
                    {formasEnteroDeNosotros.map((forma) => (
                        <option key={forma.value} value={forma.value}>{t(`campos.comoEnteroDeNosotros.opciones.${forma.value}`)}</option>
                    ))}
                </select>
                {errors.comoEnteroDeNosotros && <span className="text-red-500 text-sm">{errors.comoEnteroDeNosotros.message}</span>}
            </div>

            <hr className="border-primary" />

            <div className="space-y-2">
                <p className="text-sm font-medium">{t("campos.email.label")}</p>
                <Input
                    type="email"
                    placeholder={t("campos.email.placeholder")}
                    className={inputPrimaryClasses}
                    {...register("email", { required: campoObligatorio })}
                />
                {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                    <p className="text-sm font-medium">{t("campos.contrasenia.label")}</p>
                    <Input
                        type="password"
                        className={inputPrimaryClasses}
                        placeholder={t("campos.contrasenia.placeholder")}
                        {...register("contrasenia", {
                            required: campoObligatorio,
                            minLength: {
                                value: 8,
                                message: t("validaciones.contraseniaMinima"),
                            },
                        })}
                    />
                    {errors.contrasenia && <span className="text-red-500 text-sm">{errors.contrasenia.message}</span>}
                </div>

                <div className="space-y-2">
                    <p className="text-sm font-medium">{t("campos.confirmarContrasenia.label")}</p>
                    <Input
                        type="password"
                        placeholder={t("campos.confirmarContrasenia.placeholder")}
                        className={inputPrimaryClasses}
                        {...register("confirmarContrasenia", {
                            required: campoObligatorio,
                            validate: (value) => value === watch("contrasenia") || t("validaciones.contraseniasNoCoinciden"),
                        })}
                    />
                    {errors.confirmarContrasenia && (
                        <span className="text-red-500 text-sm">{errors.confirmarContrasenia.message}</span>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <p className="text-gray-600 text-sm">
                    {t("legal.texto")} <Link href="/ToS" className="text-primary underline underline-offset-2 hover:text-secondary">{t("legal.terminos")}</Link>
                </p>
            </div>

            <Button type="submit" className="w-full" disabled={subiendoImagen}>
                {t("botones.crearCuenta")}
            </Button>

            {mensaje && (
                <p className="text-green-600 text-sm text-center">
                    {mensaje}
                </p>
            )}

            {errorRegistro && (
                <p className="text-red-500 text-sm text-center">
                    {errorRegistro}
                </p>
            )}

            <p className="text-center text-sm">
                {t("footer.yaTienesCuenta")} <Link href="/login" className="text-primary underline underline-offset-2 hover:text-secondary">{t("botones.iniciarSesion")}</Link>
            </p>
        </form>
    );
}
