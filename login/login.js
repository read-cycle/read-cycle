const themeChosen = sessionStorage.getItem("selectedTheme");

function applyTheme(theme) {
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

document.addEventListener("DOMContentLoaded", function () {
    if(themeChosen == "bright") {
        applyTheme("brightLogin");
    } else if(themeChosen == "dark") {
        applyTheme("darkLogin");
    } else {
        applyTheme("forestLogin")
    }
});

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
const db = firebase.firestore();
let index = 0;

db.collection("reviews")
    .limit(5)
    .get()
    .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {

            let data = doc.data();

            for (let i = 0; i < Math.floor(data.rating); i++) {
                const star = document.createElement("i");
                star.classList.add("fa-solid", "fa-star", "star");
                document.querySelectorAll(".review-star-container")[index].appendChild(star);
            }            
        
            if (data.rating - Math.floor(data.rating) !== 0) {
                const halfstar = document.createElement("i");
                halfstar.classList.add("fa-solid", "fa-star-half", "star");
                document.querySelectorAll(".review-star-container")[index].appendChild(halfstar);
            }

            console.log(data);
            document.querySelectorAll(".carousel-caption-header")[index].innerText = data.user;
            document.querySelectorAll(".carousel-caption-body")[index].innerText = data.review;
            index++;
        });
    })
    .catch((error) => {
        console.error("Error getting documents:", error);
    });


    document.getElementById("signUpLink").addEventListener("click", () => {
        document.querySelector(".carouselContainer").style.left = "45.45%";
    })

    document.getElementById("logInLink").addEventListener("click", () => {
        document.querySelector(".carouselContainer").style.left = "0";
    })

    function signInWithGoogle() {
        var provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider)
          .then((result) => {
            userName = result.additionalUserInfo.profile.given_name;
            userID = result.additionalUserInfo.profile.id;
            sessionStorage.setItem('username', userName);
            sessionStorage.setItem('userid', userID);
            window.location.href = "../dashboard/dashboard.html";
          })
          .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(errorCode, errorMessage);
          });
    }
    
    function signInWithEmailAndPassword(email, password) {
      firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          sessionStorage.setItem('username', user.displayName);
          sessionStorage.setItem('userID', user.uid);
          window.location.href = "../dashboard/dashboard.html";
        })
        .catch((error) => {
          window.alert('Sign-in error:' + error);
        });
    }
    
    function signUpWithEmailAndPassword(email, password, name) {
      return firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          user.updateProfile({
            displayName: name,
          }).then(function() {
            sessionStorage.setItem('username', user.displayName);
            sessionStorage.setItem('userID', user.uid);
          }).catch(function(error) {
            window.alert(error)
          })
        })
        .catch((error) => {
          throw error 
        });
    }
    
    
    function SignUpButton() {
        const email = document.getElementById("emailS").value;
        const password = document.getElementById("passwordS").value;
        const name = document.getElementById("name").value;
        signUpWithEmailAndPassword(email, password, name);
    }
      
    function SignInButton() {
          const email = document.getElementById("emailL").value;
          const password = document.getElementById("passwordL").value;
          signInWithEmailAndPassword(email, password)
    }