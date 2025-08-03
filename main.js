// main.js
import { auth, onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, db, doc, setDoc, getDoc, collection } from './firebase.js';

// Função para verificar o tipo de usuário e redirecionar
async function verificarTipoUsuario(user) {
  const userRef = doc(db, "usuarios", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    // Se o usuário não existir no Firestore, redireciona para a página de perfil para completar o cadastro
    window.location.href = 'perfil-candidato.html'; 
  } else {
    const userType = userSnap.data().tipoUsuario;
    if (userType === 'empresa') {
      window.location.href = 'dashboard-empresa.html';
    } else {
      window.location.href = 'dashboard-candidato.html';
    }
  }
}

// Escuta o estado da autenticação em todas as páginas
onAuthStateChanged(auth, async (user) => {
  const path = window.location.pathname;
  if (user) {
    if (path.includes('auth.html') || path.endsWith('/')) {
      await verificarTipoUsuario(user);
    }
  } else {
    if (!path.includes('auth.html') && !path.endsWith('/')) {
      window.location.href = 'auth.html';
    }
  }
});

// Lógica de logout
window.logout = async () => {
  await signOut(auth);
  window.location.href = 'auth.html';
};

// Lógica de login e cadastro (agora no `auth.html`)
window.handleAuth = async (isRegistering) => {
  const emailInput = document.getElementById('email');
  const senhaInput = document.getElementById('senha');
  const userTypeSelect = document.getElementById('userType');
  const messageElement = document.getElementById('authMessage');

  const email = emailInput.value;
  const senha = senhaInput.value;
  const userType = userTypeSelect.value;
  
  messageElement.textContent = 'Verificando...';

  try {
    let userCredential;
    if (isRegistering) {
      userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      messageElement.textContent = 'Conta criada com sucesso!';
      await setDoc(doc(db, "usuarios", userCredential.user.uid), { 
        email: userCredential.user.email,
        tipoUsuario: userType 
      });
    } else {
      userCredential = await signInWithEmailAndPassword(auth, email, senha);
    }
    
    await verificarTipoUsuario(userCredential.user);
  } catch (error) {
    messageElement.textContent = error.message;
  }
};
