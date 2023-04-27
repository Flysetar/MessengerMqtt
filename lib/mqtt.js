const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://localhost:1883');

// Liste des noms d'utilisateur enregistrés
export const registeredUsernames = new Set();
export const groupChats = new Map();

// Se connecter au broker MQTT
client.on('connect', () => {
    console.log('Connecté au broker MQTT.');

    // S'abonner au topic des noms d'utilisateur
    client.subscribe('users', (err) => {
        if (err) {
            console.error('Erreur lors de la souscription au topic :', err);
        } else {
            console.log("Souscription au topic 'users' réussie.");
        }
    });
    client.subscribe('general-chat', (err) => {
        if (err) {
            console.error('Erreur lors de la souscription au topic :', err);
        } else {
            console.log("Souscription au topic 'general-chat' réussie.");
        }
    });
});

// Écouter les messages entrants
client.on('message', (topic, message) => {
    if (topic === 'users') {
        const username = message.toString();
        if (!registeredUsernames.has(username)) {
            registeredUsernames.add(username);
            console.log(`Nouvel utilisateur enregistré : ${username}`);
        }
    } else if (topic === 'general-chat') {
        const chatMessage = message.toString();
        console.log(`Message du chat général : ${chatMessage}`);
    }
    // Vérifier si le message est un message privé
    const privateChatRegex = /^private-chat\/([\w-]+)$/;
    const privateChatMatch = topic.match(privateChatRegex);
    if (privateChatMatch) {
        const chatParticipants = privateChatMatch[1].split('-');
        const privateMessage = message.toString();
        console.log(`Message privé entre ${chatParticipants[0]} et ${chatParticipants[1]} : ${privateMessage}`);
    }

    // Vérifier si le message est un message de canal de discussion
    const groupChatRegex = /^group-chat\/([\w-]+)$/;
    const groupChatMatch = topic.match(groupChatRegex);
    if (groupChatMatch) {
        const channelName = groupChatMatch[1];
        const groupMessage = message.toString();
        console.log(`Message dans le canal de discussion '${channelName}' : ${groupMessage}`);
    }
});

// Fonction pour enregistrer un nouvel utilisateur
function registerUser(username) {
    if (registeredUsernames.has(username)) {
        console.log(`Le nom d'utilisateur '${username}' est déjà pris.`);
        throw new Error(`Nom d'utilisateur déjà pris.`);
    } else {
        // Publier un message avec l'option retain activée
        client.publish('users', username, { retain: true });
        console.log(`Le nom d'utilisateur '${username}' a été enregistré avec succès.`);
    }
}

function sendGeneralChatMessage(username, message) {
    const chatMessage = `${username}: ${message}`;
    client.publish('general-chat', chatMessage);
    console.log(`Message envoyé au chat général : ${chatMessage}`);
}


function createGroupChat(channelName) {
    if (groupChats.has(channelName)) {
        console.log(`Le canal de discussion '${channelName}' existe déjà.`);
        return;
    }

    // Créer un nouvel ensemble pour stocker les membres du canal
    groupChats.set(channelName, new Set());
}

function generatePrivateChatTopic(user1, user2) {
    // Trier les noms d'utilisateur pour garantir un ordre cohérent
    const sortedUsernames = [user1, user2].sort();
    return `private-chat/${sortedUsernames[0]}-${sortedUsernames[1]}`;
}

function sendPrivateMessage(sender, recipient, message) {
    console.log(registeredUsernames)
    /*if (!registeredUsernames.has(sender) || !registeredUsernames.has(recipient)) {
        console.log("L'un des utilisateurs n'est pas enregistré.");
        return;
    }*/

    const privateChatTopic = generatePrivateChatTopic(sender, recipient);
    const privateMessage = `${sender}: ${message}`;

    // Publier le message privé sur le topic du chat privé
    client.publish(privateChatTopic, privateMessage);
    console.log(`Message privé envoyé à ${recipient} : ${privateMessage}`);

    // S'abonner au topic du chat privé, si ce n'est pas déjà fait
    client.subscribe(privateChatTopic, (err) => {
        if (err) {
            console.error(`Erreur lors de la souscription au topic '${privateChatTopic}' :`, err);
        } else {
            console.log(`Souscription au topic '${privateChatTopic}' réussie.`);
        }
    });
}

function generateGroupChatTopic(channelName) {
    return `group-chat/${channelName}`;
}

function joinGroupChat(username, channelName) {
    if (!registeredUsernames.has(username)) {
        console.log(`L'utilisateur '${username}' n'est pas enregistré.`);
        return;
    }

    if (!groupChats.has(channelName)) {
        console.log(`Le canal de discussion '${channelName}' n'existe pas.`);
        return;
    }

    const groupChatTopic = generateGroupChatTopic(channelName);
    const members = groupChats.get(channelName);
    members.add(username);

    // S'abonner au topic du canal de discussion
    client.subscribe(groupChatTopic, (err) => {
        if (err) {
            console.error(`Erreur lors de la souscription au topic '${groupChatTopic}' :`, err);
        } else {
            console.log(`${username} a rejoint le canal de discussion '${channelName}'.`);
        }
    });
}

function inviteToGroupChat(inviter, invitee, channelName) {
    if (!registeredUsernames.has(inviter) || !registeredUsernames.has(invitee)) {
        console.log("L'un des utilisateurs n'est pas enregistré.");
        return;
    }

    if (!groupChats.has(channelName)) {
        console.log(`Le canal de discussion '${channelName}' n'existe pas.`);
        return;
    }

    const members = groupChats.get(channelName);
    if (!members.has(inviter)) {
        console.log(`${inviter} n'est pas membre du canal de discussion '${channelName}'.`);
        return;
    }

    members.add(invitee);
    joinGroupChat(invitee, channelName);
}

function sendGroupChatMessage(username, channelName, message) {
    if (!registeredUsernames.has(username)) {
        console.log(`L'utilisateur '${username}' n'est pas enregistré.`);
        return;
    }

    const groupChatTopic = generateGroupChatTopic(channelName);
    const groupMessage = `${username}: ${message}`;

    // Publier le message dans le canal de discussion
    client.publish(groupChatTopic, groupMessage);
    console.log(`Message envoyé dans le canal de discussion '${channelName}' : ${groupMessage}`);
}

function leaveGroupChat(username, channelName) {
    if (!registeredUsernames.has(username)) {
        console.log(`L'utilisateur '${username}' n'est pas enregistré.`);
        return;
    }

    if (!groupChats.has(channelName)) {
        console.log(`Le canal de discussion '${channelName}' n'existe pas.`);
        return;
    }

    const groupChatTopic = generateGroupChatTopic(channelName);
    const members = groupChats.get(channelName);
    members.delete(username);

    // Se désabonner du topic du canal de discussion
    client.unsubscribe(groupChatTopic, (err) => {
        if (err) {
            console.error(`Erreur lors de la désinscription au topic '${groupChatTopic}' :`, err);
        } else {
            console.log(`${username} a quitté le canal de discussion '${channelName}'.`);
        }
    });
}

module.exports = {
    client,
    registerUser,
    sendGeneralChatMessage,
    createGroupChat,
    joinGroupChat,
    inviteToGroupChat,
    leaveGroupChat,
    sendPrivateMessage
};