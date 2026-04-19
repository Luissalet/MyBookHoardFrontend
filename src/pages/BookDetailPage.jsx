import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Book, Star } from 'lucide-react';
import { useBook, useDeleteBook } from '../hooks/useBooks';
import { useUserBooksWithDetails, useUpdateUserBook, useRemoveFromCollection } from '../hooks/useUserBooks';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useToast } from '../components/ui/Toast';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { BookReviews } from '../components/books/BookReviews';

export function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const { data: book, isLoading: loadingBook } = useBook(id);
  const { data: userBooks } = useUserBooksWithDetails(user?.id);
  const updateUserBook = useUpdateUserBook();
  const removeFromCollection = useRemoveFromCollection();
  const deleteBook = useDeleteBook();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedRating, setSelectedRating] = useState(null);
  const [hoverRating, setHoverRating] = useState(null);

  if (loadingBook) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/libros')}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Book className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-700">El libro no fue encontrado.</p>
          </div>
        </div>
      </div>
    );
  }

  // Find user book data
  const userBook = userBooks?.find((ub) => ub.book_id === parseInt(id));

  // Get cover image
  const coverImage = book.cover_selected || book.images?.[0];

  // Get author name
  const authorName = book.author_name || book.primary_author?.name || 'Autor desconocido';

  // Rating conversion (0-10 to 0-5)
  const displayRating = userBook?.rating ? Math.round((userBook.rating / 10) * 5 * 2) / 2 : null;

  // Render stars
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative w-5 h-5">
            <Star className="w-5 h-5 text-gray-300" />
            <div className="absolute inset-0 overflow-hidden w-2.5">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        );
      } else {
        stars.push(
          <Star key={i} className="w-5 h-5 text-gray-300" />
        );
      }
    }
    return stars;
  };

  // Handle rating change
  const handleRatingChange = async (newRating) => {
    if (!userBook) {
      toast.info('Añade el libro a tu colección primero');
      return;
    }

    try {
      // Convert from 0-5 to 0-10
      const rating10 = Math.round((newRating / 5) * 10);
      await updateUserBook.mutateAsync({
        id: userBook.id,
        data: { rating: rating10 },
      });
      setSelectedRating(newRating);
      toast.success('Puntuación guardada');
    } catch (error) {
      console.error('Error updating rating:', error);
      toast.error('Error al guardar la puntuación');
    }
  };

  // Handle reading status change
  const handleReadingStatusChange = async (newStatus) => {
    if (!userBook) {
      toast.info('Añade el libro a tu colección primero');
      return;
    }

    try {
      await updateUserBook.mutateAsync({
        id: userBook.id,
        data: { reading_status: newStatus },
      });
      toast.success('Estado actualizado');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error al actualizar el estado');
    }
  };

  // Handle delete book
  const handleDeleteBook = async () => {
    try {
      await deleteBook.mutateAsync(id);
      toast.success('Libro eliminado');
      navigate('/libros');
    } catch (error) {
      console.error('Error deleting book:', error);
      toast.error('Error al eliminar el libro');
    }
  };

  // Reading status options. The DB enum is
  // ('not_started','reading','read','abandoned'). The UI labels are in
  // Spanish — "Leído" maps to the DB value `read`, NOT `completed`.
  const readingStatusOptions = [
    { value: 'not_started', label: 'Sin empezar' },
    { value: 'reading', label: 'Leyendo' },
    { value: 'read', label: 'Leído' },
    { value: 'abandoned', label: 'Abandonado' },
  ];

  const getReadingStatusBadge = () => {
    if (!userBook?.reading_status) return null;

    const statusMap = {
      not_started: { label: 'Sin empezar', variant: 'neutral' },
      reading: { label: 'Leyendo', variant: 'info' },
      read: { label: 'Leído', variant: 'success' },
      abandoned: { label: 'Abandonado', variant: 'warning' },
    };

    const status = statusMap[userBook.reading_status];
    if (!status) return null;

    return <Badge variant={status.variant}>{status.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate('/libros')}
          className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a la biblioteca
        </button>

        {/* Main content */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8">
            {/* Left: Cover Image */}
            <div className="md:col-span-1">
              <div className="aspect-[3/4] bg-gradient-to-br from-purple-200 to-blue-200 rounded-lg overflow-hidden flex items-center justify-center sticky top-8">
                {coverImage ? (
                  <img
                    src={coverImage}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Book className="w-24 h-24 text-purple-400" />
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                <Link to={`/libros/${id}/editar`} className="w-full">
                  <Button variant="primary" className="w-full flex items-center justify-center gap-2">
                    <Edit2 className="w-4 h-4" />
                    Editar
                  </Button>
                </Link>
                <Button
                  variant="danger"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </Button>
              </div>
            </div>

            {/* Right: Book Information */}
            <div className="md:col-span-2 space-y-6">
              {/* Title and Author */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
                <p className="text-lg text-gray-600">{authorName}</p>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                {book.publication_year && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Año de Publicación</p>
                    <p className="text-lg font-semibold text-gray-900">{book.publication_year}</p>
                  </div>
                )}
                {book.language && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Idioma</p>
                    <p className="text-lg font-semibold text-gray-900">{book.language}</p>
                  </div>
                )}
                {book.isbn && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">ISBN</p>
                    <p className="text-lg font-semibold text-gray-900">{book.isbn}</p>
                  </div>
                )}
                {book.public !== undefined && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Visibilidad</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {book.public ? 'Público' : 'Privado'}
                    </p>
                  </div>
                )}
              </div>

              {/* Reading Status Selector */}
              {userBook && (
                <div>
                  <label className="text-sm text-gray-500 mb-2 block">Estado de Lectura</label>
                  <Select
                    value={userBook.reading_status || 'not_started'}
                    onChange={(e) => handleReadingStatusChange(e.target.value)}
                    options={readingStatusOptions}
                  />
                </div>
              )}

              {/* Rating Stars */}
              <div>
                <p className="text-sm text-gray-500 mb-3">Mi Puntuación</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => handleRatingChange(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          (hoverRating || selectedRating || displayRating || 0) >= star
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {displayRating && (
                  <p className="text-sm text-gray-600 mt-2">
                    {displayRating.toFixed(1)} de 5
                  </p>
                )}
              </div>

              {/* Description */}
              {book.description && (
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 mb-2">Descripción</h2>
                  <p className="text-gray-700 leading-relaxed">
                    {book.description}
                  </p>
                </div>
              )}

              {/* Saga Info */}
              {book.saga && book.saga.name && (
                <div className="border-t border-gray-200 pt-6">
                  <h2 className="text-sm font-semibold text-gray-900 mb-3">Parte de una Saga</h2>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <Link
                      to={`/sagas/${book.saga.id}`}
                      className="text-purple-600 hover:text-purple-700 font-medium"
                    >
                      {book.saga.name}
                    </Link>
                    {book.saga_order && (
                      <p className="text-sm text-gray-600 mt-1">
                        Libro #{book.saga_order}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Other books in saga */}
          {book.saga && book.saga.books && book.saga.books.length > 1 && (
            <div className="border-t border-gray-200 p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Otros libros de {book.saga.name}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {book.saga.books
                  .filter((b) => b.id !== book.id)
                  .map((sagaBook) => (
                    <Link
                      key={sagaBook.id}
                      to={`/libros/${sagaBook.id}`}
                      className="group"
                    >
                      <div className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        <div className="aspect-[3/4] bg-gradient-to-br from-purple-200 to-blue-200 flex items-center justify-center overflow-hidden">
                          {sagaBook.cover_selected || sagaBook.images?.[0] ? (
                            <img
                              src={sagaBook.cover_selected || sagaBook.images?.[0]}
                              alt={sagaBook.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <Book className="w-12 h-12 text-purple-400" />
                          )}
                        </div>
                        <div className="p-3">
                          <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm group-hover:text-purple-600 transition-colors">
                            {sagaBook.title}
                          </h3>
                          {sagaBook.saga_order && (
                            <p className="text-xs text-gray-500 mt-1">
                              Libro #{sagaBook.saga_order}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Public reviews */}
        <BookReviews bookId={id} />
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteBook}
        title="Eliminar Libro"
        message={`¿Estás seguro de que deseas eliminar "${book.title}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
      />
    </div>
  );
}
