# Configuration du module de paiement SoftPay

## Variables d'environnement requises

Ajoutez les variables suivantes dans votre fichier `.env` du backend :

```env
# SoftPay Configuration
SOFTPAY_API_URL=https://api.paydunya.com
SOFTPAY_API_KEY=votre_api_key
SOFTPAY_SECRET_KEY=votre_secret_key
SOFTPAY_TOKEN=votre_token

# URL de l'application (pour les callbacks)
APP_URL=http://localhost:3001
```

## Obtenir les identifiants SoftPay

1. Créez un compte sur [PayDunya](https://www.paydunya.com)
2. Accédez à votre tableau de bord
3. Récupérez vos clés API (Master Key, Private Key, Token)
4. Configurez les variables d'environnement ci-dessus

## Endpoints disponibles

### POST /api/payment/initiate
Initie un paiement via Wave ou Orange Money.

**Body:**
```json
{
  "orderId": 1,
  "provider": "wave" | "orange",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+221771234567",
  "callbackUrl": "http://localhost:3000/boutique/panier?payment=success" // Optionnel
}
```

**Response:**
```json
{
  "success": true,
  "transactionId": "TXN-1234567890",
  "message": "Paiement initié avec succès",
  "paymentId": 1
}
```

### POST /api/payment/verify
Vérifie le statut d'un paiement.

**Body:**
```json
{
  "transactionId": "TXN-1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "status": "COMPLETED",
  "transactionId": "TXN-1234567890"
}
```

### POST /api/payment/callback
Webhook pour les callbacks de SoftPay (appelé automatiquement par SoftPay).

## Migration Prisma

Après avoir ajouté les nouvelles méthodes de paiement (WAVE et ORANGE_MONEY) au schéma Prisma, exécutez :

```bash
cd backend
npx prisma migrate dev --name add_wave_orange_payment_methods
npx prisma generate
```

## Notes importantes

1. **Documentation SoftPay** : L'implémentation actuelle est basée sur une structure d'API générique. Vous devrez peut-être adapter les appels API selon la documentation officielle de SoftPay/PayDunya.

2. **URLs de callback** : Assurez-vous que les URLs de callback sont accessibles publiquement en production.

3. **Sécurité** : Ne commitez jamais vos clés API dans le dépôt. Utilisez toujours des variables d'environnement.

4. **Tests** : Testez d'abord en mode sandbox/test avant de passer en production.

