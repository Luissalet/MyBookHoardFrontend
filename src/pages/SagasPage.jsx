import React, { useMemo, useState } from 'react';
import { Plus, Edit, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { SagaForm } from '../components/sagas/SagaForm';
import { useSagas, useDeleteSaga, useSagaBooks } from '../hooks/useSagas';
import { useUserBooksWithDetails } from '../hooks/useUserBooks';
import { useAuth } from '../hooks/useAuth';

export function SagasPage() {
  const { user } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSaga, setEditingSaga] = useState(null);
  const [expandedSagaId, setExpandedSagaId] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingSagaId, setDeletingSagaId] = useState(null);

  const { data: sagas, isLoading } = useSagas();
  const deleteSagaMutation = useDeleteSaga();
  const { data: sagaBooks } = useSagaBooks(expandedSagaId);

  // The user's collection — used to compute "read/total" per saga.
  // The total comes from the saga aggregate the API already returns
  // (`actual_books_count` from the LEFT JOIN COUNT). The read count
  // is per-user, derived by matching `book.saga_id === saga.id` against
  // user_books with `reading_status === 'read'` — that is the DB enum
  // value for a finished book; earlier code used `'completed'` and
  // silently produced 0.
  const { data: userBooks = [] } = useUserBooksWithDetails(user?.id);

  // Pre-bucket per-saga read counts once per render so we don't filter
  // the entire user-books array per saga.
  const readBySagaId = useMemo(() => {
    const counts = new Map();
    for (const ub of userBooks) {
      if (ub.reading_status !== 'read') continue;
      const sagaId = ub.book?.saga_id;
      if (!sagaId) continue;
      counts.set(sagaId, (counts.get(sagaId) ?? 0) + 1);
    }
    return counts;
  }, [userBooks]);

  const handleNewSaga = () => {
    setEditingSaga(null);
    setIsFormOpen(true);
  };

  const handleEditSaga = (saga) => {
    setEditingSaga(saga);
    setIsFormOpen(true);
  };

  const handleCloseSagaForm = () => {
    setIsFormOpen(false);
    setEditingSaga(null);
  };

  const handleDeleteSaga = (sagaId) => {
    setDeletingSagaId(sagaId);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingSagaId) {
      deleteSagaMutation.mutate(deletingSagaId);
    }
  };

  const handleToggleExpand = (sagaId) => {
    setExpandedSagaId(expandedSagaId === sagaId ? null : sagaId);
  };

  const getSagaCompletionStatus = (saga) => {
    // Total comes from the API aggregate. Prefer the live COUNT
    // (`actual_books_count`) over the editable `total_books` hint so the
    // UI matches reality even if the stored target drifts.
    const total =
      Number(saga.actual_books_count) ||
      Number(saga.total_books) ||
      0;
    const read = readBySagaId.get(saga.id) ?? 0;
    return { read, total };
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Sagas
        </h1>
        <Button
          variant="primary"
          onClick={handleNewSaga}
          className="flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nueva Saga
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">Cargando sagas...</p>
          </div>
        </Card>
      ) : sagas && sagas.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {sagas.map((saga) => {
            const isExpanded = expandedSagaId === saga.id;
            const { read, total } = getSagaCompletionStatus(saga);

            return (
              <Card key={saga.id}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 cursor-pointer" onClick={() => handleToggleExpand(saga.id)}>
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-600 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {saga.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {saga.author_name || 'Autor desconocido'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="info">
                          {total} {total === 1 ? 'libro' : 'libros'}
                        </Badge>
                      </div>
                      {total > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 transition-all"
                              style={{ width: `${(read / total) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {read}/{total}
                          </span>
                        </div>
                      )}
                    </div>

                    {saga.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                        {saga.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEditSaga(saga)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteSaga(saga.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Expanded Books List */}
                {isExpanded && sagaBooks && sagaBooks.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Libros en esta saga:
                    </h4>
                    <div className="space-y-2">
                      {sagaBooks.map((book, index) => (
                        <div
                          key={book.id}
                          className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-6">
                            {index + 1}.
                          </span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {book.title}
                            </p>
                            {book.user_book?.reading_status && (() => {
                              // DB enum: 'not_started' | 'reading' | 'read' | 'abandoned'
                              const labels = {
                                not_started: { label: 'Sin empezar', variant: 'neutral' },
                                reading: { label: 'Leyendo', variant: 'info' },
                                read: { label: 'Leído', variant: 'success' },
                                abandoned: { label: 'Abandonado', variant: 'warning' },
                              };
                              const s = labels[book.user_book.reading_status];
                              if (!s) return null;
                              return (
                                <Badge variant={s.variant} className="text-xs mt-1">
                                  {s.label}
                                </Badge>
                              );
                            })()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={<Plus className="w-16 h-16 text-gray-400" />}
            title="Sin sagas"
            description="Aún no has creado ninguna saga. Crea una para organizar tus libros por series."
            actionLabel="Crear primera saga"
            onAction={handleNewSaga}
          />
        </Card>
      )}

      {/* Saga Form Modal */}
      <SagaForm
        isOpen={isFormOpen}
        onClose={handleCloseSagaForm}
        saga={editingSaga}
      />

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setDeletingSagaId(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Eliminar saga"
        message="¿Estás seguro de que deseas eliminar esta saga? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        variant="danger"
      />
    </div>
  );
}
