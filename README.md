# 🧗‍♂️ Wordle Climb

Ce projet est un POC (Proof of Concept) d'application web full-stack illustrant le développement d'un jeu de réflexion linguistique ("Wordle" avec progression). L'objectif technique est de démontrer l'implémentation d'une architecture distribuée, sécurisée et "cloud-native", intégrant des capacités d'Intelligence Artificielle générative.

## 💼 Cas d'Usage & Composants Réutilisables

L'application illustre l'implémentation de composants techniques transposables au contexte d'entreprise :
- **Modules de Gamification** : Développement de moteurs de règles (système de progression, streaks, leaderboards paginés) applicables à des plateformes B2B (e-learning, onboarding RH).
- **Architecture Cloud-Native** : Backend Java Quarkus (Kubernetes, Serverless), optimisé pour des temps de démarrage à froid (cold start) réduits et une faible empreinte mémoire.
- **Intégration IA (GenAI)** : Orchestration de requêtes LLM (Large Language Models) via LangChain4j pour la génération dynamique de contenu métier textuel avec l'API Groq.

## 🛠️ Stack Technique

![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Quarkus](https://img.shields.io/badge/Quarkus-4695EB?style=for-the-badge&logo=quarkus&logoColor=white)
![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

### ☕ Backend (Java / Quarkus)
- **Framework** : Quarkus. Architecture orientée microservices prête pour la compilation native (GraalVM).
- **Persistance & Migrations** : PostgreSQL (Production) / H2 (Dev). Versionnement strict du schéma relationnel (DDL) via **Flyway**.
- **ORM** : Hibernate ORM avec Panache (Pattern Repository/Active Record) implémentant l'API standard JPA.
- **Sécurité (IAM)** : API sécurisée par authentification *stateless* **JWT (JSON Web Tokens)** avec signature par clés cryptographiques asymétriques (RSA).
- **Intégration LLM** : Framework **LangChain4j** interfaçant le modèle Llama 3.1 (via API Groq) pour l'inférence temps réel du moteur de jeu (dictionnaire, génération d'indices).

### 🅰️ Frontend (TypeScript / Angular)
- **Framework** : Angular 18+. Architecture *Single Page Application* (SPA) utilisant les *Standalone Components* et une gestion d'état réactive (Signals & RxJS).
- **Réseau** : Client HTTP RESTful avec intercepteurs pour l'injection du token d'authentification (`Bearer`) et la capture globale des erreurs de routage.

### 🐳 DevOps & Déploiement
- **Conteneurisation** : Images Docker avec support pour builds multi-stages (JVM ou Native). Orchestration des services locaux (Backend, DB, Frontend) via `docker-compose.yml`.

## ✨ Fonctionnalités Techniques Implémentées

1. **🔒 Gestion d'Identité et d'Accès** : 
   - Protection des *Endpoints* par Rôles (`@RolesAllowed`).
   - Hachage cryptographique des mots de passe (Bcrypt).
2. **📈 Télémétrie et Agrégation de Données** : 
   - Stockage transactionnel des métriques utilisateurs (`max_score`, `current_streak`).
   - Requêtes SQL optimisées avec pagination native (`LIMIT/OFFSET`) et indexation B-Tree pour le rendu du leaderboard.
3. **🎮 Moteur Métier (Game Engine)** : 
   - Couche de service (`@ApplicationScoped`) gérant la logique d'état transactionnelle (`@Transactional`).
   - Validation stricte des flux entrants via Bean Validation (JSR-380 / Hibernate Validator) sur les DTOs (Data Transfer Objects).
4. **⚙️ Configuration Dynamique** : 
   - Séparation des profils d'exécution (`%dev`, `%prod`) et injection dynamique des secrets via variables d'environnement (`application.properties`).

## 🚀 Comment lancer le projet localement (Quick Start)

Pour démarrer l'environnement complet :

> [!IMPORTANT]
> **0. Prérequis : Clé API IA (Groq)**
> L'application requiert une clé API Groq pour les appels LLM. Configurez la variable d'environnement :
> * Windows (PowerShell) : `$env:GROQ_API_KEY="votre_cle_api"`
> * Mac/Linux (Bash) : `export GROQ_API_KEY="votre_cle_api"`
> *(Alternative : Déclarez `GROQ_API_KEY=votre_cle_api` dans un fichier `.env` au sein du dossier `backend/`)*

**1. Lancer le Backend (API Quarkus)**
Ouvrez un terminal à la racine du projet et exécutez le mode *Live Reload* :
```powershell
cd backend
./mvnw.cmd quarkus:dev
```
*Le serveur HTTP écoute sur http://localhost:8080*

**2. Lancer le Frontend (Application Angular)**
Ouvrez un second terminal à la racine du projet et exécutez :
```powershell
cd frontend
npm install
npm start
```
*L'interface client est servie sur http://localhost:4200*
