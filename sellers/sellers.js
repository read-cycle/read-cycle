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
const textInside = document.querySelector(".textInside");
let userUid = "";
let userName = "Anonymous";
const imagesCollection = firestore.collection("images");

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
  
function getCurrentISTTime() {
  const options = {
    timeZone: 'Asia/Kolkata',
    hour12: true,
    hour: 'numeric',
    minute: 'numeric',
  };
  return new Date().toLocaleString('en-US', options);
}

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
    newLink.href = `/sellers/${theme}.css`;
    newLink.classList.add("theme-stylesheet");
    document.head.appendChild(newLink);
}


function uploadImageToStorage(selectedFile, callback) {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      userUid = user.uid;

      if (selectedFile) {
        const newImageRef = imagesCollection.doc(bookSelect.value + "_" + gradeSelect.value + "_" + userUid);
        const storageRef = firebase.storage().ref().child(`images/${newImageRef.id}`);
        storageRef.put(selectedFile).then((snapshot) => {
          snapshot.ref.getDownloadURL().then((downloadURL) => {
            newImageRef.set({
              imageUrl: downloadURL,
            }).then(() => {
              bookSelect.value = "";
              gradeSelect.value = "";
              callback(downloadURL);
            }).catch((error) => {
              console.error("Error saving image URL to Firestore: ", error);
            });
          });
        }).catch((error) => {
          console.error("Error uploading image: ", error);
        });
      } else {
        console.error("No image selected.");
      }
    } else {
      console.log("No user signed in.");
    }
  });
}

function CheckMatchedReq() {

  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      userUid = user.uid;
    } else {
      window.location.href = "../login/login.html"
    }
  });

  firestore.collection("matchedRequests")
    .where("matched", "==", true)
    .where("sellerUid", "==", userUid)
    .get()
    .then((querySnapshot) => {
      if (!querySnapshot.empty) {
        let doc = querySnapshot.docs[0];
        const data = doc.data();
        document.querySelector(".buyernamedisplay").innerText = "Your Chat With " + data.sellerName;
      } else {
        document.querySelector(".buyernamedisplay").innerText = "No matched requests found.";
      }
    })
    .catch((error) => {
      console.error("Error getting documents: ", error);
    });



    firestore.collection("messageRooms")
    .where("matched", "==", true)
    .where("sellerUid", "==", userUid)
    .get()
    .then((querySnapshot) => {
      console.log(userUid)
      console.log(querySnapshot);
      if (!querySnapshot.empty) {
        let doc = querySnapshot.docs[0];
        const data = doc.data();
        document.querySelector(".buyernamedisplay").innerText = "Your Chat With " + data.buyerName;
      } else {
        document.querySelector(".buyernamedisplay").innerText = "No matched requests found.";
      }
    })
    .catch((error) => {
      console.error("Error getting documents: ", error);
    });
}

