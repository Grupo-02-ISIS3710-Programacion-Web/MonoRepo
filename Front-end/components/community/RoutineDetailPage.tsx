"use client";

import { Link } from "@/i18n/navigation";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CommentSection from "@/components/comments/CommentsSection";
import { getProductById, getUserById } from "@/lib/api";
import { getRoutineById } from "@/lib/routine";
import { toLowerCaseAndReplaceSpacesWithHyphens } from "@/lib/string-utils";
import { ArrowDown, ArrowLeft, ArrowUp, CalendarDays, MessageSquare, Moon, Sun } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import { useRoutineVote } from "@/lib/hooks/use-routine-votes";
import { useLocaleDateFormatter } from "@/lib/hooks/use-locale-date-formatter";
import { useAuthSession } from "@/lib/hooks/use-auth-session";

type RoutineDetailPageProps = Readonly<{
  routineId: string;
  backPath?: string;
}>;

export default function RoutineDetailPage({ routineId, backPath = "/community" }: RoutineDetailPageProps) {
  const t = useTranslations("RoutineDetail");
  const tSkin = useTranslations("SkinTypes");
  const locale = useLocale();
  const { user: loggedUser, isLoggedIn } = useAuthSession();

  const routine = getRoutineById(routineId);
  const user = routine ? getUserById(routine.userId) : undefined;
  const currentUserId = loggedUser?.id ?? "";
  const comments = routine?.comments ?? [];
  const loginHref = `/login?redirect=${encodeURIComponent(`/routine/detail/${routineId}`)}`;
  const dateFormatter = useLocaleDateFormatter(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const {
    routineUpvotes,
    routineDownvotes,
    hasUpvotedRoutine,
    hasDownvotedRoutine,
    handleRoutineVote,
  } = useRoutineVote(routine?.upvotes ?? [], routine?.downvotes ?? [], currentUserId);

  const publishedAtLabel = useMemo(() => {
    if (!routine?.publishedAt) {
      return "-";
    }
    return dateFormatter.format(new Date(routine.publishedAt));
  }, [dateFormatter, routine?.publishedAt]);

  if (!routine) {
    return (
      <main className="min-h-screen bg-background px-4 py-8">
        <div className="mx-auto max-w-4xl rounded-2xl border border-[#e6e9ef] bg-card p-8 text-center">
          <h1 className="text-2xl font-bold text-[#222739]">{t("notFoundTitle")}</h1>
          <p className="mt-2 text-[#646e84]">{t("notFoundDescription")}</p>
          <Link href={backPath} className="mt-4 inline-flex items-center gap-2 text-primary hover:underline">
            <ArrowLeft size={16} />
            {t("backToDiscussions")}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <Link href={backPath}>
                {t("community")}
              </Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-secondary" />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/routine/detail/${routine.id}`} className="hover:text-secondary">
                {routine.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[400px_minmax(0,1fr)] lg:items-start">
          <Card className="border-[#e8ebf1] lg:sticky lg:top-6 bg-card">
            <CardHeader className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Link href={backPath} className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary">
                  <ArrowLeft size={16} />
                  {t("backToDiscussions")}
                </Link>
                <span className="rounded-full bg-secondary/30 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
                  {tSkin(routine.skinType)}
                </span>
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl font-extrabold text-[#222739]">{routine.name}</h1>
                <p className="text-[#5f6880]">{routine.description}</p>
              </div>

              <div className="border-t border-[#eceff4] pt-4">
                <div className="flex items-center gap-3">
                  <img src={user?.avatarUrl} alt={user?.name ?? t("authorFallback")} className="h-10 w-10 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-semibold text-[#242939]">{user?.name ?? t("userFallback")}</p>
                    <p className="text-xs text-[#5d6478]">{t("routineCreator")}</p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-[#4f576e]">
                    <MessageSquare size={14} />
                    {comments.length}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-[#4f576e]">
                    <CalendarDays size={14} />
                    {publishedAtLabel}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-[#4f576e]">
                    {routine.type.toLowerCase() === "am" ? <Sun size={14} /> : <Moon size={14} />}
                    {t("routineType", { type: routine.type.toUpperCase() })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 border-t border-[#eceff4] pt-4 text-sm font-semibold text-[#4f576e]">
                <button
                  type="button"
                  onClick={() => {
                    if (!isLoggedIn) {
                      return;
                    }
                    handleRoutineVote("up");
                  }}
                  className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 transition ${hasUpvotedRoutine
                    ? "border-primary bg-secondary/20 text-primary"
                    : "border-border hover:border-primary hover:text-primary"
                    }`}
                  aria-label={t("upvote")}
                  disabled={!isLoggedIn}
                >
                  <ArrowUp size={14} />
                  {routineUpvotes.length}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!isLoggedIn) {
                      return;
                    }
                    handleRoutineVote("down");
                  }}
                  className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 transition ${hasDownvotedRoutine
                    ? "border-primary bg-secondary/20 text-primary"
                    : "border-border hover:border-primary hover:text-primary"
                    }`}
                  aria-label={t("downvote")}
                  disabled={!isLoggedIn}
                >
                  <ArrowDown size={14} />
                  {routineDownvotes.length}
                </button>
              </div>
              {!isLoggedIn && (
                <p className="text-sm text-[#5f6880]">
                  {t("loginRequiredForComments")} <Link href={loginHref} className="font-semibold text-primary hover:underline">{t("goToLogin")}</Link>
                </p>
              )}
            </CardHeader>
          </Card>

          <div className="space-y-6">
            <Card className="border-[#e8ebf1] bg-card">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-[#202635]">{t("stepsTitle")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {routine.steps
                  .slice()
                  .sort((a, b) => a.order - b.order)
                  .map((step, index) => {
                    const product = getProductById(step.productId);
                    const productImage = product?.image_url?.[0];
                    const productHref = product
                      ? `/descubrir/${toLowerCaseAndReplaceSpacesWithHyphens(product.name)}`
                      : null;

                    const stepContent = (
                      <article className="rounded-xl border border-border bg-card p-4 transition hover:border-secondary hover:bg-secondary/10">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start">
                          {productImage ? (
                            <img
                              src={productImage}
                              alt={product?.name ?? t("unknownProduct")}
                              className="h-48 w-full rounded-lg object-cover md:h-32 md:w-32 md:min-w-32"
                            />
                          ) : (
                            <div className="flex h-48 w-full items-center justify-center rounded-lg bg-muted text-sm font-medium text-[#69728a] md:h-32 md:w-32 md:min-w-32">
                              {t("noImage")}
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <h3 className="text-lg font-bold text-[#212636]">
                              {t("stepTitle", { number: index + 1, name: step.name })}
                            </h3>
                            <p className="mt-1 text-base font-semibold text-[#3a4258]">{product?.brand ?? t("unknownBrand")}</p>
                            <p className="mt-1 text-sm font-medium text-[#414b63]">{product?.name ?? t("unknownProduct")}</p>
                            <p className="mt-2 text-sm text-[#687189]">{step.notes}</p>
                          </div>
                        </div>
                      </article>
                    );

                    if (!productHref) {
                      return <div key={step.id}>{stepContent}</div>;
                    }

                    return (
                      <Link key={step.id} href={productHref} className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
                        {stepContent}
                      </Link>
                    );
                  })}
              </CardContent>
            </Card>

            <CommentSection
              targetId={routine.id}
              targetType="routine"
              initialComments={comments}
              currentUserId={currentUserId}
              isLoggedIn={isLoggedIn}
              loginHref={loginHref}
              translationNamespace="RoutineDetail"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
