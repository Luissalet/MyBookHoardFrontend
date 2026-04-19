import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { booksApi } from '../services/books.api';

/**
 * Paginated books list.
 *
 * `booksApi.getBooks` resolves to the raw envelope
 * `{ success, data: { books, pagination }, timestamp }`.
 * `select` unwraps to `{ books, pagination }` so consumers can read
 * `data.books` and `data.pagination.total` directly.
 */
export function useBooks(params = {}) {
  return useQuery({
    queryKey: ['books', params],
    queryFn: () => booksApi.getBooks(params),
    select: (envelope) => ({
      books: envelope?.data?.books ?? [],
      pagination: envelope?.data?.pagination ?? null,
    }),
  });
}

export function useBook(id) {
  return useQuery({
    queryKey: ['book', id],
    queryFn: () => booksApi.getBook(id),
    enabled: !!id,
  });
}

export function useSearchBooks(query) {
  return useQuery({
    queryKey: ['books', 'search', query],
    queryFn: () => booksApi.searchBooks(query),
    enabled: query?.length >= 2,
  });
}

export function useCreateBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: booksApi.createBook,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['books'] }),
  });
}

export function useUpdateBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => booksApi.updateBook(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['books'] });
      qc.invalidateQueries({ queryKey: ['book', id] });
    },
  });
}

export function useDeleteBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: booksApi.deleteBook,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['books'] }),
  });
}
