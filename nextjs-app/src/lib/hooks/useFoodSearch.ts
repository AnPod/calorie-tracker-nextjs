import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export function useFoodSearch(query: string) {
  const debouncedQuery = useDebounce(query, 500);

  return useQuery({
    queryKey: ['foodSearch', debouncedQuery],
    queryFn: async ({ signal }) => {
      if (!debouncedQuery) return [];

      const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
        debouncedQuery
      )}&json=1&page_size=10`;

      const res = await fetch(url, { signal });
      
      if (res.status === 429) {
        throw new Error('RATE_LIMIT');
      }
      
      if (!res.ok) {
        throw new Error('API_ERROR');
      }

      const data = await res.json();
      
      // Parse products like the old legacy app did
      return (data.products || []).map((p: any) => ({
        id: p.id || p.code,
        name: p.product_name || p.product_name_en || 'Unknown Food',
        brand: p.brands ? p.brands.split(',')[0] : '',
        caloriesPer100g: Math.round(p.nutriments?.['energy-kcal_100g'] || 0),
        proteinPer100g: Math.round((p.nutriments?.proteins_100g || 0) * 10) / 10,
        carbsPer100g: Math.round((p.nutriments?.carbohydrates_100g || 0) * 10) / 10,
        fatPer100g: Math.round((p.nutriments?.fat_100g || 0) * 10) / 10,
        image: p.image_front_thumb_url || null,
        isCustom: false,
      }));
    },
    // 24-hour cache specifically for search terms to prevent rate limiting
    staleTime: 1000 * 60 * 60 * 24, 
    enabled: debouncedQuery.length > 1,
    retry: false, // Don't retry 429s immediately
  });
}
