"use client";

import { Comment } from "@/types/Comment";
import { useEffect, useRef, useState } from "react";
import { fetchProductComments, createProductComment, upvoteProductComment } from "@/lib/api-client";

type UseCommentsStateParams = Readonly<{
  targetId: string;
  targetType: "routine" | "product";
  initialComments: Comment[];
  currentUserId: string;
  currentUserName?: string;
  currentUserAvatar?: string;
  onCommentPosted?: () => void;
}>;

export function useCommentsState({
  targetId,
  targetType,
  initialComments,
  currentUserId,
  currentUserName = "",
  currentUserAvatar = "",
  onCommentPosted,
}: UseCommentsStateParams) {
  const [newComment, setNewComment] = useState("");
  const [localComments, setLocalComments] = useState<Comment[]>(initialComments);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Cargar comentarios del backend al montar
  useEffect(() => {
    if (targetType === "product") {
      fetchProductComments(targetId)
        .then((comments: unknown) => {
            const list = comments as any[];
            setLocalComments(list.map((c) => ({
              id: c._id || c.id,
              userId: c.userId, 
              comment: c.comment,
              upvotes: c.upvotes || [],
              downvotes: c.downvotes || [],
              createdAt: c.createdAt,
            })));
            })
        .catch(() => setLocalComments([]));
    }
  }, [targetId, targetType]);

  const applyInlineFormat = (wrapper: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = newComment.slice(start, end);
    const replacement = `${wrapper}${selected}${wrapper}`;
    const updated = `${newComment.slice(0, start)}${replacement}${newComment.slice(end)}`;
    setNewComment(updated);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + wrapper.length, start + wrapper.length + selected.length);
    });
  };

  const addComment = async () => {
    if (!newComment.trim()) return;

    if (targetType === "product") {

      console.log('userId que se manda:', currentUserId);
      try {
        const created: any = await createProductComment(targetId, currentUserId, newComment.trim());
        setLocalComments((prev) => [{
          id: created._id || created.id,
          userId: {
            _id: currentUserId,
            nombre: currentUserName,   
            avatarUrl: currentUserAvatar, 
          },
          comment: created.comment,
          upvotes: created.upvotes || [],
          downvotes: created.downvotes || [],
          createdAt: created.createdAt,
        }, ...prev]);
        setNewComment("");
        onCommentPosted?.();
      } catch {
        // manejar error si quieres
      }
    } else {
      // rutinas — comportamiento original
      const createdComment: Comment = {
        id: `${targetType}-${targetId}-local-${Date.now()}`,
        userId: currentUserId,
        comment: newComment.trim(),
        upvotes: [],
        downvotes: [],
      };
      setLocalComments((prev) => [createdComment, ...prev]);
      setNewComment("");
      onCommentPosted?.();
    }
  };

  const voteComment = async (commentId: string, vote: "up" | "down") => {
    if (targetType === "product") {
      try {
        await upvoteProductComment(commentId, currentUserId);
      } catch {}
    }

    // Actualizar estado local optimistamente
    setLocalComments((prev) =>
      prev.map((comment) => {
        if (comment.id !== commentId) return comment;
        const hasUpvoted = comment.upvotes.includes(currentUserId);
        const hasDownvoted = comment.downvotes.includes(currentUserId);
        if (vote === "up") {
          return {
            ...comment,
            upvotes: hasUpvoted
              ? comment.upvotes.filter((id) => id !== currentUserId)
              : [...comment.upvotes, currentUserId],
            downvotes: hasDownvoted
              ? comment.downvotes.filter((id) => id !== currentUserId)
              : comment.downvotes,
          };
        }
        return {
          ...comment,
          downvotes: hasDownvoted
            ? comment.downvotes.filter((id) => id !== currentUserId)
            : [...comment.downvotes, currentUserId],
          upvotes: hasUpvoted
            ? comment.upvotes.filter((id) => id !== currentUserId)
            : comment.upvotes,
        };
      })
    );
  };

  return {
    newComment,
    setNewComment,
    localComments,
    textareaRef,
    applyInlineFormat,
    addComment,
    voteComment,
  };
}