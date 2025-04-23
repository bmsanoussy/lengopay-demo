'use client';

import { useEffect, useState } from 'react';
import PaymentStatus from './PaymentStatus';

export default function PaymentStatusWrapper() {
  const [payId, setPayId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fonction pour récupérer le dernier paiement
    const fetchLatestPayment = async () => {
      try {
        // récupérer le dernier paiement depuis l'API
        const response = await fetch('/api/lengopay/latest');
        
        if (!response.ok) {
          throw new Error('Impossible de récupérer le dernier paiement');
        }
        
        const data = await response.json();
        
        if (data.success && data.pay_id) {
          console.log('Dernier paiement récupéré:', data.pay_id);
          setPayId(data.pay_id);
        } else {
          throw new Error('Aucun paiement trouvé');
        }
      } catch (err) {
        console.error('Erreur lors de la récupération du paiement:', err);
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchLatestPayment();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4">
          <svg className="animate-spin w-full h-full text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h2 className="text-xl font-semibold mb-2">Récupération des informations de paiement</h2>
        <p className="text-gray-600">Veuillez patienter pendant que nous récupérons les informations de votre paiement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-yellow-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-xl font-semibold text-yellow-700 mb-2">Information de paiement manquante</h2>
        <p className="text-yellow-600 mb-4">
          {error}
        </p>
      </div>
    );
  }

  if (!payId) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-yellow-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-xl font-semibold text-yellow-700 mb-2">Aucune transaction en cours</h2>
        <p className="text-yellow-600 mb-4">
          Nous n'avons pas pu identifier une transaction récente. Veuillez retourner à la page d'accueil pour effectuer un achat.
        </p>
      </div>
    );
  }

  return <PaymentStatus payId={payId} />;
} 