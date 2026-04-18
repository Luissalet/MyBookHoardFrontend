import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">Página no encontrada</p>
        <Button
          onClick={() => navigate('/')}
          variant="primary"
          size="lg"
        >
          Volver al Inicio
        </Button>
      </div>
    </div>
  );
}
