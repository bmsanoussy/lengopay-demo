import { NextRequest, NextResponse } from 'next/server';
import { getProductById, createPayment } from '@/lib/supabase';
import { initializePayment } from '@/lib/lengopay';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        { message: 'ID du produit requis' },
        { status: 400 }
      );
    }

    // Récupérer le produit depuis Supabase
    const product = await getProductById(productId);
    
    if (!product) {
      return NextResponse.json(
        { message: 'Produit non trouvé' },
        { status: 404 }
      );
    }

    // Initialiser le paiement avec LengoPay
    const paymentResult = await initializePayment(
      product.price,
      product.currency,
      { 
        product_id: product.id,
        product_name: product.name
      }
    );

    if (!paymentResult.success) {
      return NextResponse.json(
        { 
          message: paymentResult.message || 'Échec de l\'initialisation du paiement',
          status_code: paymentResult.status_code 
        },
        { status: paymentResult.status_code || 500 }
      );
    }

    // Enregistrer le paiement dans Supabase
    if (paymentResult.pay_id) {
      await createPayment({
        product_id: product.id,
        pay_id: paymentResult.pay_id,
        amount: product.price,
        currency: product.currency,
        status: 'PENDING',
        message: 'Paiement initialisé',
        metadata: {
          product_name: product.name,
          redirect_url: paymentResult.redirect_url,
          initialized_at: new Date().toISOString()
        }
      });
    }

    // Construction de l'URL de redirection avec l'ID de paiement
    let redirectUrl = paymentResult.redirect_url || '';
    
    // Log pour débogage
    console.log('Initialisation du paiement:', {
      redirect_url: redirectUrl,
      pay_id: paymentResult.pay_id,
      product_id: product.id
    });

    // Retourner les informations du paiement
    return NextResponse.json({
      success: true,
      redirect_url: redirectUrl,
      pay_id: paymentResult.pay_id,
    });
  } catch (error) {
    console.error('Erreur lors de l\'initialisation du paiement:', error);
    return NextResponse.json(
      { message: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 