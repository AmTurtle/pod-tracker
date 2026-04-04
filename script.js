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

const firebaseConfig = {
  apiKey: "AIzaSyDMd6zwD1WaXkoOI6NSzLCQ6xxdDlDp2Wg",
  authDomain: "pod-tracker-f2096.firebaseapp.com",
  databaseURL: "https://pod-tracker-f2096-default-rtdb.firebaseio.com",
  projectId: "pod-tracker-f2096",
  storageBucket: "pod-tracker-f2096.firebasestorage.app",
  messagingSenderId: "1090944262591",
  appId: "1:1090944262591:web:1d4d7148463950745d410a"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const spots = [
  "Left - Inward",
  "Right - Inward",
  "Left - Outward",
  "Right - Outward"
];

let index = 0;
let dbRef = null;

const currentEl = document.getElementById("current");
const nextEl = document.getElementById("next");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userBar = document.getElementById("userBar");
const userText = document.getElementById("userText");
const changeBtn = document.getElementById("changeBtn");

function updateDisplay() {
  currentEl.innerText = spots[index];
  nextEl.innerText = spots[(index + 1) % spots.length];
}

updateDisplay();

await setPersistence(auth, browserLocalPersistence);

loginBtn.onclick = async () => {
  await signInWithPopup(auth, provider);
};

logoutBtn.onclick = async () => {
  await signOut(auth);
};

onAuthStateChanged(auth, (user) => {
  if (user) {
    loginBtn.style.display = "none";
    userBar.style.display = "flex";
    userText.textContent = `Logged in as ${user.email}`;

    dbRef = ref(db, "users/" + user.uid + "/podIndex");

    onValue(dbRef, (snapshot) => {
      index = snapshot.exists() ? snapshot.val() : 0;
      updateDisplay();
    });

    changeBtn.disabled = false;
    changeBtn.onclick = async () => {
      index = (index + 1) % spots.length;
      await set(dbRef, index);
    };
  } else {
    loginBtn.style.display = "block";
    userBar.style.display = "none";
    changeBtn.disabled = true;
  }
});