import { supabase, ProductRecord } from './supabase';

/**
 * Liste des produits par défaut à initialiser dans la base de données
 */
export const defaultProducts: Omit<ProductRecord, 'id' | 'created_at'>[] = [
  {
    name: "Smartphone premium",
    price: 1500000,
    currency: "GNF",
    description: "Un smartphone haut de gamme avec appareil photo professionnel et batterie longue durée.",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=400&h=300&fit=crop"
  },
  {
    name: "Ordinateur portable",
    price: 2500000,
    currency: "GNF",
    description: "Ordinateur portable puissant idéal pour les professionnels et les gamers.",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=400&h=300&fit=crop"
  },
  {
    name: "Montre connectée",
    price: 800000,
    currency: "GNF",
    description: "Montre connectée avec suivi de santé, notifications et GPS intégré.",
    image: "https://images.unsplash.com/photo-1544117519-31a4b719223d?q=80&w=400&h=300&fit=crop"
  },
  {
    name: "Écouteurs sans fil",
    price: 350000,
    currency: "GNF",
    description: "Écouteurs sans fil avec réduction de bruit active et autonomie de 24h.",
    image: "https://images.unsplash.com/photo-1608156639585-b3a032ef9689?q=80&w=400&h=300&fit=crop"
  },
  {
    name: "Tablette tactile",
    price: 1200000,
    currency: "GNF",
    description: "Tablette tactile haute résolution pour le travail et les loisirs.",
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=400&h=300&fit=crop"
  }
];

/**
 * Initialise la base de données avec les produits par défaut
 */
export async function initDatabase(): Promise<boolean> {
  try {
    console.log('Initialisation des produits dans Supabase...');
    
    // Vérifier si des produits existent déjà
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Erreur lors de la vérification des produits:', countError);
      return false;
    }
    
    // Si aucun produit n'existe, les insérer
    if (count === 0) {
      const { error: insertError } = await supabase
        .from('products')
        .insert(defaultProducts);
      
      if (insertError) {
        console.error('Erreur lors de l\'insertion des produits:', insertError);
        return false;
      } else {
        console.log('Produits insérés avec succès');
        return true;
      }
    } else {
      console.log(`${count} produits existent déjà, aucune insertion nécessaire`);
      return true;
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
    return false;
  }
}

// Si ce fichier est exécuté directement
if (require.main === module) {
  initDatabase()
    .then((success) => {
      console.log('Script d\'initialisation terminé');
      process.exit(success ? 0 : 1);
    })
    .catch(err => {
      console.error('Erreur fatale:', err);
      process.exit(1);
    });
} 