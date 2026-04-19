import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Grid3X3, List, Search } from 'lucide-react';
import { useBooks } from '../hooks/useBooks';
import { useUserBooksWithDetails } from '../hooks/useUserBooks';
import { useAuth } from '../hooks/useAuth';
import { BookGrid } from '../components/books/BookGrid';
import { BookList } from '../components/books/BookList';
import { FilterBar } from '../components/books/FilterBar';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';

const ITEMS_PER_PAGE = 20;

export function BooksPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('title');
  const [sortDir, setSortDir] = useState('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});

  // Fetch all books
  const { data: booksData, isLoading: loadingBooks } = useBooks({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
  });

  // Fetch user's books with details (reading status, ratings, etc.)
  const { data: userBooksData, isLoading: loadingUserBooks } = useUserBooksWithDetails(user?.id);

  // `useBooks` now selects to `{ books, pagination }`.
  const books = useMemo(() => booksData?.books ?? [], [booksData]);
  const userBooks = useMemo(() => userBooksData ?? [], [userBooksData]);
  const totalBooks = useMemo(
    () => booksData?.pagination?.total ?? 0,
    [booksData]
  );

  const isLoading = loadingBooks || loadingUserBooks;

  // Apply client-side filtering
  const filteredBooks = useMemo(() => {
    let result = [...books];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((book) => {
        const title = book.title?.toLowerCase() || '';
        const author = book.author_name?.toLowerCase() || book.primary_author?.name?.toLowerCase() || '';
        return title.includes(query) || author.includes(query);
      });
    }

    // Reading status filter
    if (filters.readingStatus?.length > 0) {
      const userBooksMap = new Map();
      userBooks.forEach((ub) => {
        userBooksMap.set(ub.book_id, ub);
      });
      result = result.filter((book) => {
        const userBook = userBooksMap.get(book.id);
        return userBook && filters.readingStatus.includes(userBook.reading_status);
      });
    }

    // Wishlist status filter
    if (filters.wishlistStatus?.length > 0) {
      const userBooksMap = new Map();
      userBooks.forEach((ub) => {
        userBooksMap.set(ub.book_id, ub);
      });
      result = result.filter((book) => {
        const userBook = userBooksMap.get(book.id);
        return userBook && filters.wishlistStatus.includes(userBook.wishlist_status);
      });
    }

    // Language filter
    if (filters.language) {
      result = result.filter((book) => book.language === filters.language);
    }

    // Year range filter
    if (filters.yearRange) {
      result = result.filter((book) => {
        const year = book.publication_year;
        if (!year) return false;
        const minOk = !filters.yearRange.min || year >= filters.yearRange.min;
        const maxOk = !filters.yearRange.max || year <= filters.yearRange.max;
        return minOk && maxOk;
      });
    }

    // Author filter
    if (filters.author) {
      const query = filters.author.toLowerCase();
      result = result.filter((book) => {
        const author = book.author_name?.toLowerCase() || book.primary_author?.name?.toLowerCase() || '';
        return author.includes(query);
      });
    }

    // Saga filter
    if (filters.saga) {
      const query = filters.saga.toLowerCase();
      result = result.filter((book) => {
        const saga = book.saga_name?.toLowerCase() || '';
        return saga.includes(query);
      });
    }

    return result;
  }, [books, userBooks, searchQuery, filters]);

  // Apply sorting
  const sortedBooks = useMemo(() => {
    const result = [...filteredBooks];

    const [column, dir] = [sortBy, sortDir === 'asc' ? 1 : -1];

    result.sort((a, b) => {
      let valA, valB;

      if (column === 'title') {
        valA = a.title?.toLowerCase() || '';
        valB = b.title?.toLowerCase() || '';
      } else if (column === 'author') {
        valA = (a.author_name || a.primary_author?.name || '').toLowerCase();
        valB = (b.author_name || b.primary_author?.name || '').toLowerCase();
      } else if (column === 'year') {
        valA = a.publication_year || 0;
        valB = b.publication_year || 0;
      } else if (column === 'recent') {
        valA = a.created_at || a.id;
        valB = b.created_at || b.id;
      } else {
        return 0;
      }

      if (valA < valB) return -1 * dir;
      if (valA > valB) return 1 * dir;
      return 0;
    });

    return result;
  }, [filteredBooks, sortBy, sortDir]);

  // Pagination
  const totalPages = Math.ceil(sortedBooks.length / ITEMS_PER_PAGE);
  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return sortedBooks.slice(start, end);
  }, [sortedBooks, currentPage]);

  const handleSortChange = (value) => {
    const [col, dir] = value.split('-');
    setSortBy(col);
    setSortDir(dir);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mi Biblioteca</h1>
              <p className="text-gray-600 mt-1">
                {totalBooks} {totalBooks === 1 ? 'libro' : 'libros'}
              </p>
            </div>
            <Button
              onClick={() => navigate('/libros/nuevo')}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Añadir libro
            </Button>
          </div>

          {/* Controls Row */}
          <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
            {/* Search and View Toggle */}
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Input
                  label="Buscar"
                  type="text"
                  placeholder="Buscar por título o autor..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  icon={<Search className="w-4 h-4" />}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  title="Vista de grilla"
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  title="Vista de lista"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <Select
                  label="Ordenar por"
                  value={`${sortBy}-${sortDir}`}
                  onChange={(e) => handleSortChange(e.target.value)}
                  options={[
                    { value: 'title-asc', label: 'Título A-Z' },
                    { value: 'title-desc', label: 'Título Z-A' },
                    { value: 'year-asc', label: 'Año ↑' },
                    { value: 'year-desc', label: 'Año ↓' },
                    { value: 'recent-desc', label: 'Más Recientes' },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filter Sidebar */}
          <div className="lg:col-span-1">
            <FilterBar
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Books Display */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
              </div>
            ) : (
              <>
                {viewMode === 'grid' ? (
                  <BookGrid books={paginatedBooks} userBooks={userBooks} loading={false} />
                ) : (
                  <BookList
                    books={paginatedBooks}
                    userBooks={userBooks}
                    sortBy={sortBy}
                    sortDir={sortDir}
                    loading={false}
                  />
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          currentPage === page
                            ? 'bg-purple-600 text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
