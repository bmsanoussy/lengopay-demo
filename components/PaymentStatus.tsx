'use client';

import { useEffect, useState } from 'react';
import { PaymentStatus as IPaymentStatus } from '@/lib/lengopay';
import Link from 'next/link';

interface PaymentStatusProps {
  payId: string;
}

// Intervalle de vérification en ms (5 secondes)
const POLL_INTERVAL = 5000;

// Nombre maximum de tentatives de vérification
const MAX_POLL_ATTEMPTS = 12; // 12 * 5s = 60s maximum

export default function PaymentStatus({ payId }: PaymentStatusProps) {
  const [status, setStatus] = useState<IPaymentStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);

  // Fonction pour récupérer le statut du paiement
  const fetchStatus = async () => {
    try {
      const response = await fetch(`/api/lengopay/status/${payId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Impossible de récupérer le statut du paiement');
      }
      
      const data = await response.json();
      console.log('Statut du paiement:', data);
      setStatus(data);

      // Si le statut est PENDING, et que nous n'avons pas atteint le nombre maximum de tentatives,
      // on continue à vérifier
      return data.status;
    } catch (err) {
      console.error('Erreur lors de la récupération du statut:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      return 'ERROR';
    }
  };

  useEffect(() => {
    let pollingTimer: NodeJS.Timeout | null = null;
    let isMounted = true;

    const pollStatus = async () => {
      if (!isMounted) return;

      try {
        const currentStatus = await fetchStatus();
        
        // Si nous avons un statut terminal, arrêter le polling
        if (currentStatus === 'SUCCESS' || currentStatus === 'FAILED' || pollCount >= MAX_POLL_ATTEMPTS) {
          setIsLoading(false);
          if (pollingTimer) {
            clearTimeout(pollingTimer);
          }
        } else if (currentStatus === 'PENDING' || currentStatus === 'CANCELLED') {
          // Continuer le polling si nous n'avons pas atteint le maximum
          if (pollCount < MAX_POLL_ATTEMPTS) {
            setPollCount(prev => prev + 1);
            pollingTimer = setTimeout(pollStatus, POLL_INTERVAL);
          } else {
            // Arrêter le polling après le nombre maximum de tentatives
            setIsLoading(false);
          }
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Erreur lors du polling:', err);
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        setIsLoading(false);
      }
    };

    // Démarrer le polling immédiatement
    pollStatus();

    // Nettoyage lors du démontage du composant
    return () => {
      isMounted = false;
      if (pollingTimer) {
        clearTimeout(pollingTimer);
      }
    };
  }, [payId]); // Ne dépend que de payId, pas de pollCount pour éviter de relancer useEffect

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 mb-4">
          <svg className="animate-spin w-full h-full text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h2 className="text-xl font-semibold mb-2">Vérification du paiement</h2>
        <p className="text-gray-600">Veuillez patienter pendant que nous vérifions votre paiement...</p>
        {pollCount > 0 && (
          <p className="text-sm text-gray-500 mt-2">Tentative {pollCount}/{MAX_POLL_ATTEMPTS}</p>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-xl font-semibold text-red-700 mb-2">Erreur</h2>
        <p className="text-red-600 mb-4">{error}</p>
        <Link 
          href="/"
          className="inline-block bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition-colors"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    );
  }

  // Afficher un message d'attente pour les paiements en PENDING après le nombre maximum de tentatives
  if (status?.status === 'PENDING' && pollCount >= MAX_POLL_ATTEMPTS) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-yellow-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-xl font-semibold text-yellow-700 mb-2">Paiement en cours de traitement</h2>
        <p className="text-yellow-600 mb-4">
          Votre paiement est toujours en cours de traitement. Veuillez vérifier à nouveau plus tard.
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => {
              setIsLoading(true);
              setPollCount(0);
              fetchStatus();
            }}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            Vérifier à nouveau
          </button>
          <Link 
            href="/"
            className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg p-6 text-center ${status?.status === 'SUCCESS' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
      {status?.status === 'SUCCESS' ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      
      <h2 className={`text-xl font-semibold mb-2 ${status?.status === 'SUCCESS' ? 'text-green-700' : 'text-red-700'}`}>
        {status?.status === 'SUCCESS' ? 'Paiement réussi' : 'Paiement échoué'}
      </h2>
      
      <p className={`mb-4 ${status?.status === 'SUCCESS' ? 'text-green-600' : 'text-red-600'}`}>
        {status?.message}
      </p>
      
      <div className="mb-6 p-3 bg-white rounded border border-gray-200">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-left text-gray-500">Identifiant :</div>
          <div className="text-right font-medium break-all overflow-hidden">
            {status?.pay_id && status.pay_id.length > 20 
              ? `${status.pay_id.substring(0, 10)}...${status.pay_id.substring(status.pay_id.length - 10)}`
              : status?.pay_id}
          </div>
          
          <div className="text-left text-gray-500">Montant :</div>
          <div className="text-right font-medium">
            {status ? `${status.amount.toLocaleString()} ${status.currency}` : ''}
          </div>
          
          <div className="text-left text-gray-500">Statut :</div>
          <div className="text-right font-medium">
            {status?.status === 'SUCCESS' ? (
              <span className="text-green-600">Succès</span>
            ) : (
              <span className="text-red-600">Échec</span>
            )}
          </div>
        </div>
      </div>
      
      <Link 
        href="/"
        className={`inline-block font-medium py-2 px-4 rounded transition-colors ${
          status?.status === 'SUCCESS' 
            ? 'bg-green-600 hover:bg-green-700 text-white' 
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
} 