function sendMessage(docData) {
  const messageText = document.querySelector('.chat-input').value;
  const currentTime = getCurrentISTTime();

  const message = {
    user: docData.sellerName,
    text: messageText,
    timestamp: currentTime,
    uid: userUid
  };

  firestore.collection('messageRooms').doc(docData.buyerUid + "_" + userUid).update({
    messages: firebase.firestore.FieldValue.arrayUnion(message)
  })
  .then((docRef) => {
    console.log('Message written with ID: ', docRef.id);
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
}

function checkChats() {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      userUid = user.uid;

      firestore
        .collection("messageRooms")
        .where("sellerUid", "==", userUid)
        .get()
        .then((querySnapshot) => {
          if (!querySnapshot.empty) {
            let doc = querySnapshot.docs[0];
            const data = doc.data();
            document.querySelector(".chat-btn").addEventListener("click", function () {
              if (document.querySelector('.chat-input').value !== "") {
                sendMessage(data);
              }
            });

            document.querySelector(".buyernamedisplay").innerText = "Chat with " + data.buyerName;

            data.messages.forEach((message) => {
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
            document.querySelector(".buyernamedisplay").innerText =
            "Chat with John Doe";
            document.querySelector(".chat-container").style.filter = "blur(10px)";
            document.querySelector(".not-found-div-chat").style.display = "flex";
          }
        })
        .catch((error) => {
          console.error("Error getting buyer documents: ", error);
        });

        chats_checked = true;
        checkLoadingStatus();
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

let usermail = "";

document.getElementById("nameShare").addEventListener("change", function () {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      if (this.checked) {
        userName = user.displayName || "Anonymous";
        usermail = user.email;
      } else {
        userName = "Anonymous";
      }
    } else {
      userName = "Anonymous";
    }
  });

});

fileInput.addEventListener('change', function () {
  if (fileInput.files.length > 0) {
    const selectedFile = fileInput.files[0];
    const imageURL = URL.createObjectURL(selectedFile);
    uploadImageContainer.style.backgroundImage = `url('${imageURL}')`;
    textInside.style.display = "none";
  } else {
    uploadImageContainer.style.backgroundImage = 'none';
  }
});

uploadForm.addEventListener("click", () => {
  const bookValue = bookSelect.value;
  const gradeValue = gradeSelect.value;
  const selectedFile = fileInput.files[0];

  uploadImageContainer.style.backgroundImage = "none";
  textInside.style.display = "flex";

  if (bookValue !== "" && gradeValue !== "" && selectedFile !== null) {
    const docName = bookValue + "_" + gradeValue;
    firestore
      .collection("buyerCollection")
      .where(firebase.firestore.FieldPath.documentId(), ">=", docName)
      .where(firebase.firestore.FieldPath.documentId(), "<", docName + "\uf8ff")
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          uploadImageToStorage(selectedFile, (downloadURL) => {
            const booksCollection = firestore.collection("sellerCollection");
            const newBookRef = booksCollection.doc(
              bookValue + "_" + gradeValue + "_" + userUid
            );
            newBookRef
              .set({
                bookName: bookValue,
                grade: gradeValue,
                imageUrl: downloadURL,
                sellerName: userName,
                sellerUid: userUid,
                buyerUid: "",
                buyerName: "",
                matched: false,
                bC: false,
                sC: false,
                timestamp: new Date(),
                userEmail: usermail
              })
              .then(() => {
                document.querySelector(".searchOverlay").style.transform = "translateY(0%)";
              })
              .catch((error) => {
                console.error("Error saving book information to Firestore: ", error);
              });
          });
        } else {
          let doc = querySnapshot.docs[0];
          let newDocRef = firestore.collection("matchedRequests").doc(doc.data().buyerUid + "_" + userUid);
          firestore
          .collection("matchedRequests")
          .doc(doc.data().buyerUid + "_" + userUid)
          .set(doc.data())
          .then(() => {
            let data = doc.data();
            uploadImageToStorage(selectedFile, (downloadURL) => {
              let file = downloadURL;
              newDocRef.update({ matched: true, imageUrl: file, sellerName: userName, sellerUid: userUid }).then(() => {
                  firestore.collection("buyerCollection").doc(data.bookName + "_" + data.grade + "_" + data.buyerUid).delete()
                  .then(() => {
                    const resultsOverlay = document.querySelector(".resultsOverlay");
                    const matchedName = document.querySelector(".matchedName");
                    const matchedPara = document.querySelector(".matchedPara");
                    resultsOverlay.style.transform = "translateY(0%)";
                    matchedName.innerText = data.buyerName;
                    matchedPara.innerText = "is looking to buy a " + data.bookName + " Book of  " + data.grade;
                    document.querySelector(".confirmResultsBtn").addEventListener("click", () => {
                      firestore.collection("matchedRequests").doc(data.buyerUid + "_" + userUid)
                      .update({ sC: true })
                      document.querySelector(".buttonsCont").style.display = 'none';
                      document.querySelector(".tickMarkContainer").style.display = "flex";

                      const emailBody = `
                      <table cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                          <td align="center">
                            <table cellpadding="0" cellspacing="0" border="0" width="600">
                              <tr>
                                <td bgcolor="#007BFF" align="center" style="padding: 20px; font-family: Montserrat, sans-serif;">
                                  <h1 style="color: white; font-weight: bold;">A seller has contacted you!</h1>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 20px; font-family: Montserrat, sans-serif;" valign="middle" align="center">
                                  <h2>${userName} wants to connect about your ${data.bookName} book of ${data.grade}!</h2>
                                  <p>Log in to Book Exchange Inventure to contact them!</p>
                                  <p>http://localhost:5501/dashboard/home/dashboard.html</p>
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
                    })   
                    document.querySelector(".rejectResultsBtn").addEventListener("click", () => {
                      firestore.collection("matchedRequests").doc(data.buyerUid + "_" + userUid).delete()
                    })             
                    })
                    .catch((error) => {
                      console.error("Error loading image:", error);
                    });
                })
                .catch((error) => {
                  console.error("Error removing document: ", error);
                });
              }).catch((error) => {
                console.error("Error updating document: ", error);
              });
            });
        }
      })
      .catch((error) => {
        console.error("Error querying buyerCollection: ", error);
      });
  } else {
    console.error("Please select a book, grade, and an image.");
  }
  fileInput.value = '';
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
      <p><i class="fa-solid fa-user"></i> ${data.buyerName}</p>
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


function scanBuyers(value) {
  if(value !== '') {
    document.querySelector(".card-wrapper").innerHTML = '';
    document.querySelector(".not-found-div-search").style.display = "none";
    firestore
    .collection("buyerCollection")
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
    .collection("buyerCollection")
    .where("grade", "==", value)
    .get()
    .then((querySnapshot) => {
      if (!querySnapshot.empty) {
        querySnapshot.forEach(doc => {
          const data = doc.data();
          createCard(data);
        })
      } else {
        document.querySelector(".not-found-div-search").style.display = "flex";
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
    .collection("buyerCollection")
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
        
  buyers_checked = true;
  checkLoadingStatus();
}

function scanUsers(uid) {
  firestore
    .collection("buyerCollection")
    .where("buyerUid", "==", uid)
    .get()
    .then((querySnapshot) => {
      if (!querySnapshot.empty) {
        let doc = querySnapshot.docs[0];
        const data = doc.data();
        const timestamp = data.timestamp;
        const jsDate = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1e6);
        
        const day = jsDate.getDate().toString().padStart(2, '0');
        const month = (jsDate.getMonth() + 1).toString().padStart(2, '0');
        const year = jsDate.getFullYear();
        
        const formattedDate = `${day}/${month}/${year}`;
        console.log(formattedDate);
        
        createTableItem(data, formattedDate);
      } else {
        document.querySelector(".table-container").style.filter = "blur(10px)";
        document.querySelector(".not-found-div-table").style.display = "flex";
      }
      users_checked = true;
      checkLoadingStatus();
    })
    .catch((error) => {
      console.error(error);
    });
}


document.addEventListener("DOMContentLoaded", () => {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      console.log(user.uid)
      checkChats();
      scanBuyers('');
      scanUsers(user.uid);
    } else {
      window.location.href = "../login/login.html"
    }
  });
});

let chats_checked = false;
let buyers_checked = false;
let users_checked = false;

function checkLoadingStatus() {
  if (chats_checked && users_checked && buyers_checked) {
    const loadingContainer = document.querySelector(".loadingScreen");
    loadingContainer.classList.add("loading-slide-out");
  }
}

function searchReq() {
  let inputValue = document.querySelector(".searchBar").value;
  if(inputValue !== '') {
    let capitalized = inputValue.charAt(0).toUpperCase() + inputValue.slice(1);
    scanBuyers(capitalized);
  } else {
  }
}

document.querySelector(".searchBtn").addEventListener("click", () => {
  searchReq();
});

document.querySelector(".backButton").addEventListener("click", () => {
  scanBuyers('');
  document.querySelector(".backButton").style.display = "none";
  document.querySelector(".not-found-div-search").style.display = "none";
})

document.querySelector(".not-found-div-table").addEventListener("click", () => {
  modal.style.display = "flex";
})

document.querySelector(".log-out-item").addEventListener("click", () => {
  firebase.auth().signOut();
})

document.querySelector(".close-search").addEventListener("click", () => {
  document.querySelector(".searchOverlay").style.transform = "translateY(-100%)";
});

document.querySelector(".close-results").addEventListener("click", () => {
  document.querySelector(".resultsOverlay").style.transform = "translateY(-100%)";
});