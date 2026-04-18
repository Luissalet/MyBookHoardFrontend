import React from 'react';
import { BookCard } from './BookCard';
import { EmptyState } from '../ui/EmptyState';
import { Book } from 'lucide-react';

export function BookGrid({ books = [], userBooks = [], loading = false }) {
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

  // Show loading skeleton
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg animate-pulse aspect-[3/4]" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          userBook={userBooksMap.get(book.id)}
        />
      ))}
    </div>
  );
}
