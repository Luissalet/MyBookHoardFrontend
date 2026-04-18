import React from 'react';
import { Link } from 'react-router-dom';
import { Book, Star } from 'lucide-react';
import { Badge } from '../ui/Badge';

export function BookCard({ book, userBook }) {
  // Get cover image with fallback
  const coverImage = book.cover_selected || book.images?.[0];

  // Get author name
  const authorName = book.author_name || book.primary_author?.name || 'Autor desconocido';

  // Get reading status
  const readingStatus = userBook?.reading_status;
  const getReadingStatusBadge = () => {
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

  // Calculate star rating (0-5 from 0-10)
  const rating = userBook?.rating ? Math.round((userBook.rating / 10) * 5 * 2) / 2 : null;

  const renderStars = () => {
    if (!rating) return null;

    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

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
    <Link to={`/libros/${book.id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 h-full flex flex-col">
        {/* Cover Image */}
        <div className="relative w-full aspect-[3/4] bg-gradient-to-br from-purple-200 to-blue-200 overflow-hidden flex items-center justify-center">
          {coverImage ? (
            <img
              src={coverImage}
              alt={book.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <Book className="w-16 h-16 text-purple-400" />
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Title */}
          <h3 className="font-bold text-gray-900 line-clamp-2 text-sm mb-2">
            {book.title}
          </h3>

          {/* Author */}
          <p className="text-xs text-gray-600 mb-3">
            {authorName}
          </p>

          {/* Year */}
          {book.publication_year && (
            <p className="text-xs text-gray-500 mb-3">
              {book.publication_year}
            </p>
          )}

          {/* Status Badge */}
          {readingStatus && (
            <div className="mb-3">
              {getReadingStatusBadge()}
            </div>
          )}

          {/* Stars */}
          {rating !== null && (
            <div className="flex items-center gap-1 mb-3">
              <div className="flex gap-0.5">
                {renderStars()}
              </div>
              <span className="text-xs text-gray-600 ml-1">
                {rating.toFixed(1)}
              </span>
            </div>
          )}

          {/* Language */}
          {book.language && (
            <div className="mt-auto pt-2 border-t border-gray-100">
              <span className="text-xs text-gray-500">
                {book.language}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
