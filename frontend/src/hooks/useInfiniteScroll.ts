import { useEffect, useRef, useCallback } from "react";

/**
 * Custom hook for infinite scrolling using IntersectionObserver.
 * Returns a callback ref to attach to a sentinel element at the bottom of the list.
 *
 * @param page      - Current page number
 * @param hasMore   - Whether there are more pages to load
 * @param isLoading - Whether a load is currently in progress
 * @param fetchMore - Function to call to load the next page: `(nextPage, append) => void`
 */
export default function useInfiniteScroll(
  page: number,
  hasMore: boolean,
  isLoading: boolean,
  fetchMore: (pageNum: number, append: boolean) => void,
) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const pageRef = useRef(page);
  const isLoadingRef = useRef(isLoading);
  const hasMoreRef = useRef(hasMore);

  useEffect(() => { pageRef.current = page; }, [page]);
  useEffect(() => { isLoadingRef.current = isLoading; }, [isLoading]);
  useEffect(() => { hasMoreRef.current = hasMore; }, [hasMore]);

  // Create the observer (re-created only if fetchMore identity changes)
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMoreRef.current &&
          !isLoadingRef.current
        ) {
          fetchMore(pageRef.current + 1, true);
        }
      },
      { threshold: 0 },
    );
    return () => {
      observerRef.current?.disconnect();
    };
  }, [fetchMore]);

  // Callback ref – attach to the sentinel <div>
  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) observerRef.current.disconnect();
    if (node) observerRef.current?.observe(node);
  }, []);

  return sentinelRef;
}
