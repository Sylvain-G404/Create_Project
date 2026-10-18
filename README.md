# 📊 Create Project

**Version actuelle : v0026.10**

Outil Node.js automatisé permettant de générer instantanément des structures de projets prêtes pour le développement frontend à partir d'une configuration JSON centralisée et dynamique.

Le but de ce projet est de supprimer les tâches répétitives de configuration initiale en automatisant :

- La création des dossiers et sous-dossiers spécifiques ;
- La génération de fichiers d'amorçage (`HTML`, `CSS`, `JS`, `JSON`) ;
- L'injection automatique d'outils d'environnement (Git, Signature, Scripts Windows) ;
- La copie de ressources physiques (Favicons, assets) ;
- La gestion et la persistance des emplacements favoris de l'utilisateur.

---

## 🛠️ Fonctionnalités v0026.10

### 1. Génération Automatique Globale

L'outil crée une structure compartimentée au pixel près pour isoler proprement le style, la logique et les données :

```text
Nouveau_Projet/
│
├── Style/
│   └── style.css
├── JavaScript/
│   └── main.js
├── Data/
│   └── data.json
├── Assets/
│   ├── Image/
│   ├── Icons/
│   └── Favicon/
│       └── Favicon.K.sf.png
│
├── index.html
├── .gitignore               <-- (Nouveau) Initialisation Git
├── generate_structure.bat   <-- (Nouveau) Outil d'arborescence automatique
└── human.txt                <-- (Nouveau) Signature secrète Ghost
```

### 2. Gestion des Emplacements Dynamiques

L'utilisateur sélectionne graphiquement la destination de son projet :

```text
Où voulez-vous créer votre projet ?

1 - Bureau
2 - Disque C
3 - Mon Projet
4 - Autre emplacement
```

Les chemins favoris sont extraits de manière hybride depuis la configuration d'usine (`config.json`) et les préférences persistantes de l'utilisateur (`data-user.json`).

### 3. Lanceur Auto-Régulé Intuitif (`lancer.bat`)

Le fichier d'amorçage a été entièrement réécrit pour offrir une autonomie totale :

- **Détection du PATH :** Vérifie instantanément si l'environnement Node.js est accessible.
- **Auto-Installation Silencieuse :** Si Node.js est manquant, le script bascule en mode PowerShell, interroge l'API de nodejs.org pour récupérer le dernier installeur MSI LTS stable, et le déploie en arrière-plan avec une barre de progression.
- **Rafraîchissement de Session :** Après l'installation, le script ferme la console obsolète et génère un nouveau processus pour injecter le nouveau `PATH` Windows sans intervention manuelle.

---

## ⚙️ Séparation Configuration / Utilisateur

### 📂 `config.json`

Modèle d'usine non-volatile. Il contient le squelette et les règles de construction de l'outil sans intégrer de logique algorithmique dure :

- Les dossiers et sous-dossiers structurels ;
- Les couples modèles/destinations des fichiers de code (`templates/`) ;
- Les chemins physiques des médias à cloner ;
- Le dictionnaire sémantique des questions de l'interface CLI.

### 👤 `data-user.json`

Stockage persistant exclusif à l'utilisateur. Les chemins personnalisés saisis lors de l'exécution y sont sérialisés dynamiquement pour être disponibles lors des prochains lancements.

---

## 🏗️ Architecture du Code (`create-project.js`)

Le script principal segmente sa logique algorithmique en modules fonctionnels distincts :

### 📥 Chargement / Sauvegarde

- `loadConfig()` / `loadUserData()` : Parsing et hydratation des structures JSON d'entrée.
- `saveConfig()` / `saveUserData()` : Écriture et persistance des flux de données sur le disque.

### 🗺️ Routage et Favoris

- `showLocationMenu()` / `getProjectLocation()` : Pilotage de l'interface utilisateur CLI.
- `isValidLocation()` / `isValidChoice()` : Analyse et sanitization des saisies de l'opérateur.
- `askSaveLocation()` / `isFavoritePathExist()` : Enregistrement à la volée des nouveaux chemins système.

### 🛠️ Moteur de Production

- `createProject()` : Chef d'orchestre de la génération globale.
- `createFolder()` : Création récursive sécurisée des dossiers sur le support de stockage.
- `createFile()` : Hydratation des fichiers cibles à partir des moules du répertoire `Templates/`.
- `copyFile()` : Flux de flux binaire pour le clonage d'assets (Favicons, images).

---

## 🚀 Installation & Utilisation

### Méthode Recommandée (100% Automatisée)

Double-cliquez simplement sur le fichier d'amorçage :

```text
lancer.bat
```

L'assistant s'occupe de valider l'environnement (ou de le réparer), affiche la version système active et passe directement la main au script Node.js.

### Méthode Alternative (Développeur)

Exécutez l'application directement depuis un terminal initialisé à la racine du générateur :

```bash
node create-project.js
```

---

## 📜 Historique du Cycle de Vie (Versioning)

### 🟢 v0026.10 (Version Actuelle)

- **Injection Git Init :** Clonage automatisé d'un fichier `.gitignore` d'usine dans chaque projet.
- **Cartographie Système :** Intégration native de `generate_structure.bat` pour documenter instantanément l'arborescence des sous-projets.
- **Signature Auteur :** Génération systématique du fichier `human.txt` pour intégrer les crédits de l'auteur.
- **Blindage Admin et Moteur MSI :** Réécriture de `lancer.bat` avec isolation de l'ancre de répertoire (`%~dp0`), détection ARM64/x64, et installation automatisée du package LTS depuis les dépôts officiels.

### 🟡 v0026.00

- Séparation hermétique entre la configuration de structure et les préférences de l'utilisateur.
- Création du fichier de sauvegarde à la volée `data-user.json`.
- Centralisation complète du dictionnaire de questions CLI dans le modèle d'usine.
- Sécurisation des entrées utilisateurs contre les crashs de chaîne vides.

### 🔴 Versions Antérieures

Les itérations historiques (de la version d'origine `v0016` à `v0025`) sont archivées de manière immuable au sein du répertoire de sauvegarde :

```text
Versions/
├── create-project-v0016.js
└── create-project-v0025.js
```

---

## 👤 À propos de l'Auteur

Ce micro-utilitaire a été développé avec passion par **Ki->ir->rA**, développeur indépendant spécialisé dans la création d'outils d'automatisation légers et d'interfaces web dynamiques.

Si vous aimez ce script ou que vous l'utilisez dans vos projets, n'hésitez pas à laisser une ⭐️ sur ce dépôt pour soutenir le projet !

- **GitHub :** [@Sylvain-G404](https://github.com/Sylvain-G404)
- **Portfolio :** [Mon-Portfolio-Temps](https://sylvain-g404.github.io/Mon-Portfolio-Temps/)

_« Automatiser pour mieux créer. »_
