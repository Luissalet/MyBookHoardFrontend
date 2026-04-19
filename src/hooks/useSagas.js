import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sagasApi } from '../services/sagas.api';

/**
 * Returns all sagas as a flat array.
 *
 * `sagasApi.getSagas` resolves to the raw envelope:
 *   { success, data: { sagas: [...] }, timestamp }
 *
 * Consumer (SagasPage) reads `sagas.length` and `sagas.map(...)` directly.
 * Normalize at the hook boundary — see lessons #6/#7.
 */
export function useSagas() {
  return useQuery({
    queryKey: ['sagas'],
    queryFn: sagasApi.getSagas,
    select: (envelope) => envelope?.data?.sagas ?? [],
  });
}

/**
 * Returns a single saga or null.
 *
 * `sagasApi.getSaga` resolves to:
 *   { success, data: { ...saga fields }, timestamp }
 */
export function useSaga(id) {
  return useQuery({
    queryKey: ['saga', id],
    queryFn: () => sagasApi.getSaga(id),
    enabled: !!id,
    select: (envelope) => envelope?.data ?? null,
  });
}

/**
 * Returns the books in a saga as a flat array.
 *
 * `sagasApi.getSagaBooks` resolves to:
 *   { success, data: { books: [...] }, timestamp }
 *
 * Consumer (SagasPage) reads `sagaBooks.length` and `sagaBooks.map(...)`.
 */
export function useSagaBooks(sagaId) {
  return useQuery({
    queryKey: ['saga', sagaId, 'books'],
    queryFn: () => sagasApi.getSagaBooks(sagaId),
    enabled: !!sagaId,
    select: (envelope) => envelope?.data?.books ?? [],
  });
}

export function useCreateSaga() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: sagasApi.createSaga,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sagas'] }),
  });
}

export function useUpdateSaga() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => sagasApi.updateSaga(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sagas'] });
      qc.invalidateQueries({ queryKey: ['saga'] });
    },
  });
}

export function useDeleteSaga() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: sagasApi.deleteSaga,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sagas'] }),
  });
}
