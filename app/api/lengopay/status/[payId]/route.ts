import { NextRequest, NextResponse } from 'next/server';
import { getPaymentByPayId, updatePaymentStatus } from '@/lib/supabase';
import { checkPaymentStatus } from '@/lib/lengopay';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ payId: string }> }
) {
  try {
    const { payId } = await params;

    if (!payId) {
      return NextResponse.json(
        { message: 'ID de paiement requis' },
        { status: 400 }
      );
    }

    // Récupérer les informations du paiement depuis Supabase
    let payment = await getPaymentByPayId(payId);

    if (payment) {
      // Si le paiement existe mais n'est pas en état final (SUCCESS ou FAILED),
      // vérifier son statut auprès de l'API LengoPay
      if (['PENDING', 'CANCELLED'].includes(payment.status)) {
        console.log(`Paiement ${payId} trouvé dans Supabase avec statut ${payment.status}, vérification auprès de LengoPay`);
        
        try {
          const apiStatus = await checkPaymentStatus(payId);
          
          // Si l'API retourne un statut différent, mettre à jour Supabase
          if (apiStatus && apiStatus.status !== payment.status) {
            console.log(`Mise à jour du statut pour ${payId}: ${payment.status} -> ${apiStatus.status}`);
            
            payment = await updatePaymentStatus(
              payId,
              apiStatus.status,
              apiStatus.message,
              {
                ...payment.metadata,
                api_status_check: new Date().toISOString(),
                api_response: apiStatus
              }
            );
          }
        } catch (error) {
          console.error(`Erreur lors de la vérification du statut auprès de l'API:`, error);
          // On continue avec les données de Supabase en cas d'échec
        }
      } else {
        console.log(`Paiement ${payId} trouvé dans Supabase avec statut final ${payment.status}`);
      }

      // À ce stade, nous savons que payment n'est pas null car nous sommes dans le bloc if(payment)
      return NextResponse.json({
        pay_id: payment!.pay_id,
        status: payment!.status,
        amount: payment!.amount,
        currency: payment!.currency,
        message: payment!.message,
        metadata: payment!.metadata
      });
    } else {
      // Si le paiement n'existe pas dans Supabase, essayer de le récupérer depuis l'API
      console.log(`Paiement ${payId} non trouvé dans Supabase, vérification auprès de l'API`);
      
      try {
        const apiStatus = await checkPaymentStatus(payId);
        
        if (apiStatus) {
          // Retourner directement le statut de l'API
          return NextResponse.json(apiStatus);
        } else {
          return NextResponse.json(
            { message: 'Paiement non trouvé' },
            { status: 404 }
          );
        }
      } catch (error) {
        console.error(`Erreur lors de la vérification du statut auprès de l'API:`, error);
        return NextResponse.json(
          { message: 'Erreur lors de la vérification du statut' },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error('Erreur lors de la vérification du statut du paiement:', error);
    return NextResponse.json(
      { message: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 