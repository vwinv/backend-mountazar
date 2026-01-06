# Configuration Cloudinary

Ce projet utilise Cloudinary pour le stockage et la gestion des images des produits.

## Variables d'environnement requises

Ajoutez les variables suivantes à votre fichier `.env` :

```env
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
```

## Comment obtenir vos identifiants Cloudinary

1. Créez un compte sur [Cloudinary](https://cloudinary.com/)
2. Une fois connecté, allez dans le Dashboard
3. Vous trouverez vos identifiants dans la section "Account Details" :
   - **Cloud Name** : Nom de votre cloud
   - **API Key** : Clé API
   - **API Secret** : Secret API

## Structure des dossiers dans Cloudinary

Les images sont organisées dans les dossiers suivants :
- `mountazar/products/` - Images des produits
- `mountazar/hero/` - Images du slider hero
- `mountazar/gallery/` - Images de la galerie
- `mountazar/promotions/` - Bannières de promotions

## Endpoints disponibles

Tous les endpoints nécessitent une authentification admin (JWT token).

### Upload d'images de produits
```
POST /api/uploads/products
Content-Type: multipart/form-data
Body: files (max 20 fichiers, 10MB par fichier)
Response: { urls: string[] }
```

### Upload d'images hero
```
POST /api/uploads/hero
Content-Type: multipart/form-data
Body: files (max 10 fichiers, 5MB par fichier)
Response: { urls: string[] }
```

### Upload d'images galerie
```
POST /api/uploads/gallery
Content-Type: multipart/form-data
Body: files (max 20 fichiers, 5MB par fichier)
Response: { urls: string[] }
```

### Upload de bannière promotion
```
POST /api/uploads/promotions
Content-Type: multipart/form-data
Body: files (1 fichier, 5MB max)
Response: { url: string }
```

## Fonctionnalités

- **Optimisation automatique** : Les images sont automatiquement optimisées (qualité auto, format auto)
- **HTTPS** : Toutes les URLs retournées utilisent HTTPS (secure_url)
- **Organisation** : Les images sont organisées par type dans des dossiers Cloudinary

