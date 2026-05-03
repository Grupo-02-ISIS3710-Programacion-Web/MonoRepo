'use client';

import { useState, useCallback } from 'react';
import {
  upvoteRoutine,
  downvoteRoutine,
  incrementRoutineView,
  getRoutineVoteCounts,
} from '@/lib/api-client';

interface VoteCounts {
  upvotes: number;
  downvotes: number;
  views: number;
}

interface UseRoutineInteractionOptions {
  routineId: string;
  userId?: string;
  initialVotes?: VoteCounts;
}

export function useRoutineInteraction({
  routineId,
  userId,
  initialVotes = { upvotes: 0, downvotes: 0, views: 0 },
}: UseRoutineInteractionOptions) {
  const [votes, setVotes] = useState<VoteCounts>(initialVotes);
  const [userVote, setUserVote] = useState<'upvote' | 'downvote' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpvote = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const updated = await upvoteRoutine(routineId, userId);
      const counts = await getRoutineVoteCounts(routineId);
      setVotes(counts);

      if (userVote === 'upvote') {
        setUserVote(null);
      } else {
        setUserVote('upvote');
      }
    } catch (error) {
      console.error('Failed to upvote:', error);
    } finally {
      setIsLoading(false);
    }
  }, [routineId, userId, userVote]);

  const handleDownvote = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const updated = await downvoteRoutine(routineId, userId);
      const counts = await getRoutineVoteCounts(routineId);
      setVotes(counts);

      if (userVote === 'downvote') {
        setUserVote(null);
      } else {
        setUserVote('downvote');
      }
    } catch (error) {
      console.error('Failed to downvote:', error);
    } finally {
      setIsLoading(false);
    }
  }, [routineId, userId, userVote]);

  const trackView = useCallback(async () => {
    try {
      await incrementRoutineView(routineId);
      const counts = await getRoutineVoteCounts(routineId);
      setVotes(counts);
    } catch (error) {
      console.error('Failed to track view:', error);
    }
  }, [routineId]);

  return {
    votes,
    userVote,
    isLoading,
    handleUpvote,
    handleDownvote,
    trackView,
  };
}
