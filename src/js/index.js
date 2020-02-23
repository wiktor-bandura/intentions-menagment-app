import '../style.scss';
import '../images/favicon.png';
import '../images/icons8-mailbox.svg';
import '@babel/polyfill';
import { firebase, db } from './firebase.config';

const error = document.querySelector('.error'),
      messageForm = document.querySelector('.message-form');

document.querySelector('.login-btn').addEventListener('click', () => document.querySelector('.login-box').classList.add('visible'));
document.querySelector('.close').addEventListener('click', () => document.querySelector('.login-box').classList.remove('visible'));

messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    app();
});

/* Form validation and message sending to Firebase Cloudstore. */

const app = () => {
    const createTime = new Date();
    const name = messageForm.userName.value.trim();
    const messageText = messageForm.messageText.value.trim();

    if(!name || !messageText) {
        error.textContent = `Wypełnij wymagane pola!`;
    } else {
        if(checkResponse()) {

            const message = {
                author: name,
                content: messageText,
                created_at: firebase.firestore.Timestamp.fromDate(createTime)
            };

            error.innerHTML = `<div class="spinner"></div>`;

            addMessage(message)
                .then(() => {
                    changeUI();
                    error.innerHTML = ``;
                })
                .catch((err) => console.log(err));

        } else {
            error.textContent = 'Udowodnij, że nie jesteś robotem!';
        }
    }
}

function verifyCaptcha() {
    error.innerHTML = ``;
}

const checkResponse = () => {
    const response = grecaptcha.getResponse();
    if(response.length == 0) return false;
    return true;
}

const addMessage = async (message) => {
    const response = await db.collection('intentions').add(message);
    return response;
}

const changeUI = () => messageForm.parentElement.innerHTML = `<h3>Twoja intencja została wysłana</h3> <hr> <img src="./icons8-mailbox.svg" alt="Mailbox">`;