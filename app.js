import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDPLgqyyxiM_68bM9wS6Plk2d9bOS8ip7E",
  authDomain: "monky-4a54f.firebaseapp.com",
  projectId: "monky-4a54f",
  storageBucket: "monky-4a54f.firebasestorage.app",
  messagingSenderId: "772610971849",
  appId: "1:772610971849:web:09d9da08e3d0046dc25518",
  measurementId: "G-D5QN9NJVHN"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function getCounter() {
  const ref = doc(db, "appData", "contador");
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data().value : 0;
}

export async function setCounter(value) {
  const ref = doc(db, "appData", "contador");
  await setDoc(ref, { value });
}

window.clickCounter = async function () {
  let count = await getCounter();
  count++;
  document.getElementById('count').textContent = `Has pulsado ${count} veces.`;
  await setCounter(count);
};

(async () => {
  const count = await getCounter();
  document.getElementById('count').textContent = `Has pulsado ${count} veces.`;
})();
