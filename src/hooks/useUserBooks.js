import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userBooksApi } from '../services/userBooks.api';

export function useUserBooksWithDetails(userId) {
  return useQuery({
    queryKey: ['userBooks', userId],
    queryFn: () => userBooksApi.getUserBooksWithDetails(userId),
    enabled: !!userId,
  });
}

export function useAddToCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: userBooksApi.addToCollection,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['userBooks'] }),
  });
}

export function useUpdateUserBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => userBooksApi.updateUserBook(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['userBooks'] }),
  });
}

export function useRemoveFromCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: userBooksApi.removeFromCollection,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['userBooks'] }),
  });
}
