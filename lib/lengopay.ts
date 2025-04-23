// Types pour l'API LengoPay
export interface InitPaymentRequest {
  websiteid: string;
  amount: number;
  currency: string;
  return_url: string;
  callback_url: string;
  metadata?: Record<string, any>;
}

export interface InitPaymentResponse {
  success: boolean;
  redirect_url?: string;
  pay_id?: string;
  message?: string;
  status_code?: number;
}

export interface PaymentStatus {
  pay_id: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'CANCELLED';
  amount: number;
  currency: string;
  message: string;
  metadata?: Record<string, any>;
}

// Fonction pour initialiser un paiement
export async function initializePayment(
  amount: number,
  currency: string,
  metadata?: Record<string, any>
): Promise<InitPaymentResponse> {
  const licenseKey = process.env.LENGOPAY_LICENSE_KEY;
  const websiteId = process.env.LENGOPAY_WEBSITE_ID;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  if (!licenseKey || !websiteId) {
    throw new Error("Les informations d'authentification LengoPay sont manquantes");
  }

  try {
    // Appel réel à l'API LengoPay
    const response = await fetch('https://portal.lengopay.com/api/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${licenseKey}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        websiteid: websiteId,
        amount,
        currency,
        return_url: `${baseUrl}/confirmation`,  // On gérera la redirection vers la page avec l'ID manuellement
        callback_url: `${baseUrl}/api/lengopay/callback`,
        metadata,
      } as InitPaymentRequest),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || 'Échec de l\'initialisation du paiement',
        status_code: response.status,
      };
    }

    const data = await response.json();
    
    // Log pour débogage
    console.log('Réponse de l\'API LengoPay:', JSON.stringify(data, null, 2));
    
    // Construire manuellement l'URL de redirection avec l'ID de paiement
    const redirectUrl = data.payment_url;
    const payId = data.pay_id;
    
    return {
      success: true,
      redirect_url: redirectUrl,
      pay_id: payId,
    };
  } catch (error) {
    console.error('Erreur lors de l\'initialisation du paiement:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Une erreur inconnue est survenue',
    };
  }
}

// Fonction pour vérifier le statut d'un paiement
export async function checkPaymentStatus(payId: string): Promise<PaymentStatus | null> {
  const licenseKey = process.env.LENGOPAY_LICENSE_KEY;

  if (!licenseKey) {
    throw new Error("Les informations d'authentification LengoPay sont manquantes");
  }

  try {
    // Appel réel à l'API LengoPay pour vérifier le statut
    const response = await fetch(`https://portal.lengopay.com/api/v1/payments/${payId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${licenseKey}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Erreur lors de la vérification du statut: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    // Adapter la réponse au format de notre API
    return {
      pay_id: data.pay_id || payId,
      status: data.status as 'SUCCESS' | 'FAILED' | 'PENDING' | 'CANCELLED',
      amount: data.amount,
      currency: data.currency,
      message: data.message || 'Statut du paiement récupéré',
      metadata: data.metadata,
    };
  } catch (error) {
    console.error('Erreur lors de la vérification du statut du paiement:', error);
    return null;
  }
} 