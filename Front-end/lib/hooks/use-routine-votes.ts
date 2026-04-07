"use client";

import { useState } from "react";

type VoteType = "up" | "down";

type VoteState = {
    upvotes: string[];
    downvotes: string[];
};

type VotableRoutine = {
    id: string;
    upvotes?: string[];
    downvotes?: string[];
};

const toggleVote = (state: VoteState, currentUserId: string, vote: VoteType): VoteState => {
    const hasUp = state.upvotes.includes(currentUserId);
    const hasDown = state.downvotes.includes(currentUserId);

    if (vote === "up") {
        return {
            upvotes: hasUp
                ? state.upvotes.filter((id) => id !== currentUserId)
                : [...state.upvotes, currentUserId],
            downvotes: hasDown
                ? state.downvotes.filter((id) => id !== currentUserId)
                : state.downvotes,
        };
    }

    return {
        downvotes: hasDown
            ? state.downvotes.filter((id) => id !== currentUserId)
            : [...state.downvotes, currentUserId],
        upvotes: hasUp
            ? state.upvotes.filter((id) => id !== currentUserId)
            : state.upvotes,
    };
};

export function useRoutineVotesMap(routines: VotableRoutine[], currentUserId: string) {
    const [routineVotes, setRoutineVotes] = useState<Record<string, VoteState>>(() =>
        routines.reduce((acc, routine) => {
            acc[routine.id] = {
                upvotes: routine.upvotes ?? [],
                downvotes: routine.downvotes ?? [],
            };
            return acc;
        }, {} as Record<string, VoteState>)
    );

    const voteRoutine = (routineId: string, vote: VoteType) => {
        setRoutineVotes((prev) => {
            const current = prev[routineId] ?? { upvotes: [], downvotes: [] };

            return {
                ...prev,
                [routineId]: toggleVote(current, currentUserId, vote),
            };
        });
    };

    return {
        routineVotes,
        voteRoutine,
    };
}

export function useRoutineVote(
    initialUpvotes: string[],
    initialDownvotes: string[],
    currentUserId: string
) {
    const [routineUpvotes, setRoutineUpvotes] = useState<string[]>(initialUpvotes);
    const [routineDownvotes, setRoutineDownvotes] = useState<string[]>(initialDownvotes);

    const handleRoutineVote = (vote: VoteType) => {
        const next = toggleVote(
            {
                upvotes: routineUpvotes,
                downvotes: routineDownvotes,
            },
            currentUserId,
            vote
        );

        setRoutineUpvotes(next.upvotes);
        setRoutineDownvotes(next.downvotes);
    };

    return {
        routineUpvotes,
        routineDownvotes,
        hasUpvotedRoutine: routineUpvotes.includes(currentUserId),
        hasDownvotedRoutine: routineDownvotes.includes(currentUserId),
        handleRoutineVote,
    };
}
