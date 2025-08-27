# Stripe_exemple_API

git clone https://github.com/wazabi64000/Stripe_exemple_API.git

cd  Stripe_exemple_API

 
npm install express mysql2 dotenv bcrypt jsonwebtoken stripe cors
npm install cookie-parser



mysql -u root -p

CREATE DATABASE myshop;

USE myshop;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);


CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);


INSERT INTO products (name, description, price) VALUES
('Produit 1', 'Description du produit 1', 10.00),
('Produit 2', 'Description du produit 2', 20.00),
('Produit 3', 'Description du produit 3', 30.00);



DB_HOST=localhost
DB_USER=root
DB_PASS=VOTRE_MOT_DE_PASSE
DB_NAME=myshop
JWT_SECRET=monsecret
STRIPE_KEY=sk_test_XXXXXXXXXXXXXXXX


#  Endpoints API –  

##  Authentification

### Inscription
POST /api/auth/register
Body (JSON) :
{
  "email": "user@test.com",
  "password": "123456"
}

---

### Connexion
POST /api/auth/login
Body (JSON) :
{
  "email": "user@test.com",
  "password": "123456"
}

Réponse :
{
  "token": "JWT_TOKEN"
}

 Pour toutes les routes protégées, ajouter dans le header :
Authorization: Bearer JWT_TOKEN

---

##  Produits

### Lister les produits
GET /api/products

### Ajouter un produit
POST /api/products  
Headers : Authorization: Bearer JWT_TOKEN  
Body (JSON) :
{
  "name": "Chaussures",
  "description": "Chaussures de sport",
  "price": 59.99
}

---

## 🛒 Panier (stocké en cookies)

### Voir le panier
GET /api/cart

### Ajouter au panier
POST /api/cart  
Body (JSON) :
{
  "id": 1,
  "name": "Chaussures",
  "price": 59.99
}

### Passer une commande (si connecté)
POST /api/cart/checkout  
Headers : Authorization: Bearer JWT_TOKEN  

Réponse :
{
  "message": "Commande réussie",
  "orderId": 5
}

---

##  Commandes

### Voir mes commandes
GET /api/orders  
Headers : Authorization: Bearer JWT_TOKEN

---

##  Paiement (Stripe)

### Créer un paiement (simulé en test mode)
POST /api/payment  
Headers : Authorization: Bearer JWT_TOKEN  
Body (JSON) :
{
  "amount": 5999,
  "currency": "usd"
}

Réponse :
{
  "clientSecret": "pi_123456_secret_abcdef"
}


