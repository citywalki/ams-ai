import type { QueryParams, PageResponse } from '@/types/table';

type PageableData<T> = {
  content?: T[];
  items?: T[];
  totalElements?: number;
  totalCount?: number;
};

export function toPageResponse<T>(
  data: T[] | PageableData<T>,
  params: QueryParams,
  totalCountHeader?: string | number,
): PageResponse<T> {
  const list = Array.isArray(data) ? data : (data.content ?? data.items ?? []);
  let totalElements = Number(totalCountHeader);
  if (Number.isNaN(totalElements)) {
    totalElements = Number(
      Array.isArray(data)
        ? list.length
        : (data.totalElements ?? data.totalCount ?? list.length),
    );
  }

  const size = params.size || 20;
  return {
    content: list,
    totalElements,
    totalPages: Math.ceil(totalElements / size),
    size,
    number: params.page || 0,
  };
}
