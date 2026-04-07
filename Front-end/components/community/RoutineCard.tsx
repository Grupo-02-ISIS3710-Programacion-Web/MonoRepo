"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ArrowDown, ArrowUp, Eye, MessageSquare } from "lucide-react";
import type { MouseEvent, ReactNode } from "react";
import Link from "next/link";

export type RoutineVoteDirection = "up" | "down";

export type RoutineCardPost = {
  id: string;
  title: string;
  excerpt: string;
  userName: string;
  avatarUrl: string;
  tag: string;
  upvotes: number;
  downvotes: number;
  hasUpvoted: boolean;
  hasDownvoted: boolean;
  comments: number;
  views: number;
  publishedAt: string;
};

type Translator = (...args: any[]) => string;

type RoutineCardProps = {
  post: RoutineCardPost;
  tCommunity: Translator;
  tRoutine?: Translator;
  size?: "lg" | "sm";
  showVoting?: boolean;
  onVote?: (routineId: string, direction: RoutineVoteDirection) => void;
};

const toCompactViews = (value: number) => (value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(value));

const VoteButton = ({
  icon,
  count,
  isActive,
  onClick,
  label,
}: {
  icon: ReactNode;
  count: number;
  isActive: boolean;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  label: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex items-center gap-1 transition ${isActive ? "text-destructive" : "hover:text-destructive"}`}
    aria-label={`${label} ${count}`}
  >
    {icon} {count}
  </button>
);

export default function RoutineCard({
  post,
  onVote,
  tCommunity,
  tRoutine,
  size = "lg",
  showVoting = true,
}: RoutineCardProps) {
  const imgClass = size === "lg" ? "h-12 w-12" : "h-11 w-11";
  const titleClass = size === "lg" ? "text-2xl" : "text-xl";
  const contentClass = size === "lg" ? "pt-3" : "pt-2";
  const canVote = showVoting && typeof onVote === "function" && tRoutine;

  return (
    <Link href={`/routine/detail/${post.id}`} className="block">
      <Card className="transition hover:-translate-y-0.5 hover:shadow-lg">
        <CardContent className={contentClass}>
          <div className="mb-2 flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <img src={post.avatarUrl} alt={post.userName} className={`${imgClass} shrink-0 rounded-full object-cover`} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {post.userName} <span className="font-normal text-muted-foreground">• {post.publishedAt}</span>
                </p>
                <div className="mt-1 inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-semibold">
                  {post.tag}
                </div>
              </div>
            </div>
          </div>
          <h3 className={`${titleClass} font-bold leading-tight`}>{post.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-3 text-sm text-muted-foreground">
            {canVote ? (
              <>
                <VoteButton
                  icon={<ArrowUp size={16} />}
                  count={post.upvotes}
                  isActive={post.hasUpvoted}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onVote(post.id, "up");
                  }}
                  label={tRoutine("upvote")}
                />
                <VoteButton
                  icon={<ArrowDown size={16} />}
                  count={post.downvotes}
                  isActive={post.hasDownvoted}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onVote(post.id, "down");
                  }}
                  label={tRoutine("downvote")}
                />
              </>
            ) : null}

            <span className="inline-flex items-center gap-1">
              <MessageSquare size={16} /> {tCommunity("commentsCount", { count: post.comments })}
            </span>
            <span className="inline-flex items-center gap-1">
              <Eye size={16} /> {tCommunity("viewsCount", { count: toCompactViews(post.views) })}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}