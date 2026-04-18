import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authorsApi } from '../services/authors.api';

export function useAuthors() {
  return useQuery({ queryKey: ['authors'], queryFn: authorsApi.getAuthors });
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
