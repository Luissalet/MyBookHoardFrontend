import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sagasApi } from '../services/sagas.api';

export function useSagas() {
  return useQuery({ queryKey: ['sagas'], queryFn: sagasApi.getSagas });
}

export function useSaga(id) {
  return useQuery({
    queryKey: ['saga', id],
    queryFn: () => sagasApi.getSaga(id),
    enabled: !!id,
  });
}

export function useSagaBooks(sagaId) {
  return useQuery({
    queryKey: ['saga', sagaId, 'books'],
    queryFn: () => sagasApi.getSagaBooks(sagaId),
    enabled: !!sagaId,
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
