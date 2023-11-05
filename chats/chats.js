const firebaseConfig = {
    apiKey: "AIzaSyD5RDA1rBtH-NXnY1Uhw6MRptogbOZvXNM",
    authDomain: "book-exchange-22dd2.firebaseapp.com",
    projectId: "book-exchange-22dd2",
    storageBucket: "book-exchange-22dd2.appspot.com",
    messagingSenderId: "940989241251",
    appId: "1:940989241251:web:bce3d53cd7fe5de347ec16",
    measurementId: "G-G8TPSVZSDB"
};

firebase.initializeApp(firebaseConfig);
const firestore = firebase.firestore();

let userUid, userName, chatsLoaded;

window.addEventListener("load", () => {
    const savedTheme = sessionStorage.getItem("selectedTheme");
    if (savedTheme) {
        applyTheme(savedTheme);
    }
});

let SelectedTheme = "bright";
document.getElementById("themeButton").addEventListener("click", () => {
    applyTheme(SelectedTheme);
    SelectedTheme = (SelectedTheme === "bright") ? "dark" : (SelectedTheme === "dark") ? "forest" : "bright";
});

function applyTheme(theme) {
    sessionStorage.setItem("selectedTheme", theme);
    const linkElements = document.querySelectorAll('.theme-stylesheet');
    linkElements.forEach(link => {
        const href = link.getAttribute("href");
        if (href && href.includes(".css") && !href.includes(theme + ".css")) {
            link.parentNode.removeChild(link);
        }
    });

    const newLink = document.createElement("link");
    newLink.rel = "stylesheet";
    newLink.href = `${theme}.css`;
    newLink.classList.add("theme-stylesheet");
    document.head.appendChild(newLink);
}

function getCurrentISTTime() {
    const options = {
        timeZone: 'Asia/Kolkata',
        hour12: true,
        hour: 'numeric',
        minute: 'numeric',
    };
    return new Date().toLocaleString('en-US', options);
}

let toggleChat = [false, false];
let selected_chat = "";
let main_chat = "";
let main_chat_type = "";

document.querySelectorAll(".chat-nav-minimize").forEach((minimize, index) => {
    minimize.addEventListener("click", () => {
        const chatNavUl = document.querySelectorAll(".chat-nav-ul")[index];
        chatNavUl.style.transform = toggleChat[index] ? "translateY(0%)" : "translateY(-100%)";
        toggleChat[index] = !toggleChat[index];
        minimize.classList.toggle("fa-chevron-down");
        minimize.classList.toggle("fa-chevron-up");
    });
});

function sendMessage(data, userid, username, messageText) {
    const currentTime = getCurrentISTTime();
    const message = {
        user: username,
        text: messageText,
        timestamp: currentTime,
        uid: userid
    };

    firestore.collection('messageRooms').doc(data.buyerUid + "_" + data.sellerUid).update({
        messages: firebase.firestore.FieldValue.arrayUnion(message)
    }).then(() => {
        document.querySelector('.chat-input').value = '';
        const chatMessages = document.querySelector('.chat-messages');
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }).catch((error) => {
        console.error('Error adding message: ', error);
    });
}


function createMessageElement(message, className) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('messages', className);
    messageElement.innerHTML = `
        <div class="chat-message-header-text">
            <label>${message.user}</label>
            <span style="font-size: 11px; margin-left: 20px;">${message.timestamp}</span>
        </div>
        <p>${message.text}</p>
    `;
    return messageElement;
}

function updateChatsNav(data, type, uid) {

    document.querySelectorAll(".chat-nav-ul")[type === "s" ? 1 : 0].innerHTML = '';

    const item_nav = document.createElement('li');
    item_nav.className = 'chat-nav-item';

    const itemDivText = document.createElement('div');
    itemDivText.className = 'chat-nav-item-text';
    item_nav.appendChild(itemDivText);

    const itemDivLabel = document.createElement('label');
    itemDivLabel.textContent = (type === "s") ? data.buyerName : data.sellerName;
    itemDivText.appendChild(itemDivLabel);

    const itemDivBook = document.createElement('p');
    itemDivBook.textContent = data.bookName;
    itemDivText.appendChild(itemDivBook);

    const itemDivGrade = document.createElement('p');
    itemDivGrade.textContent = data.grade;
    itemDivGrade.className = "chat-header-grade";
    item_nav.appendChild(itemDivGrade);

    const chatNavUl = document.querySelectorAll(".chat-nav-ul")[type === "s" ? 1 : 0];
    chatNavUl.appendChild(item_nav);

    item_nav.addEventListener("click", () => {
        main_chat = data;
        main_chat_type = type;
        updateMsgs(data, uid, type);
    });
}

document.querySelector(".chat-btn").addEventListener("click", () => {
    const messageText = document.querySelector('.chat-input').value.trim();
    if (messageText !== "") {
        sendMessage(main_chat, userUid, userName, messageText, main_chat_type);
    }
});

function updateMsgs(data, userid, type) {
    document.querySelector(".chat-header-h1").innerText = (type === "s") ? data.buyerName : data.sellerName;
    document.querySelector(".chat-header-book").innerText = data.bookName;
    document.querySelector(".chat-header-grade-main").innerText = data.grade;

    const chatMessages = document.querySelector(".chat-messages");
    chatMessages.innerHTML = '';

    const messages = data.messages;
    messages.forEach(message => {
        const message_div = createMessageElement(message, (message.uid === userid) ? "messages-user" : "messages-other");
        chatMessages.appendChild(message_div);
    });

    chatMessages.scrollTop = chatMessages.scrollHeight;
}


function findChats() {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            userUid = user.uid;
            userName = user.displayName;

            firestore.collection("messageRooms").where("buyerUid", "==", userUid)
                .onSnapshot((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                        const data = doc.data();
                        updateChatsNav(data, "b", userUid, userName);
                    });

                    chatsLoaded = true;

                    checkLoadingStatus()
                });

            firestore.collection("messageRooms").where("sellerUid", "==", userUid)
                .onSnapshot((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                        const data = doc.data();
                        updateChatsNav(data, "s", userUid, userName);
                    });

                    chatsLoaded = true;

                    checkLoadingStatus()
                });
        } else {
            window.location.href = "../login/login.html";
        }
    });
}


firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        userUid = user.uid;
        userName = user.displayName;
        
        firestore.collection("messageRooms").where("buyerUid", "==", userUid)
            .onSnapshot((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    main_chat = data;
                    main_chat_type = "b";
                    updateMsgs(data, userUid, "b");
                });
            });

        firestore.collection("messageRooms").where("sellerUid", "==", userUid)
            .onSnapshot((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    main_chat = data;
                    main_chat_type = "s";
                    updateMsgs(data, userUid, "s");
                });
            });

        findChats();

    } else {
        window.location.href = "../login/login.html";
    }
});

function checkLoadingStatus() {
    if (chatsLoaded) {
      const loadingContainer = document.querySelector(".loadingScreen");
      loadingContainer.classList.add("loading-slide-out");
    }
}

document.querySelector(".log-out-item").addEventListener("click", () => {
    firebase.auth().signOut();
})