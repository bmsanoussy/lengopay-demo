import PaymentStatusWrapper from '@/components/PaymentStatusWrapper';
import { Suspense } from 'react';

// Composant de chargement pendant que le paiement est récupéré
function LoadingPaymentStatus() {
  return (
    <div className="bg-white rounded-lg shadow p-6 text-center">
      <div className="w-16 h-16 mx-auto mb-4">
        <svg className="animate-spin w-full h-full text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
      <h2 className="text-xl font-semibold mb-2">Vérification du paiement</h2>
      <p className="text-gray-600">Veuillez patienter pendant que nous vérifions votre paiement...</p>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold text-center mb-8">Confirmation de paiement</h1>
        <Suspense fallback={<LoadingPaymentStatus />}>
          <PaymentStatusWrapper />
        </Suspense>
      </div>
    </main>
  );
} 