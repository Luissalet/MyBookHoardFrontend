import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Check,
  Clock,
  Heart,
  Plus,
  Library,
  Zap,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { BookCard } from '../components/books/BookCard';
import { useUserBooksWithDetails } from '../hooks/useUserBooks';
import { useAuth } from '../hooks/useAuth';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: userBooks } = useUserBooksWithDetails(user?.id);

  // Calculate stats
  const stats = React.useMemo(() => {
    if (!userBooks) return { total: 0, read: 0, reading: 0, notStarted: 0, wishlist: 0 };

    return {
      total: userBooks.length,
      read: userBooks.filter(ub => ub.reading_status === 'completed').length,
      reading: userBooks.filter(ub => ub.reading_status === 'reading').length,
      notStarted: userBooks.filter(ub => ub.reading_status === 'not_started').length,
      wishlist: userBooks.filter(ub => ub.in_wishlist).length,
    };
  }, [userBooks]);

  // Get recent books (last 6)
  const recentBooks = React.useMemo(() => {
    if (!userBooks) return [];
    return userBooks.slice(0, 6);
  }, [userBooks]);

  const statCards = [
    {
      label: 'Total Libros',
      value: stats.total,
      icon: BookOpen,
      color: 'purple',
    },
    {
      label: 'Leídos',
      value: stats.read,
      icon: Check,
      color: 'green',
    },
    {
      label: 'Leyendo',
      value: stats.reading,
      icon: Clock,
      color: 'blue',
    },
    {
      label: 'Sin empezar',
      value: stats.notStarted,
      icon: BookOpen,
      color: 'gray',
    },
    {
      label: 'Lista deseos',
      value: stats.wishlist,
      icon: Heart,
      color: 'red',
    },
  ];

  const quickActions = [
    {
      label: 'Añadir libro',
      icon: Plus,
      onClick: () => navigate('/libros/nuevo'),
    },
    {
      label: 'Ver biblioteca',
      icon: Library,
      onClick: () => navigate('/libros'),
    },
    {
      label: 'Gestionar sagas',
      icon: Zap,
      onClick: () => navigate('/sagas'),
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      purple: 'bg-purple-100 text-purple-700',
      green: 'bg-green-100 text-green-700',
      blue: 'bg-blue-100 text-blue-700',
      gray: 'bg-gray-100 text-gray-700',
      red: 'bg-red-100 text-red-700',
    };
    return colors[color] || colors.purple;
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Inicio
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map((stat) => {
          const IconComponent = stat.icon;
          const colorClasses = getColorClasses(stat.color);
          return (
            <Card key={stat.label}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${colorClasses}`}>
                  <IconComponent className="w-6 h-6" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recent Books Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Libros recientes
        </h2>
        {recentBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentBooks.map((userBook) => (
              <BookCard
                key={userBook.id}
                book={userBook.book}
                userBook={userBook}
              />
            ))}
          </div>
        ) : (
          <Card>
            <EmptyState
              icon={<BookOpen className="w-16 h-16" />}
              title="Sin libros"
              description="Aún no has añadido ningún libro a tu colección."
              actionLabel="Añadir primer libro"
              onAction={() => navigate('/libros/nuevo')}
            />
          </Card>
        )}
      </div>

      {/* Quick Actions Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Acciones rápidas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <Button
                key={action.label}
                variant="outline"
                onClick={action.onClick}
                className="flex items-center justify-center gap-2 py-3"
              >
                <IconComponent className="w-5 h-5" />
                {action.label}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
