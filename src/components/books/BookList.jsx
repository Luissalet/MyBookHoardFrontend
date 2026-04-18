import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ArrowUpDown } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { Book } from 'lucide-react';

export function BookList({
  books = [],
  userBooks = [],
  onSort,
  sortBy = null,
  sortDir = 'asc',
  loading = false,
}) {
  // Create a map of user books by book_id for easy lookup
  const userBooksMap = new Map();
  userBooks.forEach((ub) => {
    userBooksMap.set(ub.book_id, ub);
  });

  // Show empty state if no books
  if (!loading && books.length === 0) {
    return (
      <EmptyState
        icon={<Book className="w-12 h-12" />}
        title="Sin libros"
        description="No hay libros disponibles para mostrar."
      />
    );
  }

  const handleSort = (key) => {
    if (onSort) {
      onSort(key);
    }
  };

  const SortHeader = ({ label, sortKey }) => (
    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-50"
        onClick={() => handleSort(sortKey)}>
      <div className="flex items-center gap-2">
        {label}
        {sortBy === sortKey && (
          <ArrowUpDown className="w-4 h-4" />
        )}
      </div>
    </th>
  );

  const getReadingStatusBadge = (readingStatus) => {
    if (!readingStatus) return null;

    const statusMap = {
      'not_started': { label: 'Sin empezar', variant: 'neutral' },
      'reading': { label: 'Leyendo', variant: 'info' },
      'completed': { label: 'Leído', variant: 'success' },
    };

    const status = statusMap[readingStatus];
    if (!status) return null;

    return <Badge variant={status.variant}>{status.label}</Badge>;
  };

  const renderStars = (rating) => {
    if (!rating) return null;

    const starRating = Math.round((rating / 10) * 5 * 2) / 2;
    const fullStars = Math.floor(starRating);
    const hasHalfStar = starRating % 1 !== 0;

    const stars = [];
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative w-4 h-4">
            <Star className="w-4 h-4 text-gray-300" />
            <div className="absolute inset-0 overflow-hidden w-2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        );
      } else {
        stars.push(
          <Star key={i} className="w-4 h-4 text-gray-300" />
        );
      }
    }
    return stars;
  };

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-md">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
        </div>
      ) : (
        <table className="w-full border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <SortHeader label="Portada" sortKey="cover" />
              <SortHeader label="Título" sortKey="title" />
              <SortHeader label="Autor" sortKey="author" />
              <SortHeader label="Año" sortKey="year" />
              <SortHeader label="Estado" sortKey="status" />
              <SortHeader label="Puntuación" sortKey="rating" />
            </tr>
          </thead>
          <tbody>
            {books.map((book, idx) => {
              const userBook = userBooksMap.get(book.id);
              const authorName = book.author_name || book.primary_author?.name || 'Autor desconocido';
              const coverImage = book.cover_selected || book.images?.[0];

              return (
                <tr
                  key={book.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  {/* Cover */}
                  <td className="px-6 py-4">
                    <Link to={`/libros/${book.id}`}>
                      <div className="w-10 h-14 bg-gradient-to-br from-purple-200 to-blue-200 rounded overflow-hidden flex items-center justify-center flex-shrink-0">
                        {coverImage ? (
                          <img
                            src={coverImage}
                            alt={book.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Book className="w-5 h-5 text-purple-400" />
                        )}
                      </div>
                    </Link>
                  </td>

                  {/* Title */}
                  <td className="px-6 py-4">
                    <Link to={`/libros/${book.id}`} className="text-purple-600 hover:underline font-medium">
                      {book.title}
                    </Link>
                  </td>

                  {/* Author */}
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {authorName}
                  </td>

                  {/* Year */}
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {book.publication_year || '—'}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    {getReadingStatusBadge(userBook?.reading_status)}
                  </td>

                  {/* Rating */}
                  <td className="px-6 py-4">
                    {userBook?.rating ? (
                      <div className="flex items-center gap-1">
                        <div className="flex gap-0.5">
                          {renderStars(userBook.rating)}
                        </div>
                        <span className="text-sm text-gray-600 ml-1">
                          {(Math.round((userBook.rating / 10) * 5 * 2) / 2).toFixed(1)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
