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
    newLink.href = `${theme}.css`;
    newLink.classList.add("theme-stylesheet");
    document.head.appendChild(newLink);
}

function generateNotif(header, book, grade, doc, type) {

  let data = doc.data();
  data.messages = [];

  const itemDiv = document.createElement('div');
  itemDiv.className = 'notification-item';

  const itemDivText = document.createElement('div');
  itemDivText.className = 'item-text';
  itemDiv.appendChild(itemDivText);
  
  const itemDivBtns = document.createElement('div');
  itemDivBtns.className = 'button-flex';
  itemDiv.appendChild(itemDivBtns);

  const itemDivHeader = document.createElement('p');
  itemDivHeader.textContent = header;
  itemDivHeader.classList.add('notification-header');
  itemDivText.appendChild(itemDivHeader);

  const itemDivParagraph = document.createElement('p');
  itemDivParagraph.textContent = `wants to connect about a ${book} book of ${grade}.`;
  itemDivParagraph.classList.add('notification-paragraph');
  itemDivText.appendChild(itemDivParagraph);

  const confirmBtn = document.createElement('button');
  confirmBtn.textContent = 'Confirm';
  confirmBtn.classList.add('confirmBtn');
  itemDivBtns.appendChild(confirmBtn);

  const rejectBtn = document.createElement('button');
  rejectBtn.textContent = 'Reject';
  rejectBtn.classList.add('rejectBtn');
  itemDivBtns.appendChild(rejectBtn);

  document.querySelector(".notifications-container").appendChild(itemDiv);

  confirmBtn.addEventListener("click", () => {
    console.log("AAAAAAAAAAAAAAAAAA")
    if((type === "b" && data.sC) || (type === "s" && data.bC)) {
      firestore.collection("messageRooms")
      .doc(data.buyerUid + "_" + data.sellerUid)
      .set(data)
      .then(() => {
        console.log("Document added to 'messageRooms' collection.");
        firestore.collection("matchedRequests").doc(data.buyerUid + "_" + data.sellerUid).delete()
        .then(() => {
          console.log("Document successfully deleted.");
        })
        .catch((error) => {
          console.error("Error removing document: ", error);
        });
      })
      .catch((error) => {
        console.error("Error adding document to 'messageRooms' collection: ", error);
      });
      console.log(type)
    } else if(type === "s") {
      firestore.collection("matchedRequests").doc(data.buyerUid + "_" + data.sellerUid)
      .update({ sellerName: userName, sellerUid: userUid, sC: true })
      console.log(type)
    } else {
      firestore.collection("matchedRequests").doc(data.buyerUid + "_" + data.sellerUid)
      .update({ buyerName: userName, buyerUid: userUid, bC: true })
      console.log(type)
    }
  })

  rejectBtn.addEventListener("click", () => {
    firestore.collection("matchedRequests").doc(data.buyerUid + "_" + data.sellerUid).delete()
      .then(() => {
        console.log("Document successfully deleted.");
      })
      .catch((error) => {
        console.error("Error removing document: ", error);
      });
  })
}

function searchDatabase(room, docID, uid, index, dataReason) {
  return new Promise((resolve, reject) => {
    firestore
      .collection(room)
      .where(docID, "==", uid)
      .get()
      .then((querySnapshot) => {
        if (!querySnapshot.empty) {
          const extraTextLabel = document.querySelectorAll(".extraText")[index];
          const additionalRequestsCount = querySnapshot.size - 1;
          if (additionalRequestsCount > 0) {
            extraTextLabel.innerText = `and ${additionalRequestsCount} more...`;
          } else {
            extraTextLabel.innerText = "";
          }
          querySnapshot.forEach(doc => {
            const data = doc.data();
            if (data.hasOwnProperty(dataReason)) {
              const headerElement = document.querySelectorAll('.jsUpdateHeader')[index];
              headerElement.innerText = data[dataReason];
              const headerImage = document.querySelectorAll(".header-image")[index];
              const fadedBackgroundDiv = document.querySelectorAll('.background-image-faded')[index];
              const iconClass = subjectIcons[data.bookName];
              fadedBackgroundDiv.innerHTML = `<i class="fa-solid ${iconClass}"></i>`;
              headerImage.innerHTML = `<i class="fa-solid ${iconClass}"></i>`;
              resolve("success");
            } else {
              console.error(`Field ${dataReason} does not exist in the retrieved data.`);
              reject(new Error(`Field ${dataReason} does not exist in the retrieved data.`));
            }
          });
        } else {
          document.querySelectorAll(".card-header")[index].style.display = "none";
          document.querySelectorAll(".overlayNone")[index].style.display = "flex";
          resolve("no results");
        }
      })
      .catch((error) => {
        console.error("Error getting documents: ", error);
        reject(error);
      });
  });
}


