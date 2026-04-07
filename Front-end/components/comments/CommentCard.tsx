"use client";

import { getUserById } from "@/lib/api";
import { Comment } from "@/types/Comment";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useFormattedCommentDate } from "@/lib/hooks/use-formatted-comment-date";

type CommentCardProps = Readonly<{
  comment: Comment;
  currentUserId?: string;
  onVote?: (commentId: string, vote: "up" | "down") => void;
  isInteractionDisabled?: boolean;
  translationNamespace?: string;
}>;

export default function CommentCard({
  comment,
  currentUserId = "u1",
  onVote,
  isInteractionDisabled = false,
  translationNamespace = "RoutineDetail"
}: CommentCardProps) {
  const t = useTranslations(translationNamespace);
  const locale = useLocale();
  const user = getUserById(comment.userId);
  const hasUpvoted = comment.upvotes.includes(currentUserId);
  const hasDownvoted = comment.downvotes.includes(currentUserId);
  const formattedDate = useFormattedCommentDate(comment.createdAt, locale);

  return (
    <article className="rounded-xl bg-transparent p-3">
      <div className="mb-2 flex items-center gap-3">
        <img
          src={user?.avatarUrl ?? "https://i.pravatar.cc/80?img=29"}
          alt={user?.name ?? t("userFallback")}
          className="h-9 w-9 rounded-full object-cover"
        />
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-base font-semibold text-[#232839]">{user?.name ?? t("userFallback")}</p>
          <p className="text-sm text-[#687084]">{formattedDate}</p>
        </div>
      </div>
      <div className="pl-12 text-base leading-relaxed text-[#2f3443]">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
            strong: ({ children }) => <strong className="font-semibold text-[#1f2434]">{children}</strong>,
            em: ({ children }) => <em className="italic">{children}</em>
          }}
        >
          {comment.comment}
        </ReactMarkdown>
      </div>
      <div className="mt-3 flex items-center gap-4 pl-12 text-[#5d667d]">
        <button
          className={`inline-flex items-center gap-1 text-sm font-semibold transition ${hasUpvoted ? "text-primary" : "hover:text-primary"
            }`}
          aria-label={t("upvote")}
          type="button"
          disabled={isInteractionDisabled}
          onClick={() => onVote?.(comment.id, "up")}
        >
          <ArrowUp size={16} />
          {comment.upvotes.length}
        </button>
        <button
          className={`inline-flex items-center gap-1 text-sm transition ${hasDownvoted ? "text-primary" : "hover:text-primary"
            }`}
          aria-label={t("downvote")}
          type="button"
          disabled={isInteractionDisabled}
          onClick={() => onVote?.(comment.id, "down")}
        >
          <ArrowDown size={16} />
          {comment.downvotes.length}
        </button>
        <button className="text-sm font-semibold hover:text-primary" disabled={isInteractionDisabled}>{t("reply")}</button>
      </div>
    </article>
  );
}
