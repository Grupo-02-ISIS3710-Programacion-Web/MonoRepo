"use client";

import { Comment } from "@/types/Comment";
import { useRef, useState } from "react";

type UseCommentsStateParams = Readonly<{
    targetId: string;
    targetType: "routine" | "product";
    initialComments: Comment[];
    currentUserId: string;
    onCommentPosted?: () => void;
}>;

export function useCommentsState({
    targetId,
    targetType,
    initialComments,
    currentUserId,
    onCommentPosted,
}: UseCommentsStateParams) {
    const [newComment, setNewComment] = useState("");
    const [localComments, setLocalComments] = useState(initialComments);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const applyInlineFormat = (wrapper: string) => {
        const textarea = textareaRef.current;
        if (!textarea) {
            return;
        }

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selected = newComment.slice(start, end);
        const replacement = `${wrapper}${selected}${wrapper}`;
        const updated = `${newComment.slice(0, start)}${replacement}${newComment.slice(end)}`;

        setNewComment(updated);

        requestAnimationFrame(() => {
            textarea.focus();
            const cursorStart = start + wrapper.length;
            const cursorEnd = cursorStart + selected.length;
            textarea.setSelectionRange(cursorStart, cursorEnd);
        });
    };

    const addComment = () => {
        if (!newComment.trim()) {
            return;
        }

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
    };

    const voteComment = (commentId: string, vote: "up" | "down") => {
        setLocalComments((prev) =>
            prev.map((comment) => {
                if (comment.id !== commentId) {
                    return comment;
                }

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
