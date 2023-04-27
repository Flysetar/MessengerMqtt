import { registerUser, registeredUsernames } from './mqtt.js';

const userList = document.getElementById('userList');

// Fonction pour mettre à jour la liste des utilisateurs dans la page HTML
function updateUserList(users) {
  userList.innerHTML = '';
  users.forEach((user) => {
    const listItem = document.createElement('li');
    listItem.textContent = user;
    userList.appendChild(listItem);
  });
}

function handleSubmit(event) {
  const usernameInput = document.getElementById('username');
  const name = usernameInput.value;
  try {
    registerUser(name);
    usernameInput.value = '';
  } catch (error) {
    console.error(error.message);
  }
}

// Ajoute un gestionnaire d'événements pour le formulaire de connexion
const form = document.querySelector('form');
form.addEventListener('submit', handleSubmit);

// Met à jour la liste des utilisateurs lors de la première exécution
updateUserList(registeredUsernames);

// Utilise un MutationObserver pour détecter les modifications de la liste registeredUsers
const observer = new MutationObserver(() => {
  updateUserList(registeredUsernames);
});

observer.observe(registeredUsernames, { childList: true });
