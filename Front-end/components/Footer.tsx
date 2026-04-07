import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

const exploreLinks = [
    { href: "/", key: "bestSellers" },
    { href: "/descubrir", key: "ingredientLab" },
    { href: "/community", key: "forums" },
] as const;

const communityLinks = [
    { href: "/profile", key: "communityRules" },
    { href: "/ai-routine", key: "hallOfFame" },
    { href: "/ToS", key: "verifiedExperts" },
] as const;

type FooterProps = {
    locale: string;
};

export default async function Footer({ locale }: FooterProps) {
    const t = await getTranslations({ locale, namespace: "Footer" });

    return (
        <footer className="border-t border-border bg-muted/35">
            <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-14">
                <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
                    <section>
                        <Link href="/" className="inline-flex items-center gap-2 text-foreground">
                            <Image src="/skin4all_logo.svg" alt="Skin4All logo" width={20} height={20} />
                            <span className="text-2xl font-bold tracking-tight">{t("brand")}</span>
                        </Link>
                        <p className="mt-4 max-w-xs text-base text-muted-foreground">{t("description")}</p>
                    </section>

                    <section>
                        <h3 className="text-xl font-bold text-foreground">{t("exploreTitle")}</h3>
                        <nav className="mt-4 flex flex-col gap-2.5" aria-label={t("exploreTitle")}>
                            {exploreLinks.map((item) => (
                                <Link
                                    key={item.key}
                                    href={item.href}
                                    className="w-fit text-base text-muted-foreground transition-colors hover:text-primary"
                                >
                                    {t(`explore.${item.key}`)}
                                </Link>
                            ))}
                        </nav>
                    </section>

                    <section>
                        <h3 className="text-xl font-bold text-foreground">{t("communityTitle")}</h3>
                        <nav className="mt-4 flex flex-col gap-2.5" aria-label={t("communityTitle")}>
                            {communityLinks.map((item) => (
                                <Link
                                    key={item.key}
                                    href={item.href}
                                    className="w-fit text-base text-muted-foreground transition-colors hover:text-primary"
                                >
                                    {t(`community.${item.key}`)}
                                </Link>
                            ))}
                        </nav>
                    </section>

                </div>

                <div className="mt-10 border-t border-border pt-6 text-center">
                    <p className="text-base text-primary">{t("copyright")}</p>
                </div>
            </div>
        </footer>
    );
}