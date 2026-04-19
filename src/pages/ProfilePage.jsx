import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, LogOut } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { useUserBooksWithDetails } from '../hooks/useUserBooks';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );
  const { data: userBooks = [] } = useUserBooksWithDetails(user?.id);

  // Calculate stats.
  // Schema: `wishlist_status enum('wish','on_the_way','obtained')`.
  // Any non-null value means the book is on the wishlist.
  const stats = React.useMemo(() => {
    return {
      total: userBooks.length,
      read: userBooks.filter((ub) => ub.reading_status === 'completed').length,
      reading: userBooks.filter((ub) => ub.reading_status === 'reading').length,
      wishlist: userBooks.filter((ub) => !!ub.wishlist_status).length,
    };
  }, [userBooks]);

  const handleToggleDarkMode = () => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.remove('dark');
    } else {
      html.classList.add('dark');
    }
    setIsDarkMode(!isDarkMode);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Mi Perfil
      </h1>

      {/* User Info Card */}
      <Card className="mb-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {user?.username || 'Usuario'}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Correo electrónico
                </label>
                <p className="text-gray-900 dark:text-white mt-1">
                  {user?.email || 'No especificado'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Rol
                </label>
                <p className="text-gray-900 dark:text-white mt-1 capitalize">
                  {user?.role || 'usuario'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Miembro desde
                </label>
                <p className="text-gray-900 dark:text-white mt-1">
                  {formatDate(user?.created_at)}
                </p>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-4xl font-bold text-purple-600 mb-1">
              {user?.id}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">ID de usuario</p>
          </div>
        </div>
      </Card>

      {/* Theme Settings */}
      <Card className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Tema
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isDarkMode ? (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
            <span className="text-gray-900 dark:text-white">
              {isDarkMode ? 'Modo oscuro' : 'Modo claro'}
            </span>
          </div>
          <button
            onClick={handleToggleDarkMode}
            className="relative inline-flex items-center h-8 w-14 bg-gray-300 dark:bg-gray-600 rounded-full transition-colors duration-200"
          >
            <span
              className={`inline-block h-6 w-6 bg-white rounded-full transition-transform duration-200 ${
                isDarkMode ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </Card>

      {/* Collection Stats */}
      <Card className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Estadísticas de colección
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Total de libros
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.total}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Leídos
            </p>
            <p className="text-3xl font-bold text-green-600">
              {stats.read}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Leyendo
            </p>
            <p className="text-3xl font-bold text-blue-600">
              {stats.reading}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Lista de deseos
            </p>
            <p className="text-3xl font-bold text-red-600">
              {stats.wishlist}
            </p>
          </div>
        </div>
      </Card>

      {/* Logout Button */}
      <div className="flex justify-end">
        <Button
          variant="danger"
          onClick={handleLogout}
          className="flex items-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
}
