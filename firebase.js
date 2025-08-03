import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyC1WaaBD9XXRoMGgiKRU_qTLcQ5CdNHQKs",
  authDomain: "vagas-de-emprego-app.firebaseapp.com",
  projectId: "vagas-de-emprego-app",
  storageBucket: "vagas-de-emprego-app.firebasestorage.app",
  messagingSenderId: "301719945007",
  appId: "1:301719945007:web:30b341a9b931c51611ebda",
  measurementId: "G-FH70VN13V5"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Exporta as funções e serviços para uso em outros arquivos
export {
  auth,
  db,
  storage,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
};
