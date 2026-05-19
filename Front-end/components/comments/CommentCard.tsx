"use client";

import { Comment } from "@/types/Comment";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useFormattedCommentDate } from "@/lib/hooks/use-formatted-comment-date";

type CommentCardProps = Readonly<{
  comment: Comment;
  currentUserId?: string;
  onVote?: (
    commentId: string,
    vote: "up" | "down"
  ) => void;
  isInteractionDisabled?: boolean;
  translationNamespace?: string;
}>;

export default function CommentCard({
  comment,
  currentUserId = "u1",
  onVote,
  isInteractionDisabled = false,
  translationNamespace = "RoutineDetail",
}: CommentCardProps) {

  const t =
    useTranslations(
      translationNamespace
    );

  const locale = useLocale();

  const user =
    typeof comment.userId === "object" &&
    comment.userId !== null

      ? {
          name: comment.userId.nombre,
          avatarUrl:
            comment.userId.avatarUrl,
        }

      : {
          name: null,
          avatarUrl: null,
        };

  const hasUpvoted =
    comment.upvotes.includes(
      currentUserId
    );

  const hasDownvoted =
    comment.downvotes.includes(
      currentUserId
    );

  const formattedDate =
    useFormattedCommentDate(
      comment.createdAt,
      locale
    );

  const commentId =
    comment.id || comment._id;

  if (!commentId) {
    return null;
  }

  return (

    <article className="rounded-xl bg-transparent p-3">

      <div className="mb-2 flex items-center gap-3">

        <img
          src={
            user?.avatarUrl ??
            "https://i.pravatar.cc/80?img=29"
          }
          alt={
            user?.name ??
            t("userFallback")
          }
          className="h-9 w-9 rounded-full object-cover"
        />

        <div className="flex flex-wrap items-center gap-2">

          <p className="text-base font-semibold text-foreground">
            {user?.name ??
              t("userFallback")}
          </p>

          <p className="text-sm text-muted-foreground">
            {formattedDate}
          </p>

        </div>

      </div>

      <div className="pl-12 text-base leading-relaxed text-foreground">

        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ children }) => (
              <p className="mb-2 last:mb-0">
                {children}
              </p>
            ),

            strong: ({ children }) => (
              <strong className="font-semibold text-foreground">
                {children}
              </strong>
            ),

            em: ({ children }) => (
              <em className="italic">
                {children}
              </em>
            ),
          }}
        >
          {comment.comment}
        </ReactMarkdown>

      </div>

      <div className="mt-3 flex items-center gap-4 pl-12 text-muted-foreground">

        <button
          className={`inline-flex items-center gap-1 text-sm font-semibold transition ${
            hasUpvoted
              ? "text-primary"
              : "hover:text-primary"
          }`}
          aria-label={t("upvote")}
          type="button"
          disabled={isInteractionDisabled}
          onClick={() =>
            onVote?.(
              commentId,
              "up"
            )
          }
        >

          <ArrowUp size={16} />

          {comment.upvotes.length}

        </button>

        <button
          className={`inline-flex items-center gap-1 text-sm transition ${
            hasDownvoted
              ? "text-primary"
              : "hover:text-primary"
          }`}
          aria-label={t("downvote")}
          type="button"
          disabled={isInteractionDisabled}
          onClick={() =>
            onVote?.(
              commentId,
              "down"
            )
          }
        >

          <ArrowDown size={16} />

          {comment.downvotes.length}

        </button>

      </div>

    </article>
  );
}