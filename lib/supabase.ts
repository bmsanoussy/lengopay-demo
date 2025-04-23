import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Création du client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types pour les tables Supabase
export type ProductRecord = {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  image: string;
  created_at?: string;
};

export type PaymentRecord = {
  id: string;
  product_id: string;
  pay_id: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  message: string | null;
  metadata: any;
  created_at?: string;
  updated_at?: string;
};

// Fonctions pour les produits
export async function getProducts(): Promise<ProductRecord[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    return [];
  }

  return data || [];
}

export async function getProductById(id: string): Promise<ProductRecord | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Erreur lors de la récupération du produit ${id}:`, error);
    return null;
  }

  return data;
}

// Fonctions pour les paiements
export async function createPayment(payment: Omit<PaymentRecord, 'id' | 'created_at' | 'updated_at'>): Promise<PaymentRecord | null> {
  const { data, error } = await supabase
    .from('payments')
    .insert([payment])
    .select()
    .single();

  if (error) {
    console.error('Erreur lors de la création du paiement:', error);
    return null;
  }

  return data;
}

export async function updatePaymentStatus(
  pay_id: string,
  status: PaymentRecord['status'],
  message: string | null = null,
  metadata: any = {}
): Promise<PaymentRecord | null> {
  const { data, error } = await supabase
    .from('payments')
    .update({
      status,
      message,
      metadata,
      updated_at: new Date().toISOString(),
    })
    .eq('pay_id', pay_id)
    .select()
    .single();

  if (error) {
    console.error(`Erreur lors de la mise à jour du paiement ${pay_id}:`, error);
    return null;
  }

  return data;
}

export async function getPaymentByPayId(pay_id: string): Promise<PaymentRecord | null> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('pay_id', pay_id)
    .single();

  if (error) {
    console.error(`Erreur lors de la récupération du paiement ${pay_id}:`, error);
    return null;
  }

  return data;
}

export async function getLatestPayment(): Promise<PaymentRecord | null> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Erreur lors de la récupération du dernier paiement:', error);
    return null;
  }

  return data;
}

export async function getAllPayments(): Promise<PaymentRecord[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('*, products(name)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erreur lors de la récupération des paiements:', error);
    return [];
  }

  // Transforme les données pour inclure le nom du produit directement
  return (data || []).map(payment => ({
    ...payment,
    product_name: payment.products?.name || 'Produit inconnu'
  }));
}

// Fonction pour initialiser les tables
export async function initializeDatabase(products: Omit<ProductRecord, 'id' | 'created_at'>[]): Promise<void> {
  // Vérifier si des produits existent déjà
  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Erreur lors de la vérification des produits:', error);
    return;
  }

  // Si aucun produit n'existe, ajouter les produits par défaut
  if (count === 0) {
    const { error: insertError } = await supabase
      .from('products')
      .insert(products);

    if (insertError) {
      console.error('Erreur lors de l\'insertion des produits:', insertError);
    } else {
      console.log('Produits ajoutés avec succès');
    }
  }
} 