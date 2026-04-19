import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { AuthorForm } from '../components/authors/AuthorForm';
import {
  useAuthors,
  useCreateAuthor,
  useUpdateAuthor,
  useDeleteAuthor,
} from '../hooks/useAuthors';

export function AuthorsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingAuthorId, setDeletingAuthorId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const { data: authors = [], isLoading } = useAuthors();
  const deleteAuthorMutation = useDeleteAuthor();

  // Filter authors based on search
  const filteredAuthors = useMemo(() => {
    return authors.filter((author) =>
      author.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [authors, searchQuery]);

  const handleNewAuthor = () => {
    setEditingAuthor(null);
    setIsFormOpen(true);
  };

  const handleEditAuthor = (author) => {
    setEditingAuthor(author);
    setEditingId(author.id);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingAuthor(null);
    setEditingId(null);
  };

  const handleDeleteAuthor = (authorId) => {
    // Check if author has books (would be in a real scenario)
    setDeletingAuthorId(authorId);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingAuthorId) {
      deleteAuthorMutation.mutate(deletingAuthorId);
    }
  };

  // `books_count` is aggregated by the API (`Author::all()` LEFT JOINs
  // books on `primary_author_id` and COUNTs). It is always a number.
  const getAuthorBookCount = (author) => Number(author.books_count ?? 0);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Autores
        </h1>
        <Button
          variant="primary"
          onClick={handleNewAuthor}
          className="flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo Autor
        </Button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <Input
          label="Buscar autores"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar por nombre..."
        />
      </div>

      {/* Authors Table */}
      {isLoading ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">Cargando autores...</p>
          </div>
        </Card>
      ) : filteredAuthors.length > 0 ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                    Nombre
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                    Nº de Libros
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAuthors.map((author) => (
                  <tr
                    key={author.id}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <p className="text-gray-900 dark:text-white font-medium">
                        {author.name}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-600 dark:text-gray-400">
                        {getAuthorBookCount(author)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleEditAuthor(author)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteAuthor(author.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : authors.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Plus className="w-16 h-16 text-gray-400" />}
            title="Sin autores"
            description="Aún no hay autores registrados. Crea tu primer autor."
            actionLabel="Crear primer autor"
            onAction={handleNewAuthor}
          />
        </Card>
      ) : (
        <Card>
          <EmptyState
            icon={<Plus className="w-16 h-16 text-gray-400" />}
            title="Sin resultados"
            description="No se encontraron autores que coincidan con tu búsqueda."
          />
        </Card>
      )}

      {/* Author Form Modal */}
      <AuthorForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        author={editingAuthor}
      />

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setDeletingAuthorId(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Eliminar autor"
        message="¿Estás seguro de que deseas eliminar este autor? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        variant="danger"
      />
    </div>
  );
}
