export interface SpringPage<T> {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty?: boolean;
  numberOfElements?: number;
}

/**
 * Standardizes raw spring page payload into our clean SpringPage interface
 */
export function mapSpringPage<Raw, Target>(
  rawPage: {
    content?: Raw[];
    number?: number;
    size?: number;
    totalElements?: number;
    totalPages?: number;
    first?: boolean;
    last?: boolean;
    empty?: boolean;
    numberOfElements?: number;
  },
  mapItem: (item: Raw) => Target
): SpringPage<Target> {
  return {
    content: (rawPage.content || []).map(mapItem),
    number: rawPage.number ?? 0,
    size: rawPage.size ?? 0,
    totalElements: rawPage.totalElements ?? 0,
    totalPages: rawPage.totalPages ?? 0,
    first: rawPage.first ?? true,
    last: rawPage.last ?? true,
    empty: rawPage.empty ?? true,
    numberOfElements: rawPage.numberOfElements ?? 0,
  };
}
