import { getProducts } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';

export default async function Home() {
  // Récupérer les produits depuis Supabase
  const products = await getProducts();

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Démo LengoPay</h1>
          <p className="text-gray-600">
            Découvrez notre sélection de produits et payez facilement avec LengoPay
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center p-8 bg-gray-100 rounded-lg">
            <p className="text-gray-500">Aucun produit disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
