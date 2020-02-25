import { firebase, db } from './firebase.config';
import 'firebase/auth';

const loginForm = document.querySelector('.login-form'),
      loginError = document.querySelector('.login-error'),
      intentionsBox = document.querySelector('.intentions'),
      intenstionsClose = intentionsBox.querySelector('.intentions__header > .close'),
      intentionsList = intentionsBox.querySelector('.intentions__list'),
      message = document.querySelector('.message'),
      deleteForm = document.querySelector('.delete-form'),
      downloadButton = document.querySelector('.download');

let authorsAndContents = '';

/* Login validation with Firebase Authorization. */

loginForm.addEventListener('submit', (e) => {

    e.preventDefault();
    const email = loginForm.login.value;
    const password = loginForm.password.value;

    if(!email || !password) loginError.textContent = `Wypełnij pola!`;
    else {

        loginError.innerHTML = `<div class="spinner"></div>`;

        firebase.auth().signInWithEmailAndPassword(email, password)
            .then(() => {
                showIntentions(true);
                loginError.innerHTML = '';
            })
            .catch((err) => {
                console.log(err);
                showIntentions(false);
            });
    }
});

/* Getting all messages to display them on screen after log in.*/

const showIntentions = (result) => {
    if(result) {
        loginError.innerHTML = '';
        intentionsList.innerHTML = '';
        getData();
        intentionsBox.classList.add('visible');

    } else loginError.innerHTML = `<span> Błędny login lub hasło </span>`;
}

/* Form used to deleting unpresent messages */

deleteForm.addEventListener('submit', (e) => {

    e.preventDefault();

    const days = parseInt(deleteForm.inputDays.value);
    const now = new Date().getTime();

    intentionsList.innerHTML = '';


        if(days === 0) {

            getData();
            message.textContent = `Podana liczba jest równa 0, mogłoby to spowodować usunięcie wszystkich intencji.`;
            setTimeout(() => message.textContent = ``, 3000);
        } else {

            authorsAndContents = '';

            db.collection('intentions')
                .orderBy('created_at','desc')
                .get()
                .then(querySnapshot => {
                    querySnapshot.forEach((doc) => {
                        const { created_at } = doc.data();
                        const timeDifference = (parseInt(now) - parseInt(created_at.toDate().getTime())) / 86400000;

                        if(timeDifference > days) {

                                db.collection('intentions').doc(doc.id).delete()
                                .then(() => {
                                    message.textContent = `Usunięto intencje starsze niż ${days} dni.`;
                                    setTimeout(() => message.textContent = ``, 3000);
                                });

                        }

                    })
                });

                getData();
        }
});

const getData = () => {

    authorsAndContents = '';

    db.collection('intentions')
                        .orderBy('created_at','desc')
                        .get()
                        .then(querySnapshot => {
                            querySnapshot.forEach((doc) => {
                                const { author, content, created_at } = doc.data();
                                created_at.toDate().getTime()

                                    const intentionTemplate = `
                                    <div class="intention">
                                        <span>Od: ${author}</span>
                                        <p>"${content}"</p>
                                        <p>${formatDate(created_at.toDate().getTime())}</p>
                                    </div>
                                    `;

                                    authorsAndContents+=`Od: ${author}, "${content}" \n`;

                                    intentionsList.innerHTML += intentionTemplate;
                            });

                        });

        downloadButton.addEventListener('click', createDocument);
        downloadButton.textContent = 'Pobierz plik';
}

const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const months = ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'];
    const day = date.getDate();
    const monthIndex = date.getMonth();
    const year = date.getFullYear();

    return `${day} ${months[monthIndex]} ${year}r.`;
}

const createDocument = () => {

    const blob = new Blob([authorsAndContents], {
        type: 'text/plain'
    });

    const now = formatDate(new Date().getTime());
    const URL = window.URL.createObjectURL(blob);
    let aElement = document.createElement('a');
    aElement.style = 'display: none';
    aElement.href = URL;
    aElement.download = `intencje_${now}.txt`;
    aElement.click();
    window.URL.revokeObjectURL(URL);

}



/* Logging out */

intenstionsClose.addEventListener('click', () => {
    intenstionsClose.parentElement.parentElement.classList.remove('visible');
    downloadButton.removeEventListener('click', createDocument);
    firebase.auth().signOut();
});