function getRequests() {
  firestore
  .collection("buyerCollection")
  .orderBy("timestamp", "desc")
  .get()
  .then((querySnapshot) => {
    if (!querySnapshot.empty) {
      let doc = querySnapshot.docs[0]
      let data = doc.data();
      document.querySelector(".buyer-req-card-recent").innerText = data.bookName;
      const headerImage = document.querySelectorAll(".header-image")[3];
      const fadedBackgroundDiv = document.querySelectorAll('.background-image-faded')[3];
      const iconClass = subjectIcons[data.bookName];
      fadedBackgroundDiv.innerHTML = `<i class="fa-solid ${iconClass}"></i>`;
      headerImage.innerHTML = `<i class="fa-solid ${iconClass}"></i>`;
    } else {
      document.querySelectorAll(".card-header")[3].style.display = "none";
      document.querySelectorAll(".overlayNone")[3].style.display = "block";
    }
  })

  firestore
  .collection("sellerCollection")
  .orderBy("timestamp", "desc")
  .get()
  .then((querySnapshot) => {
    if (!querySnapshot.empty) {
      let doc = querySnapshot.docs[0];
      let data = doc.data();
      document.querySelector(".seller-req-card-recent").innerText = data.bookName;
      const headerImage = document.querySelectorAll(".header-image")[4];
      const fadedBackgroundDiv = document.querySelectorAll('.background-image-faded')[4];
      const iconClass = subjectIcons[data.bookName];
      fadedBackgroundDiv.innerHTML = `<i class="fa-solid ${iconClass}"></i>`;
      headerImage.innerHTML = `<i class="fa-solid ${iconClass}"></i>`;
    } else {
      document.querySelectorAll(".card-header")[4].style.display = "none";
      document.querySelectorAll(".overlayNone")[4].style.display = "block";
    }
  })

  recent_requests = true;
  checkLoadingStatus();
}


function CheckMatchedReq() {
  console.log("CHECKING");

  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      userUid = user.uid;
      userName = user.displayName;
      firestore
        .collection("matchedRequests")
        .where("buyerUid", "==", userUid)
        .where("bC", "==", false)
        .get()
        .then((querySnapshot) => {
          if (!querySnapshot.empty) {
            querySnapshot.forEach(doc => {
              const data = doc.data();
              generateNotif(data.sellerName, data.bookName, data.grade, doc, "b");
            });
          }
        })
        .catch((error) => {
          console.error("Error getting buyer documents: ", error);
        });

      firestore
        .collection("matchedRequests")
        .where("sellerUid", "==", userUid)
        .where("sC", "==", false)
        .get()
        .then((querySnapshot) => {
          if (!querySnapshot.empty) {
            querySnapshot.forEach(doc => {
              const data = doc.data();
              generateNotif(data.buyerName, data.bookName, data.grade, doc, "s");
            });
          }
        })
        .catch((error) => {
          console.error("Error getting seller documents: ", error);
        });
    } else {
      window.location.href = "../login/login.html";
    }
  });

  matched_requests = true;
  checkLoadingStatus();
}

document.addEventListener("DOMContentLoaded", async () => {
  firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
      getRequests();
      let uid = user.uid;
      let username = user.displayName;
      document.querySelector(".userNameBox").innerText = `Welcome Back, ${username}!`
      CheckMatchedReq();
      await searchDatabase("buyerCollection", "buyerUid", uid, 0, "bookName");
      await searchDatabase("sellerCollection", "sellerUid", uid, 1, "bookName");
      const sellerResults = await searchDatabase("matchedRequests", "sellerUid", uid, 2, "bookName");
      if (sellerResults.length === 0) {
        await searchDatabase("matchedRequests", "buyerUid", uid, 2, "bookName");
      }
      database_requests = true;
      checkLoadingStatus();
    }
  });
});


let notif_toggle = false;

let matched_requests = false;
let recent_requests = false;
let database_requests = false;

document.getElementById("notification-item-nav").addEventListener("click", () => {
  if(notif_toggle == false) {
    document.querySelector(".notifications-container").style.display = "block";
    setTimeout(() => {
      document.querySelector(".notifications-container").style.opacity = "1";
    }, 10);
    notif_toggle = true;
  } else {
    document.querySelector(".notifications-container").style.opacity = "0";
    setTimeout(() => {
      document.querySelector(".notifications-container").style.display = "none";
    }, 500);
    notif_toggle = false;
  }
});

function checkLoadingStatus() {
  if (matched_requests && recent_requests && database_requests) {
    const loadingContainer = document.querySelector(".loadingScreen");
    loadingContainer.classList.add("loading-slide-out");
  }
}

function createTableItem(data) {

}

function scanUsers(uid) {
  firestore
    .collection("matchedRequests")
    .where("buyerUid", "==", uid)
    .where("sC", "==", false)
    .get()
    .then((querySnapshot) => {
      if (!querySnapshot.empty) {
        querySnapshot.forEach(doc => {
          const data = doc.data();
          
          createTableItem(data);
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

    firestore
    .collection("matchedRequests")
    .where("sellerUid", "==", uid)
    .where("bC", "==", false)
    .get()
    .then((querySnapshot) => {
      if (!querySnapshot.empty) {
        querySnapshot.forEach(doc => {
          const data = doc.data();
          
          createTableItem(data);
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

document.querySelector(".log-out-item").addEventListener("click", () => {
  firebase.auth().signOut();
})