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

let uploadForm = document.querySelector(".submitFormBtn");
let bookSelect = document.getElementById("bookSelect");
let gradeSelect = document.getElementById("gradeSelect");
const fileInput = document.querySelector('.fileInput');
const uploadImageContainer = document.querySelector('.uploadImage');
const imagesCollection = firestore.collection("images");
const textInside = document.querySelector(".textInside");
let chatsChecked = false;
let sellersScanned = false;
let usersScanned = false;

const subjectIcons = {
  "Geography": "fa-globe",
  "Chemistry": "fa-flask-vial",
  "Biology": "fa-dna",
  "Physics": "fa-atom",
  "French": "fa-language",
  "Hindi": "fa-language",
  "Spanish": "fa-language",
  "English Lit": "fa-book",
  "English Lang": "fa-book",
  "Mathematics": "fa-calculator",
  "Computer Science": "fa-computer",
  "Business Studies": "fa-business-time",
  "Art & Design": "fa-brush",
  "History": "fa-history",
  "Economics": "fa-piggy-bank",
  "EVM": "fa-seedling"
};

function changeIcon(theme) {
  document.querySelector(".theme-link").innerHTML = `
    <i class="fa-solid fa-${theme}" id = "toggleIcon"></i>
    <span class = "link-text">Themer</span>
  `
}

window.addEventListener("load", () => {
    const savedTheme = sessionStorage.getItem("selectedTheme");
    if (savedTheme) {
      applyTheme(savedTheme);
    }
});

let SelectedTheme = "bright";
document.getElementById("themeButton").addEventListener("click", () => {
    if(SelectedTheme == "bright") {
        SelectedTheme = "dark";
        changeIcon('moon')
    } else if(SelectedTheme == "dark") {
        SelectedTheme = "forest";
        changeIcon('tree')
    } else {
        SelectedTheme = "bright";
        changeIcon('sun')
    }
    applyTheme(SelectedTheme);
})

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
    newLink.href = `/buyers/${theme}.css`;
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

function sendMessage(sellerId) {

  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      let userUid = user.uid;
      let userName = user.displayName;
      
  const messageText = document.querySelector('.chat-input').value;
  const currentTime = getCurrentISTTime();

  const message = {
    user: userName,
    text: messageText,
    timestamp: currentTime,
    uid: userUid
  };

  firestore.collection('messageRooms').doc(userUid + "_" + sellerId).update({
    messages: firebase.firestore.FieldValue.arrayUnion(message)
  })
  .then((docRef) => {
    
  })
  .catch((error) => {
    console.error('Error adding message: ', error);
  });

  const messageElement = document.createElement('div');
  messageElement.classList.add('messages', 'messages-user');
  messageElement.innerHTML = `
  <div class="chat-message-header-text">
    <label>You</label>
    <span style="font-size: 11px; margin-left: 20px;">${currentTime}</span>
  </div>
  <p>${messageText}</p>
  `;

  const chatMessages = document.querySelector('.chat-messages');
  chatMessages.appendChild(messageElement);

  document.querySelector('.chat-input').value = '';
    } else {
      window.location.href = "../login/login.html"
    }
  });
}

