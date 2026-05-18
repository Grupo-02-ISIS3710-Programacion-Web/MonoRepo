"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Comment } from "@/types/Comment";
import { Bold, Image as ImageIcon, Italic, Link2, MessageSquare } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import CommentCard from "@/components/comments/CommentCard";
import { useCommentsState } from "@/lib/hooks/use-comments-state";

type CommentSectionProps = Readonly<{
  targetId: string;
  targetType?: "routine" | "product";
  initialComments: Comment[];
  currentUserId?: string;
  isLoggedIn?: boolean;
  loginHref?: string;
  translationNamespace?: string;
}>;

export default function CommentSection({
  targetId,
  targetType = "routine",
  initialComments,
  currentUserId = "u1",
  isLoggedIn = true,
  loginHref = "/login",
  translationNamespace = "RoutineDetail"
}: CommentSectionProps) {
  const t = useTranslations(translationNamespace);
  const {
    newComment,
    setNewComment,
    localComments,
    textareaRef,
    applyInlineFormat,
    addComment,
    voteComment,
  } = useCommentsState({
    targetId,
    targetType,
    initialComments,
    currentUserId,
    onCommentPosted: () => toast.success(t("commentPosted")),
  });

  return (
    <Card className="border-secondary bg-secondary/10">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-foreground">
          {t("commentsTitle")} ({localComments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-xl border border-border bg-card">
          <p className="px-4 pt-4 text-lg font-semibold text-foreground">{t("thoughtsTitle")}</p>
          <Textarea
            ref={textareaRef}
            value={newComment}
            onChange={(event) => setNewComment(event.target.value)}
            rows={4}
            placeholder={t("commentPlaceholder")}
            className="mt-3 rounded-none border-0 border-t border-border bg-background px-4 py-4 text-base shadow-none focus-visible:ring-0"
            disabled={!isLoggedIn}
          />
          <div className="flex items-center justify-between rounded-b-xl border-t border-border bg-muted px-4 py-3">
            <div className="flex items-center gap-3 text-muted-foreground">
              <button
                className="rounded-md p-1.5 hover:bg-accent"
                aria-label={t("bold")}
                onClick={() => applyInlineFormat("**")}
                type="button"
                disabled={!isLoggedIn}
              >
                <Bold size={16} />
              </button>
              <button
                className="rounded-md p-1.5 hover:bg-accent"
                aria-label={t("italic")}
                onClick={() => applyInlineFormat("*")}
                type="button"
                disabled={!isLoggedIn}
              >
                <Italic size={16} />
              </button>
              <button className="rounded-md p-1.5 hover:bg-accent" aria-label={t("insertLink")} type="button" disabled={!isLoggedIn}>
                <Link2 size={16} />
              </button>
              <button className="rounded-md p-1.5 hover:bg-accent" aria-label={t("insertImage")} type="button" disabled={!isLoggedIn}>
                <ImageIcon size={16} />
              </button>
            </div>
            <Button onClick={addComment} className="h-9 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-secondary hover:text-secondary-foreground" disabled={!isLoggedIn}>
              <MessageSquare size={16} />
              {t("postComment")}
            </Button>
          </div>

          {!isLoggedIn && (
            <p className="px-4 py-3 text-sm text-muted-foreground">
              {t("loginRequiredForComments")} <a href={loginHref} className="font-semibold text-primary hover:underline">{t("goToLogin")}</a>
            </p>
          )}
        </div>

        <div className="space-y-1">
          {localComments.length === 0 && (
            <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
              {t("noComments")}
            </p>
          )}

          {localComments.map((comment) => (
            <div key={comment.id}>
              <CommentCard
                comment={comment}
                currentUserId={currentUserId}
                onVote={voteComment}
                isInteractionDisabled={!isLoggedIn}
                translationNamespace={translationNamespace}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
