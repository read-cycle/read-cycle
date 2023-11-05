const firebaseConfig = {
    apiKey: "AIzaSyBH2eoPxG880WsnH0LZlRUQg0Z0_oo2WX4",
    authDomain: "book-exchange-38d79.firebaseapp.com",
    databaseURL: "https://book-exchange-38d79-default-rtdb.firebaseio.com",
    projectId: "book-exchange-38d79",
    storageBucket: "book-exchange-38d79.appspot.com",
    messagingSenderId: "238743730779",
    appId: "1:238743730779:web:de9de6dcdd1a54efc2dd7e"
};

let userID = null;
let userName = null;
  
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

function signInWithGoogle() {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
      .then((result) => {
        userName = result.additionalUserInfo.profile.given_name;
        userID = result.additionalUserInfo.profile.id;
        sessionStorage.setItem('username', userName);
        sessionStorage.setItem('userid', userID);
        window.location.href = "/dashboard/home/dashboard.html";
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
      window.location.href = "/dashboard/home/dashboard.html";
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
    if(grade < 13 && grade > 0){
      signUpWithEmailAndPassword(email, password, name);
    } else {
      window.alert("Enter a valid grade")
    }
}
  
function SignInButton() {
      const email = document.getElementById("emailL").value;
      const password = document.getElementById("passwordL").value;
      signInWithEmailAndPassword(email, password)
}