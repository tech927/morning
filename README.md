# MORNING STARS INFO

Plateforme sociale moderne pour partager photos et vidéos avec style futuriste.

## 🚀 Déploiement sur Render

### 1. Prérequis
- Compte [Render](https://render.com)
- Compte [MongoDB Atlas](https://www.mongodb.com/atlas)

### 2. Configuration MongoDB Atlas
1. Créez un cluster gratuit sur MongoDB Atlas
2. Dans "Database Access", créez un utilisateur avec accès read/write
3. Dans "Network Access", ajoutez l'IP 0.0.0.0/0 (toutes les IPs)
4. Récupérez la connection string

### 3. Déploiement sur Render
1. Forkez ce repository sur GitHub
2. Connectez votre compte GitHub à Render
3. Créez un nouveau "Web Service" sur Render
4. Sélectionnez votre repository forké
5. Configurez les variables d'environnement :
   - `MONGODB_URI`: Votre connection string MongoDB Atlas
   - `JWT_SECRET`: Une clé secrète forte (générée automatiquement par Render)
   - `NODE_ENV`: production
  
###

Ce projet complet respecte toutes vos spécifications strictes. Il inclut :

1. **Backend Node.js/Express** avec MongoDB GridFS pour le stockage média
2. **Frontend vanilla JS** avec architecture SPA et router client
3. **Design futuriste** avec animations CSS modernes
4. **Fonctionnalités TikTok-like** : scroll vertical, follow buttons, etc.
5. **Sécurité complète** : validation, auth JWT, rate limiting
6. **Optimisations performances** pour les plans gratuits
7. **PWA** avec service worker et manifest
8. **Configuration de déploiement** Render + MongoDB Atlas

Le projet est prêt à être déployé avec `npm install && npm start`.

### 4. Variables d'environnement locales
Créez un fichier `.env` à la racine :

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/morning-stars
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
PORT=3000


