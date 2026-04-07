import { getTranslations } from "next-intl/server";

type ToSPageProps = Readonly<{
    params: Promise<{ locale: string }>;
}>;

export default async function ToSPage({ params }: ToSPageProps) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "ToS" });

    return (
        <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm sm:p-8">
                <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
                <p className="mt-3 text-sm text-muted-foreground">
                    {t("lastUpdated")}
                </p>

                <section className="mt-8 space-y-4">
                    <h2 className="text-xl font-medium">{t("sections.platformUse.title")}</h2>
                    <p className="text-sm leading-6 text-muted-foreground">
                        {t("sections.platformUse.body")}
                    </p>
                </section>

                <section className="mt-6 space-y-4">
                    <h2 className="text-xl font-medium">{t("sections.accountPrivacy.title")}</h2>
                    <p className="text-sm leading-6 text-muted-foreground">
                        {t("sections.accountPrivacy.body")}
                    </p>
                </section>

                <section className="mt-6 space-y-4">
                    <h2 className="text-xl font-medium">{t("sections.contentRecommendations.title")}</h2>
                    <p className="text-sm leading-6 text-muted-foreground">
                        {t("sections.contentRecommendations.body")}
                    </p>
                </section>

                <section className="mt-6 space-y-4">
                    <h2 className="text-xl font-medium">{t("sections.changes.title")}</h2>
                    <p className="text-sm leading-6 text-muted-foreground">
                        {t("sections.changes.body")}
                    </p>
                </section>
            </div>
        </main>
    );
}