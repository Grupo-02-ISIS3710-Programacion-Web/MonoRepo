"use client";

import { fetchRoutines, fetchUsers, upvoteRoutine, downvoteRoutine, removeUpvote, removeDownvote } from "@/lib/api-client";
import { MessageSquare, Plus, Loader2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocaleDateFormatter } from "@/lib/hooks/use-locale-date-formatter";
import { AnimatePresence, motion } from "motion/react";
import RoutineCard from "@/components/community/RoutineCard";
import { useAuthSession } from "@/lib/hooks/use-auth-session";
import { getProtectedRoute } from "@/lib/protected-route";
import { Routine } from "@/types/routine";
import { SkinType } from "@/types/product";
import { toast } from "sonner";

type MobileTab = "newest" | "mostCommented" | "mostVoted";

const mobileTabs: MobileTab[] = ["newest", "mostCommented", "mostVoted"];

const toTopicTag = (label: string) => `#${label.replace(/[^a-zA-Z0-9]+/g, "")}`;

const skinTypeValues = Object.values(SkinType).filter((v) => typeof v === "string") as SkinType[];

const FilterButtons = ({ active, onChange, counts, t, tSkin }: any) => (
  <>
    <Button variant={active === "all" ? "default" : "outline"} onClick={() => onChange("all")} className="w-full justify-start">
      {t("allSkinTypes")}
    </Button>
    {skinTypeValues.map((skin) => (
      <Button key={skin} variant={active === skin ? "default" : "outline"} onClick={() => onChange(skin)} className="w-full justify-between">
        <span>{tSkin(skin)}</span>
        <span className="text-xs opacity-75">({counts[skin] ?? 0})</span>
      </Button>
    ))}
  </>
);

const SidebarSection = ({ title, subtitle, children }: any) => (
  <Card className="gap-2 py-4">
    <CardHeader className="pb-1">
      <div>{subtitle ? <><CardTitle>{title}</CardTitle><CardDescription>{subtitle}</CardDescription></> : <CardTitle className="text-base">{title}</CardTitle>}</div>
    </CardHeader>
    <CardContent className="pt-0">{children}</CardContent>
  </Card>
);

