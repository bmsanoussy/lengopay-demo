#!/usr/bin/env node

// Script pour initialiser les produits dans Supabase

console.log('Initialisation des produits dans Supabase...');

// Charger les variables d'environnement depuis .env.local
require('dotenv').config({ path: '.env.local' });

// Vérifier que les variables d'environnement sont définies
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Erreur: Les variables d\'environnement NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY doivent être définies dans .env.local');
  process.exit(1);
}

// Importer le script d'initialisation unifié
const { initDatabase } = require('../src/lib/db-init');

// Exécuter l'initialisation
initDatabase()
  .then((success) => {
    if (success) {
      console.log('\n✅ Produits initialisés avec succès!');
    } else {
      console.error('\n❌ L\'initialisation des produits a échoué');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('\n❌ Erreur lors de l\'initialisation des produits:', error);
    process.exit(1);
  }); 