function checkChats() {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      let userUid = user.uid;

      firestore
        .collection("messageRooms")
        .where("buyerUid", "==", userUid)
        .get()
        .then((querySnapshot) => {
          if (!querySnapshot.empty) {
            let doc = querySnapshot.docs[0];
            const data = doc.data();
            document.querySelector(".chat-btn").addEventListener("click", function () {
              if (document.querySelector('.chat-input').value !== "") {
                sendMessage(data.sellerUid);
              }
            });

            document.querySelector(".sellernamedisplay").innerText = "Chat with " + data.sellerName;

            doc.data().messages.forEach((message) => {
              console.log(message);
            
              const messageElement = document.createElement('div');
              let usersnamemsg = "";
            
              if (message.uid === userUid) {
                messageElement.classList.add('messages', 'messages-user');
                usersnamemsg = "You";
              } else {
                messageElement.classList.add('messages', 'messages-other');
                usersnamemsg = message.user;
              }
            
              messageElement.innerHTML = `
                <div class="chat-message-header-text">
                  <label>${usersnamemsg}</label>
                  <span style="font-size: 11px; margin-left: 20px;">${message.timestamp}</span>
                </div>
                <p>${message.text}</p>
              `;
            
              const chatMessages = document.querySelector('.chat-messages');
            
              chatMessages.appendChild(messageElement);
            });
            
          } else {
            document.querySelector(".sellernamedisplay").innerText =
              "Chat with John Doe";
            document.querySelector(".not-found-div-chat").style.display = "flex";
            document.querySelector(".chat-wrapper").style.filter = "blur(10px)";
          }
          chatsChecked = true;
          checkLoadingStatus();
        })
        .catch((error) => {
          console.error("Error getting buyer documents: ", error);
        })
    } else {
      window.location.href = "../login/login.html";
    }
  });
}

var modal = document.getElementById("myModal");
var btn = document.querySelector(".createBtn");
var span = document.getElementsByClassName("close")[0];

btn.onclick = function () {
  modal.style.display = "flex";
};

span.onclick = function () {
  modal.style.display = "none";
};

window.onclick = function (event) {
if (event.target == modal) {
  modal.style.display = "none";
}
};