export default function CommunityPage() {
  const t = useTranslations("CommunityPage");
  const tSkin = useTranslations("SkinTypes");
  const tRoutine = useTranslations("RoutineDetail");
  const locale = useLocale();
  const { user } = useAuthSession();
  const isLoggedIn = !!user;

  const [activeTab, setActiveTab] = useState<MobileTab>("newest");
  const [activeSkinFilter, setActiveSkinFilter] = useState<"all" | string>("all");
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [usersMap, setUsersMap] = useState<Record<string, any>>({});

  const currentUserId = user?.id ?? "";
  const createRoutineHref = getProtectedRoute("/routine/crear", isLoggedIn);
  const createAiRoutineHref = getProtectedRoute("/ai-routine", isLoggedIn);

  useEffect(() => {
    const loadRoutines = async () => {
      try {
        setIsLoading(true);
        setCurrentPage(1);
        const data = await fetchRoutines(1, locale, activeTab);
        const fetchedRoutines = data.routines || [];
        setRoutines(fetchedRoutines);
        setTotalPages(data.totalPages || 1);
        setError(null);

        const userIds = [...new Set(fetchedRoutines.map((r: any) => r.userId).filter(Boolean))];
        if (userIds.length > 0) {
          fetchUsers()
            .then((allUsers) => {
              const map: Record<string, any> = {};
              for (const u of allUsers) {
                const uid = u._id || u.id;
                if (uid) map[uid] = u;
              }
              setUsersMap(map);
            })
            .catch(() => {});
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load routines");
        setRoutines([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadRoutines();
  }, [locale, activeTab]);

  const loadMoreRoutines = async () => {
    if (isLoadingMore || currentPage >= totalPages) return;

    try {
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;
      const data = await fetchRoutines(nextPage, locale, activeTab);
      setRoutines(prev => [...prev, ...(data.routines || [])]);
      setCurrentPage(nextPage);
      setTotalPages(data.totalPages || totalPages);
    } catch (err) {
      console.error("Failed to load more routines:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleVote = async (routineId: string, direction: "up" | "down") => {
    try {
      const routineIndex = routines.findIndex(r => r.id === routineId);
      if (routineIndex === -1) return;

      const routine = routines[routineIndex];
      const hasUpvoted = routine.upvotes?.includes(currentUserId) ?? false;
      const hasDownvoted = routine.downvotes?.includes(currentUserId) ?? false;

      let updatedRoutine = { ...routine };

      if (direction === "up") {
        if (hasUpvoted) {
          // Remove upvote
          await removeUpvote(routineId, currentUserId);
          updatedRoutine.upvotes = (updatedRoutine.upvotes ?? []).filter(id => id !== currentUserId);
          toast.success("Upvote removed");
        } else {
          // Add upvote and remove downvote if exists
          await upvoteRoutine(routineId, currentUserId);
          updatedRoutine.upvotes = [...(updatedRoutine.upvotes ?? []), currentUserId];
          if (hasDownvoted) {
            updatedRoutine.downvotes = (updatedRoutine.downvotes ?? []).filter(id => id !== currentUserId);
          }
          toast.success("Upvoted!");
        }
      } else {
        // downvote
        if (hasDownvoted) {
          // Remove downvote
          await removeDownvote(routineId, currentUserId);
          updatedRoutine.downvotes = (updatedRoutine.downvotes ?? []).filter(id => id !== currentUserId);
          toast.success("Downvote removed");
        } else {
          // Add downvote and remove upvote if exists
          await downvoteRoutine(routineId, currentUserId);
          updatedRoutine.downvotes = [...(updatedRoutine.downvotes ?? []), currentUserId];
          if (hasUpvoted) {
            updatedRoutine.upvotes = (updatedRoutine.upvotes ?? []).filter(id => id !== currentUserId);
          }
          toast.success("Downvoted!");
        }
      }

      // Update the routine in the state
      const updatedRoutines = [...routines];
      updatedRoutines[routineIndex] = updatedRoutine;
      setRoutines(updatedRoutines);
    } catch (error) {
      console.error("Failed to vote:", error);
      toast.error("Failed to vote. Please try again.");
    }
  };

  const publishedDateFormatter = useLocaleDateFormatter(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const posts = useMemo(() =>
    routines.map((routine) => {
      const publishedAtDate = routine.publishedAt ? new Date(routine.publishedAt) : null;
      const publishedAtTs = publishedAtDate ? publishedAtDate.getTime() : 0;
      const user = usersMap[routine.userId];
      return {
        id: routine.id,
        title: routine.name,
        excerpt: routine.description,
        userName: user?.name ?? "Anonymous",
        avatarUrl: user?.avatarUrl ?? "https://i.pravatar.cc/80?img=29",
        skinType: routine.skinType,
        tag: tSkin(routine.skinType) || routine.skinType,
        upvotes: routine.upvotes?.length ?? 0,
        downvotes: routine.downvotes?.length ?? 0,
        hasUpvoted: routine.upvotes?.includes(currentUserId) ?? false,
        hasDownvoted: routine.downvotes?.includes(currentUserId) ?? false,
        comments: routine.comments?.length ?? 0,
        views: routine.views ?? 0,
        publishedAt: publishedAtDate ? publishedDateFormatter.format(publishedAtDate) : "-",
        publishedAtTs,
      };
    }),
    [routines, currentUserId, publishedDateFormatter, usersMap]
  );

  const postsBySkin = useMemo(() => activeSkinFilter === "all" ? posts : posts.filter(p => p.skinType === activeSkinFilter), [activeSkinFilter, posts]);

  const visiblePosts = useMemo(() => {
    if (activeTab === "newest") return [...postsBySkin].sort((a, b) => b.publishedAtTs - a.publishedAtTs);
    if (activeTab === "mostCommented") return [...postsBySkin].sort((a, b) => b.comments - a.comments);
    if (activeTab === "mostVoted") return [...postsBySkin].sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
    return postsBySkin;
  }, [activeTab, postsBySkin]);

  const skinTypeCounts = useMemo(() => routines.reduce((acc, r) => ({ ...acc, [r.skinType]: (acc[r.skinType] ?? 0) + 1 }), {} as Record<string, number>), [routines]);

  const mostDiscussed = useMemo(() =>
    [...postsBySkin].sort((a, b) => b.comments - a.comments).slice(0, 5).map(p => ({ id: p.id, title: p.title, comments: p.comments, skinTypeTag: toTopicTag(p.tag) })),
    [postsBySkin]
  );

  const TabButtons = () => mobileTabs.map(tab => <Button key={tab} variant={activeTab === tab ? "default" : "outline"} onClick={() => setActiveTab(tab)} size="sm">{t(`tabs.${tab}`)}</Button>);

  const PostsList = ({ size = "lg" }: any) => (
    <AnimatePresence initial={false} mode="wait">
      <motion.div
        key={`${size}-${activeTab}-${activeSkinFilter}`}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.22, ease: "easeInOut" }}
        className="space-y-4"
      >
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="inline-flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <p className="mt-2">Cargando rutinas...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            {error}
          </div>
        ) : visiblePosts.length > 0 ? (
          <>
            {visiblePosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: "easeOut", delay: Math.min(index * 0.025, 0.1) }}
              >
                <RoutineCard post={post} tCommunity={t} tRoutine={tRoutine} size={size} showVoting={isLoggedIn} onVote={handleVote} />
              </motion.div>
            ))}
            {currentPage < totalPages && (
              <div className="text-center pt-4">
                <Button
                  onClick={loadMoreRoutines}
                  disabled={isLoadingMore}
                  variant="outline"
                  size="lg"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cargando...
                    </>
                  ) : (
                    "Cargar más"
                  )}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No hay rutinas para mostrar
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );

  const MostDiscussedList = () => mostDiscussed.map(topic => <Link key={topic.id} href={`/routine/detail/${topic.id}`} className="block rounded-lg px-2 py-1.5 transition hover:bg-muted"><p className="font-bold line-clamp-1">{topic.title}</p><p className="text-xs text-muted-foreground">{t("commentsCount", { count: topic.comments })} • {topic.skinTypeTag}</p></Link>);

  return (
    <main className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">
        {/* Desktop */}
        <div className="hidden gap-6 lg:grid lg:grid-cols-[240px_minmax(0,1fr)_280px]">
          <aside className="sticky top-6 self-start h-fit">
            <SidebarSection title={t("forumTitle")} subtitle={t("forumSubtitle")}>
              <nav className="space-y-2"><FilterButtons active={activeSkinFilter} onChange={setActiveSkinFilter} counts={skinTypeCounts} t={t} tSkin={tSkin} /></nav>
              <Button asChild className="mt-5 w-full"><Link href={createRoutineHref}><Plus size={16} /> {t("createPost")}</Link></Button>
              <Button asChild variant="outline" className="mt-2 w-full"><Link href={createAiRoutineHref}>{t("createWithAi")}</Link></Button>
            </SidebarSection>
          </aside>

          <section className="space-y-4">
            <div className="flex items-end justify-between"><div><h1 className="text-4xl font-extrabold">{t("discussionsTitle")}</h1><p className="text-sm text-muted-foreground">{t("discussionsSubtitle")}</p></div></div>
            <div className="flex gap-2"><TabButtons /></div>
            <div><PostsList size="lg" /></div>
          </section>

          <aside className="sticky top-6 self-start h-fit">
            <SidebarSection title={<div className="flex items-center gap-2"><MessageSquare size={14} /><span>{t("mostDiscussed")}</span></div>}>
              <div className="space-y-3"><MostDiscussedList /></div>
            </SidebarSection>
          </aside>
        </div>

        {/* Mobile */}
        <div className="space-y-4 lg:hidden">
          <SidebarSection title={t("forumTitle")} subtitle={t("forumSubtitle")}>
            <nav className="space-y-2"><FilterButtons active={activeSkinFilter} onChange={setActiveSkinFilter} counts={skinTypeCounts} t={t} tSkin={tSkin} /></nav>
            <Button asChild className="mt-5 w-full"><Link href={createRoutineHref}><Plus size={16} /> {t("createPost")}</Link></Button>
            <Button asChild variant="outline" className="mt-2 w-full"><Link href={createAiRoutineHref}>{t("createWithAi")}</Link></Button>
          </SidebarSection>

          <Card>
            <CardHeader className="pb-4"><CardTitle className="text-2xl">{t("discussionsTitle")}</CardTitle><CardDescription>{t("discussionsSubtitle")}</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2"><TabButtons /></div>
              <div><PostsList size="sm" /></div>
            </CardContent>
          </Card>

          <SidebarSection title={<div className="flex items-center gap-2"><MessageSquare size={14} /><span>{t("mostDiscussed")}</span></div>}>
            <div className="space-y-3"><MostDiscussedList /></div>
          </SidebarSection>

          <Button asChild size="icon" className="fixed right-6 bottom-6 z-50 h-16 w-16 rounded-full shadow-lg"><Link href={createRoutineHref} aria-label={t("createPost")}><Plus size={30} /></Link></Button>
        </div>
      </div>
    </main>
  );
}
