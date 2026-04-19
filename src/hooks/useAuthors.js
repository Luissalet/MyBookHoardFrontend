import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authorsApi } from '../services/authors.api';

/**
 * Returns all authors as a flat array.
 *
 * The service `authorsApi.getAuthors` resolves to the raw API envelope:
 *   { success, data: { authors: [...] }, timestamp }
 *
 * Consumers (AuthorsPage, SagaForm) call `authors.filter(...)` and
 * `authors.map(...)` directly — they expect an array. We normalize at the
 * hook boundary so callers only deal with the friendly shape. If the
 * envelope ever shifts, fix this `select` rather than every consumer.
 *
 * See tasks/lessons.md lesson #7.
 */
export function useAuthors() {
  return useQuery({
    queryKey: ['authors'],
    queryFn: authorsApi.getAuthors,
    select: (envelope) => envelope?.data?.authors ?? [],
  });
}

export function useCreateAuthor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: authorsApi.createAuthor,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['authors'] }),
  });
}

export function useUpdateAuthor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => authorsApi.updateAuthor(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['authors'] }),
  });
}

export function useDeleteAuthor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: authorsApi.deleteAuthor,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['authors'] }),
  });
}
