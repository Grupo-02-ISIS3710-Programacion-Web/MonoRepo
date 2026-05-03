"use client";

import { useState, useCallback } from "react";
import { upvoteRoutine, downvoteRoutine, removeUpvote, removeDownvote } from "@/lib/api-client";
import { toast } from "sonner";

type VoteType = "up" | "down";

export function useRoutineApiVotes(routineId: string, currentUserId: string) {
    const [upvotes, setUpvotes] = useState<string[]>([]);
    const [downvotes, setDownvotes] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleVote = useCallback(
        async (direction: VoteType) => {
            if (!currentUserId) {
                toast.error("You must be logged in to vote");
                return;
            }

            setIsLoading(true);
            try {
                const hasUpvoted = upvotes.includes(currentUserId);
                const hasDownvoted = downvotes.includes(currentUserId);

                if (direction === "up") {
                    if (hasUpvoted) {
                        // Remove upvote
                        await removeUpvote(routineId, currentUserId);
                        setUpvotes(upvotes.filter(id => id !== currentUserId));
                        toast.success("Upvote removed");
                    } else {
                        // Add upvote and remove downvote if exists
                        await upvoteRoutine(routineId, currentUserId);
                        setUpvotes([...upvotes, currentUserId]);
                        if (hasDownvoted) {
                            setDownvotes(downvotes.filter(id => id !== currentUserId));
                        }
                        toast.success("Upvoted!");
                    }
                } else {
                    // downvote
                    if (hasDownvoted) {
                        // Remove downvote
                        await removeDownvote(routineId, currentUserId);
                        setDownvotes(downvotes.filter(id => id !== currentUserId));
                        toast.success("Downvote removed");
                    } else {
                        // Add downvote and remove upvote if exists
                        await downvoteRoutine(routineId, currentUserId);
                        setDownvotes([...downvotes, currentUserId]);
                        if (hasUpvoted) {
                            setUpvotes(upvotes.filter(id => id !== currentUserId));
                        }
                        toast.success("Downvoted!");
                    }
                }
            } catch (error) {
                console.error("Failed to vote:", error);
                toast.error("Failed to vote. Please try again.");
            } finally {
                setIsLoading(false);
            }
        },
        [routineId, currentUserId, upvotes, downvotes]
    );

    return {
        upvotes,
        downvotes,
        setUpvotes,
        setDownvotes,
        handleVote,
        isLoading,
        hasUpvoted: upvotes.includes(currentUserId),
        hasDownvoted: downvotes.includes(currentUserId),
    };
}
