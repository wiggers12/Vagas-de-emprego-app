// firebase-utils.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// 🔑 Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC1WaaBD9XXRoMGgiKRU_qTLcQ5CdNHQKs",
  authDomain: "vagas-de-emprego-app.firebaseapp.com",
  projectId: "vagas-de-emprego-app",
  storageBucket: "vagas-de-emprego-app.appspot.com",
  messagingSenderId: "301719945007",
  appId: "1:301719945007:web:e2b5141d1fc941bd11ebda",
  measurementId: "G-JRJBBRWG2R"
};

// 🚀 Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 📌 Função: Salvar cadastro
export async function salvarAtleta(uid, dados) {
  try {
    await setDoc(doc(db, "atletas", uid), dados, { merge: true });
    return true;
  } catch (e) {
    console.error("Erro ao salvar:", e);
    return false;
  }
}

// 📌 Função: Buscar cadastro
export async function getAtleta(uid) {
  try {
    const ref = doc(db, "atletas", uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data();
    } else {
      return null;
    }
  } catch (e) {
    console.error("Erro ao buscar:", e);
    return null;
  }
}

export { auth, db };