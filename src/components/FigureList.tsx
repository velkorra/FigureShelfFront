"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import styles from "@/app/page.module.scss";
import { FigureCard } from "./FigureCard/FigureCard";
import { getFiguresAction } from "@/app/actions";
import { FigureCardData } from "@/types/figures";

interface FigureListProps {
  initialFigures: FigureCardData[];
  initialHasMore: boolean;
}

export default function FigureList({
  initialFigures,
  initialHasMore,
}: FigureListProps) {
  const [figures, setFigures] = useState<FigureCardData[]>(initialFigures);
  const [page, setPage] = useState(2);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [showSealed, setShowSealed] = useState(false);
  const loadMoreFigures = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);

    const result = await getFiguresAction(page);

    if (result.success) {
      const { figures: newFigures, pagination } = result.data;
      if (newFigures.length > 0) {
        setPage((prevPage) => prevPage + 1);
        setFigures((prevFigures) => [...prevFigures, ...newFigures]);
      }
      setHasMore(pagination.hasMore);
    } else {
      console.error(result.error);
    }

    setIsLoading(false);
  }, [page, isLoading, hasMore]);
  const filteredFigures = useMemo(() => {
    if (showSealed) {
      return figures;
    }
    return figures.filter((figure) => !figure.isSealed);
  }, [figures, showSealed]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreFigures();
        }
      },
      { rootMargin: "200px" }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [loadMoreFigures]);

  return (
    <>
      <div className={styles.filterControls}>
        <label>
          <input
            type="checkbox"
            checked={showSealed}
            onChange={(e) => setShowSealed(e.target.checked)}
          />
          Показать запечатанные
        </label>
      </div>
      <div className={styles.grid}>
        {filteredFigures.map((figure) => (
          <FigureCard key={figure.id} figure={figure} />
        ))}
      </div>

      <div ref={loadMoreRef} style={{ height: "50px" }}>
        {isLoading && <p style={{ textAlign: "center" }}>Загрузка...</p>}
      </div>
    </>
  );
}