uploadForm.addEventListener("click", () => {
  let userName = "";
  let userUid = "";
  let userEmail = "";

  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      userUid = user.uid;
      userEmail = user.email;
      if (document.getElementById("nameShare").checked) {
        userName = user.displayName;
      } else {
        userName = "Anonymous";
      }
    } else {
      window.location.href = "../login/login.html";
    }
  });

  const bookValue = bookSelect.value;
  const gradeValue = gradeSelect.value;

  if (bookValue !== "Select a Book..." && gradeValue !== "Select a Grade...") {
    let docName = bookValue + "_" + gradeValue;

    firestore.collection("sellerCollection")
      .where(firebase.firestore.FieldPath.documentId(), ">=", docName)
      .where(firebase.firestore.FieldPath.documentId(), "<", docName + "\uf8ff")
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          const booksCollection = firestore.collection("buyerCollection");
          const newBookRef = booksCollection.doc(bookValue + "_" + gradeValue + "_" + userUid);
          newBookRef.set({
            bookName: bookValue,
            grade: gradeValue,
            buyerName: userName,
            buyerUid: userUid,
            sellerUid: "",
            sellerName: "",
            matched: false,
            bC: false,
            sC: false,
            timestamp: new Date(),
            usermail: userEmail
          })
            .then(() => {
              document.querySelector(".searchOverlay").style.transform = "translateY(0%)";
            })
            .catch((error) => {
              console.error("Error saving book information to Firestore: ", error);
            });
        } else {
          let doc = querySnapshot.docs[0];
          let data = doc.data();
          firestore.collection("matchedRequests")
            .doc(userUid + "_" + data.sellerUid)
            .set(data)
            .then(() => {
              firestore.collection("matchedRequests")
                .doc(userUid + "_" + data.sellerUid)
                .update({ matched: true, buyerName: userName, buyerUid: userUid })
                .then(() => {
                  firestore.collection("sellerCollection")
                    .doc(data.bookName + "_" + data.grade + "_" + data.sellerUid)
                    .delete()
                    .then(() => {
                      const resultsOverlay = document.querySelector(".resultsOverlay");
                      const matchedName = document.querySelector(".matchedName");
                      const matchedPara = document.querySelector(".matchedPara");
                      const sellerImage = document.querySelector(".sellerImage");

                      const imageLoadPromise = new Promise((resolve, reject) => {
                        const img = new Image();
                        img.onload = resolve;
                        img.onerror = reject;
                        img.src = data.imageUrl;
                      });

                      imageLoadPromise
                        .then(() => {
                          resultsOverlay.style.transform = "translateY(0%)";
                          matchedName.innerText = data.sellerName;
                          matchedPara.innerText = "is selling a " + data.bookName + " Book of  " + data.grade;
                          sellerImage.style.backgroundImage = `url(${data.imageUrl})`;

                          document.querySelector(".confirmResultsBtn").addEventListener("click", () => {
                            firestore.collection("matchedRequests")
                              .doc(userUid + "_" + data.sellerUid)
                              .update({ bC: true });
                            document.querySelector(".buttonsCont").style.display = 'none';
                            document.querySelector(".tickMarkContainer").style.display = "flex";

                            const emailBody = `
                              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                <tr>
                                  <td align="center">
                                    <table cellpadding="0" cellspacing="0" border="0" width="600">
                                      <tr>
                                        <td bgcolor="#007BFF" align="center" style="padding: 20px; font-family: Montserrat, sans-serif;">
                                          <h1 style="color: white; font-weight: bold;">A buyer has contacted you!!</h1>
                                        </td>
                                      </tr>
                                      <tr>
                                        <td style="padding: 20px; font-family: Montserrat, sans-serif;" valign="middle" align="center">
                                          <h2>${userName} wants to get your ${data.bookName} book of ${data.grade}!</h2>
                                          <p>Log in to Book Exchange Inventure to contact them!</p>
                                          <table cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                              <td align="center" bgcolor="#007BFF" style="border-radius: 10px; cursor: pointer;">
                                                <a href="http://localhost:5501/dashboard/home/dashboard.html" style="display: block; padding: 1rem; color: white; text-decoration: none;">Take me there!</a>
                                              </td>
                                            </tr>
                                          </table>
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                              </table>
                            `;

                            console.log(data.usermail)
                            Email.send({
                              SecureToken: "42a00557-fef7-49e6-9d59-bc0fe7126f3d",
                              To: data.usermail,
                              From: "bookexchangeinv@proton.me",
                              Subject: "We found you a buyer!",
                              Body: emailBody,
                            }).then(() => {
                              console.log("Sent Email")
                            });
                          });
                        })
                        .catch((error) => {
                          console.error("Error loading image:", error);
                        });
                    })
                    .catch((error) => {
                      console.error("Error removing document: ", error);
                    });
                })
                .catch((error) => {
                  console.error("Error updating document in Firestore: ", error);
                });
            })
            .catch((error) => {
              console.error("Error adding document to 'matchedRequests' collection: ", error);
            });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  } else {
    console.error("Please select a book, grade, and an image.");
  }
});


document.querySelector(".close-search").addEventListener("click", () => {
  document.querySelector(".searchOverlay").style.transform = "translateY(-100%)";
});

document.querySelector(".close-results").addEventListener("click", () => {
  document.querySelector(".resultsOverlay").style.transform = "translateY(-100%)";
});

function createTableItem(data, date) {
  document.querySelector(".table-content").innerHTML += 
  `<div class = "table-item">
    <div class = "table-item-img">
      <i class="fa-solid ${subjectIcons[data.bookName]}"></i>
    </div>
    <div class = "table-item-text">
      <p class = "table-item-text-header">${data.bookName}</p>
      <p>${data.grade}</p>
    </div>
    <p style = "margin-left: auto;">${date}</p>
  </div>`
}

function createCard(data) {
  const cardElement = document.createElement('div');
  cardElement.classList.add('card');
  cardElement.innerHTML = `
    <div class="card-header">
      <p><i class="fa-solid fa-user"></i> ${data.sellerName}</p>
    </div>
    <div class="background-image-faded">
      <i class="fa-solid ${subjectIcons[data.bookName]}"></i>
    </div>
    <div class="sideImage">
      <i class="fa-solid ${subjectIcons[data.bookName]}"></i>
    </div>
    <div class="cardMainContent">
      <div class="titleContent">
        <h3 class="title">${data.bookName}</h3>
        <p class="title-grade">${data.grade}</p>
      </div>
    </div>
  `;

  document.querySelector(".card-wrapper").appendChild(cardElement);

  cardElement.addEventListener("click", () => {
    bookSelect.value = data.bookName;
    gradeSelect.value = data.grade;
    modal.style.display = "flex";
  })
}


