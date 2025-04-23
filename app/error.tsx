'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log l'erreur en production
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-600 mb-4">Erreur</h1>
        <h2 className="text-2xl font-semibold mb-4">Une erreur est survenue</h2>
        <p className="text-gray-600 mb-8">
          Nous sommes désolés, une erreur inattendue s&apos;est produite.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-md transition-colors"
          >
            Réessayer
          </button>
          <Link 
            href="/"
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium px-6 py-3 rounded-md transition-colors"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
} 