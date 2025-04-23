'use client';

import { useState } from 'react';
import { ProductRecord } from '@/lib/supabase';

interface PaymentButtonProps {
  product: ProductRecord;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export default function PaymentButton({ 
  product, 
  isLoading, 
  setIsLoading 
}: PaymentButtonProps) {
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/lengopay/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId: product.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Échec de l\'initialisation du paiement');
      }

      if (data.redirect_url) {
        // Log pour débogage
        console.log('Redirection vers:', data.redirect_url);
        console.log('ID de paiement:', data.pay_id);

        // Rediriger l'utilisateur vers la page de paiement LengoPay
        window.location.href = data.redirect_url;
      } else {
        throw new Error('URL de redirection non fournie');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handlePayment}
        disabled={isLoading}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Chargement...
          </span>
        ) : (
          'Payer avec LengoPay'
        )}
      </button>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
} 