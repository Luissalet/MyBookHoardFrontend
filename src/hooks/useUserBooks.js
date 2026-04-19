import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userBooksApi } from '../services/userBooks.api';

/**
 * Returns the user's books-with-details as a flat array.
 *
 * The service `userBooksApi.getUserBooksWithDetails` resolves to the
 * raw API envelope:
 *   { success, data: { user_books_with_details: [{ userbook, book }], total_count }, timestamp }
 *
 * Consumers (DashboardPage, BooksPage, BookDetailPage, ProfilePage)
 * read fields like `ub.id`, `ub.book_id`, `ub.reading_status`,
 * `ub.wishlist_status` directly *and* `ub.book.title` for nested book
 * data. We flatten the userbook half to top-level while keeping `book`
 * nested. Result shape per entry:
 *   { id, user_id, book_id, reading_status, wishlist_status,
 *     personal_rating, ..., book: {...} }
 */
export function useUserBooksWithDetails(userId) {
  return useQuery({
    queryKey: ['userBooks', userId],
    queryFn: () => userBooksApi.getUserBooksWithDetails(userId),
    enabled: !!userId,
    select: (envelope) =>
      (envelope?.data?.user_books_with_details ?? []).map((entry) => ({
        ...entry?.userbook,
        book: entry?.book ?? null,
      })),
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
