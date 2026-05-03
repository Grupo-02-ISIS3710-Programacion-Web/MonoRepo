'use client';

import { useEffect, useState, useCallback } from 'react';
import { fetchRoutinesByUserId } from '@/lib/api-client';
import { Routine } from '@/types/routine';
import { Pagination } from '@/components/Pagination';
import { useLocale } from 'next-intl';

interface UserRoutinesProps {
  userId: string;
  renderRoutineCard: (routine: Routine) => React.ReactNode;
}

export function UserRoutines({ userId, renderRoutineCard }: UserRoutinesProps) {
  const locale = useLocale();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRoutines = useCallback(async (pageNum: number) => {
    setIsLoading(true);
    try {
      const data = await fetchRoutinesByUserId(userId, pageNum, locale);
      setRoutines(data.routines || []);
      setTotalPages(data.totalPages || 1);
      setPage(pageNum);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load routines');
    } finally {
      setIsLoading(false);
    }
  }, [userId, locale]);

  useEffect(() => {
    loadRoutines(1);
  }, [userId]);

  const handlePageChange = (newPage: number) => {
    loadRoutines(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full">
      {/* Pagination at Top Right (Mobile: adjusted layout, Desktop: top right) */}
      <div className="flex flex-col sm:flex-row sm:justify-end sm:items-center gap-4 mb-6">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          isLoading={isLoading}
        />
      </div>

      {error && (
        <div className="text-center py-4 text-red-500">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin">⏳</div>
          <p className="text-muted-foreground mt-2">Cargando rutinas...</p>
        </div>
      ) : routines.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {routines.map((routine) => (
            <div key={routine.id}>
              {renderRoutineCard(routine)}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No hay rutinas para mostrar
        </div>
      )}

      {/* Pagination at Bottom Right on Desktop */}
      {totalPages > 1 && (
        <div className="flex justify-end mt-6">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
}
