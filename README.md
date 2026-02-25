# Convertisseur YouTube Shorts vers MP4 - 1080p H.264

Une application web Next.js premium qui permet aux utilisateurs de convertir et télécharger facilement des vidéos YouTube Shorts sans filigrane, en qualité 1080p HD et au format H.264.

## Technologies Utilisées
- **Next.js 14** (App Router)
- **Tailwind CSS** (pour le style, incluant un mode sombre premium avec effet *glassmorphism*)
- **Framer Motion** (pour les micro-animations et les transitions fluides)
- **TypeScript** (pour un code robuste et typé)

## Démarrage en Local

1. Installez les dépendances :
   ```bash
   npm install
   ```

2. Lancez le serveur de développement :
   ```bash
   npm run dev
   ```

3. Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur pour voir le résultat.

## Déploiement sur Vercel

Cette application est conçue spécifiquement pour être déployée nativement sur Vercel. Toutefois, comme l'extraction de vidéos depuis YouTube via des exécutables lourds comme `yt-dlp` ou `ffmpeg` dépasse la limite de taille d'exécution de 50 Mo des fonctions Serverless de Vercel, la route API est actuellement simulée en attendant d'être connectée à l'intégration d'une API tierce rapide.

### Étapes de Déploiement :

1. **Poussez votre code sur GitHub :**
   ```bash
   git add .
   git commit -m "Premier commit du Convertisseur UI"
   git branch -M main
   git remote add origin https://github.com/VOTRE_NOM_UTILISATEUR/VOTRE_DEPOT.git
   git push -u origin main
   ```

2. **Connectez-vous à Vercel :**
   - Connectez-vous sur [Vercel](https://vercel.com/)
   - Cliquez sur **"Add New..." > "Project"**
   - Importez le dépôt que vous venez de pousser sur GitHub.
   - Le framework (Next.js) sera automatiquement détecté.
   - Cliquez sur **Deploy** !

3. **Configuration de l'API en Production :**
   Pour que le traitement vidéo en arrière-plan fonctionne en production, ouvrez le fichier `src/app/api/convert/route.ts` et remplacez la réponse simulée par un appel `fetch()` vers une API tierce de conversion (comme l'API Cobalt) ou déployez un service travailleur (worker) séparé de Vercel.
