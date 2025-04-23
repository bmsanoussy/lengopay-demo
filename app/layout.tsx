import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { initDatabase } from "@/lib/db-init";

// Tenter d'initialiser les produits au démarrage
initDatabase().catch(err => {
  console.error('Erreur lors de l\'initialisation des produits:', err);
  console.log('Vous pouvez initialiser manuellement les produits avec la commande: npm run init-products');
});

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Démo LengoPay - Intégration de paiement",
  description: "Application de démonstration pour l'intégration de l'API de paiement LengoPay",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <header className="bg-blue-600 text-white py-4">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <Link href="/" className="text-xl font-bold">
              LengoPay Demo
            </Link>
            <nav>
              <ul className="flex space-x-4">
                <li>
                  <Link href="/dashboard" className="hover:text-blue-200 transition-colors">
                    Tableau de bord
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </header>
        
        <div className="flex-grow bg-gray-50">
          {children}
        </div>
        
        <footer className="bg-gray-800 text-white py-6">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p className="text-sm">
                  &copy; {new Date().getFullYear()} LengoPay Demo. Tous droits réservés.
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">
                  Une application de démonstration pour l'intégration de LengoPay
                </p>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
