'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
}: PaginationProps) {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const getPaginationNumbers = () => {
    const delta = 2;
    const pages: (number | string)[] = [];
    const range = [];
    let l: number;
    let r: number;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          pages.push(l + 1);
        } else if (i - l !== 1) {
          pages.push('...');
        }
      }
      pages.push(i);
      l = i;
    });

    return pages;
  };

  const paginationNumbers = getPaginationNumbers();

  return (
    <div className="flex items-center justify-center gap-2 flex-wrap">
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrevious}
        disabled={currentPage === 1 || isLoading}
        className="flex items-center gap-1"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Anterior</span>
      </Button>

      <div className="flex items-center gap-1 flex-wrap justify-center">
        {paginationNumbers.map((page, index) => (
          <div key={index}>
            {page === '...' ? (
              <span className="px-2 text-muted-foreground">...</span>
            ) : (
              <Button
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(page as number)}
                disabled={isLoading}
                className="w-9 h-9 p-0"
              >
                {page}
              </Button>
            )}
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={handleNext}
        disabled={currentPage === totalPages || isLoading}
        className="flex items-center gap-1"
      >
        <span className="hidden sm:inline">Siguiente</span>
        <ChevronRight className="w-4 h-4" />
      </Button>

      <span className="text-sm text-muted-foreground ml-2">
        Página {currentPage} de {totalPages}
      </span>
    </div>
  );
}
