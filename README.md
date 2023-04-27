# Messagerie MQTT
Projet réaliser : création d'un application de messagerie  en temps réel conçut avec JS, MQTT. Les utilisateurs ont la possibilité de créer ou de rejoindre des salons de discussion personnalisés basés sur un sujet unique. En outre, ils sont informés des connexions ou déconnexions d'autres utilisateurs et peuvent recevoir des notifications instantanées lors de l'arrivée de nouveaux messages.

## Fonctionnalitées

- Import a HTML file and watch it magically convert to Markdown
- Login avec un unsername (unique)
- Chat général pour discuter 
- Possibilité de créer un canal de discussion avec un nom 
- Inviter des utilisateurs dans un canal de discussion 
- Un utilisateur peut rejoindre un canal, quitter un canal et discuter dans un groupe
- Possibilité de discuter en privé avec un autre utilisateur

## Compte rendu du projet 

- Partie interaction brocker mqtt: 
- Je n'ai pas réussi à récupérer l'historique des messages présents dans la queue. 
- Partie client (front) : 
- Problème de configuration lié au JavaScript. Problème d'import de la librairie mqtt dans ma page HTML.
- Problème lié à l'actualisation en temps réel de la liste des utilisateurs stockée dans le client mqtt.js

Le client mqtt interagit correctement et peut être utilisé en appelant les fonctions JavaScript définies dans le fichier mqtt client. Les retours renvoyés par le broker sont également bien reçus. Cependant, en raison de multiples problèmes de configuration liés à l'intégration front-end, le client final n'est pas opérationnel.

