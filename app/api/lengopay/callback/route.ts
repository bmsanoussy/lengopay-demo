import { NextRequest, NextResponse } from 'next/server';
import { updatePaymentStatus } from '@/lib/supabase';

// Type pour la requête de callback LengoPay
interface LengoPayCallbackRequest {
  pay_id: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'CANCELLED';
  amount: number;
  currency: string;
  message: string;
  transaction_id?: string;
  metadata?: Record<string, any>;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as LengoPayCallbackRequest;
    
    // Log des données reçues pour débogage
    console.log('LengoPay Callback - Données reçues:', JSON.stringify(body, null, 2));
    
    const { pay_id, status, amount, message, metadata, transaction_id, currency } = body;

    // Vérifications de base
    if (!pay_id || !status) {
      console.error('Callback LengoPay - Données incomplètes:', body);
      return NextResponse.json(
        { message: 'Données de callback incomplètes', success: false },
        { status: 400 }
      );
    }

    // Mettre à jour le statut du paiement dans Supabase
    const updatedPayment = await updatePaymentStatus(
      pay_id, 
      status,
      message,
      {
        ...metadata,
        transaction_id,
        callback_received_at: new Date().toISOString(),
        amount,
        currency
      }
    );

    if (!updatedPayment) {
      console.error(`Paiement ${pay_id} non trouvé dans la base de données lors de la mise à jour du statut`);
    } else {
      console.log(`Paiement ${pay_id} mis à jour avec succès - Statut: ${status}`);
    }

    // Si le paiement est réussi, vous pourriez effectuer d'autres opérations
    if (status === 'SUCCESS') {
      console.log(`Paiement ${pay_id} réussi, traitement supplémentaire si nécessaire`);
      // Ex: updateOrderStatus(pay_id, 'paid'); // Dans une vraie application
    } else {
      console.log(`Paiement ${pay_id} - Statut: ${status}, message: ${message}`);
    }

    // Toujours renvoyer un succès à LengoPay pour confirmer la réception
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors du traitement du callback LengoPay:', error);
    
    // Même en cas d'erreur, on renvoie un succès à LengoPay
    // pour éviter des tentatives répétées qui ne seraient pas traitées correctement
    return NextResponse.json({ success: true });
  }
} 