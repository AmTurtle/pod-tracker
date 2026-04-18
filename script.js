import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDMd6zwD1WaXkoOI6NSzLCQ6xxdDlDp2Wg",
  authDomain: "pod-tracker-f2096.firebaseapp.com",
  databaseURL: "https://pod-tracker-f2096-default-rtdb.firebaseio.com",
  projectId: "pod-tracker-f2096",
  storageBucket: "pod-tracker-f2096.firebasestorage.app",
  messagingSenderId: "1090944262591",
  appId: "1:1090944262591:web:1d4d7148463950745d410a"
};

// initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// rotation spots
const spots = [
  "Left - Inward",
  "Right - Inward",
  "Left - Outward",
  "Right - Outward"
];

let index = 0;
let dbRef = null;

// elements
const currentEl = document.getElementById("current");
const nextEl = document.getElementById("next");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userBar = document.getElementById("userBar");
const userText = document.getElementById("userText");
const userPic = document.getElementById("userPic");
const changeBtn = document.getElementById("changeBtn");

// shorten email
function shortenEmail(email) {
  const [name, domain] = email.split("@");
  if (name.length <= 5) return email;
  return name.slice(0, 5) + "...@" + domain;
}

// update ui
function updateDisplay(showPlaceholder = false) {
  if (showPlaceholder) {
    currentEl.innerText = "---";
    nextEl.innerText = "---";
    return;
  }

  currentEl.innerText = spots[index];
  nextEl.innerText = spots[(index + 1) % spots.length];
}

updateDisplay(true);

// keep user logged in
await setPersistence(auth, browserLocalPersistence);

// login
loginBtn.onclick = async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error("Login failed:", error);
  }
};

// logout
logoutBtn.onclick = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

// auth state listener (auto login)
onAuthStateChanged(auth, (user) => {
  if (user) {
    // ui changes
    loginBtn.style.display = "none";
    userBar.style.display = "flex";

    userText.textContent = shortenEmail(user.email);
    userPic.src = user.photoURL || "https://placehold.co/32";

    // database reference
    dbRef = ref(db, "users/" + user.uid + "/podIndex");

    // sync data
    onValue(dbRef, (snapshot) => {
      index = snapshot.exists() ? snapshot.val() : 0;
      updateDisplay();
    });

    // button action
    changeBtn.disabled = false;
    changeBtn.onclick = async () => {
      if (!dbRef) return;
      index = (index + 1) % spots.length;
      await set(dbRef, index);
    };

  } else {
    // not logged in
    loginBtn.style.display = "block";
    userBar.style.display = "none";
    userText.textContent = "";
    userPic.src = "";
    dbRef = null;
    changeBtn.disabled = true;
    updateDisplay(true);
  }
});
