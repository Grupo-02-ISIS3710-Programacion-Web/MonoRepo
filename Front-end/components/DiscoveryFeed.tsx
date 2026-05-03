'use client';

import { useEffect, useState, useCallback } from 'react';
import { fetchRoutines } from '@/lib/api-client';
import { Routine } from '@/types/routine';
import { useInfiniteScroll } from '@/lib/hooks/use-infinite-scroll';
import { useLocale } from 'next-intl';

interface DiscoveryFeedProps {
  onRoutineClick?: (routine: Routine) => void;
  renderRoutineCard: (routine: Routine) => React.ReactNode;
}

export function DiscoveryFeed({ onRoutineClick, renderRoutineCard }: DiscoveryFeedProps) {
  const locale = useLocale();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMore = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchRoutines(page, locale);
      if (data.routines && data.routines.length > 0) {
        if (page === 1) {
          setRoutines(data.routines);
        } else {
          setRoutines((prev) => [...prev, ...data.routines]);
        }
        setHasMore(page < data.totalPages);
        setPage((prev) => prev + 1);
      } else {
        setHasMore(false);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load routines');
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [page, locale]);

  useEffect(() => {
    if (page === 1) {
      loadMore();
    }
  }, []);

  const observerTarget = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    isLoading,
    threshold: 500,
  });

  return (
    <div className="w-full">
      <div className="space-y-4">
        {routines.map((routine) => (
          <div
            key={routine.id}
            onClick={() => onRoutineClick?.(routine)}
            className="cursor-pointer"
          >
            {renderRoutineCard(routine)}
          </div>
        ))}
      </div>

      {error && (
        <div className="text-center py-4 text-red-500">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin">⏳</div>
          <p className="text-muted-foreground mt-2">Cargando más rutinas...</p>
        </div>
      )}

      {!hasMore && routines.length > 0 && (
        <div className="text-center py-4 text-muted-foreground">
          No hay más rutinas para cargar
        </div>
      )}

      <div ref={observerTarget} className="h-10" />
    </div>
  );
}
