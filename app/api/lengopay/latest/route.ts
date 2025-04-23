import { NextRequest, NextResponse } from 'next/server';
import { getLatestPayment } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Récupérer le dernier paiement
    const payment = await getLatestPayment();

    if (!payment) {
      return NextResponse.json(
        { message: 'Aucun paiement trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      pay_id: payment.pay_id,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      message: payment.message,
      metadata: payment.metadata,
      created_at: payment.created_at,
      updated_at: payment.updated_at
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du dernier paiement:', error);
    return NextResponse.json(
      { message: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 