function scanSellers(value) {
  if(value !== '') {
    document.querySelector(".card-wrapper").innerHTML = '';
    document.querySelector(".not-found-div-search").style.display = "none";
    console.log(value)
    firestore
    .collection("sellerCollection")
    .where("bookName", "==", value)
    .get()
    .then((querySnapshot) => {
      if (!querySnapshot.empty) {
        querySnapshot.forEach(doc => {
          const data = doc.data();
          createCard(data);
        })
      } else {
    firestore
    .collection("sellerCollection")
    .where("grade", "==", value)
    .get()
    .then((querySnapshot) => {
      if (!querySnapshot.empty) {
        querySnapshot.forEach(doc => {
          const data = doc.data();
          createCard(data);
        })
      } else {
        document.querySelector(".not-found-div").style.display = "flex";
      }
    })
    .catch((error) => {
      console.error(error);
    });
      }
    })
    .catch((error) => {
      console.error(error);
    });
    document.querySelector(".backButton").style.display = "flex";
  } else {
    firestore
    .collection("sellerCollection")
    .orderBy("timestamp", "desc")
    .get()
    .then((querySnapshot) => {
      if (!querySnapshot.empty) {
        document.querySelector(".card-wrapper").innerHTML = '';
        querySnapshot.forEach(doc => {
          const data = doc.data();
          createCard(data);
        })
      } else {
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

        
  sellersScanned = true;
  checkLoadingStatus();
}

function scanUsers(uid) {
  firestore
    .collection("buyerCollection")
    .where("buyerUid", "==", uid)
    .get()
    .then((querySnapshot) => {
      if (!querySnapshot.empty) {
        querySnapshot.forEach(doc => {
          const data = doc.data();
          const timestamp = data.timestamp;
          const jsDate = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1e6);
          
          const day = jsDate.getDate().toString().padStart(2, '0');
          const month = (jsDate.getMonth() + 1).toString().padStart(2, '0');
          const year = jsDate.getFullYear();
          
          const formattedDate = `${day}/${month}/${year}`;
          console.log(formattedDate);
          
          createTableItem(data, formattedDate);
        })
      } else {
        document.querySelector(".table-container").style.filter = "blur(10px)";
        document.querySelector(".not-found-div-table").style.display = "flex";
      }
      usersScanned = true;
      checkLoadingStatus();
    })
    .catch((error) => {
      console.error(error);
    });
}

function searchReq() {
  let inputValue = document.querySelector(".searchBar").value;
  if(inputValue !== '') {
    scanSellers(inputValue);
    console.log("YES")
  } else {
    console.log("NO")
  }
}


document.addEventListener("DOMContentLoaded", () => {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      checkChats();
      scanSellers('');
      scanUsers(user.uid);
    } else {
      window.location.href = "../login/login.html"
    }
  });
});

document.querySelector(".backButton").addEventListener("click", () => {
  scanSellers('');
  document.querySelector(".backButton").style.display = "none";
  document.querySelector(".not-found-div-search").style.display = "none";
})

document.querySelector(".searchBtn").addEventListener("click", () => {
  searchReq();
})

function checkLoadingStatus() {
  if (chatsChecked && sellersScanned && usersScanned) {
    const loadingContainer = document.querySelector(".loadingScreen");
    loadingContainer.classList.add("loading-slide-out");
  }
}

document.querySelector(".not-found-div-table").addEventListener("click", () => {
  modal.style.display = "flex";
})

document.querySelector(".log-out-item").addEventListener("click", () => {
  firebase.auth().signOut();
})