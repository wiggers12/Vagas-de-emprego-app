// main.js
import { auth, onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, db, collection, getDocs, doc, getDoc, setDoc, updateDoc, storage, ref, uploadBytes, getDownloadURL } from "./firebase.js";

const appContainer = document.getElementById('app');

const loginTemplate = `
  <div class="container d-flex justify-content-center align-items-center" style="min-height: 100vh;">
    <div class="card-login p-4">
      <h2 class="text-center mb-4">Acessar Vagas App</h2>
      <form id="authForm">
        <div class="form-box border rounded-3 p-4">
          <input type="email" id="email" class="form-control mb-3" placeholder="E-mail" required>
          <input type="password" id="senha" class="form-control mb-3" placeholder="Senha" required>
          <button type="submit" class="btn btn-custom-success w-100">Entrar / Cadastrar</button>
        </div>
      </form>
      <p class="text-center mt-3 text-danger" id="authMessage"></p>
    </div>
  </div>
`;

const dashboardTemplate = `
  <nav class="navbar navbar-expand-lg navbar-light bg-white border-bottom">
    <div class="container-fluid container main-container d-flex justify-content-between align-items-center">
      <a class="navbar-brand" href="#">
        <h4 class="mb-0">Vagas App</h4>
      </a>
      <div class="d-flex align-items-center">
        <span class="me-3" id="welcomeMessage">Olá!</span>
        <a href="#perfil" id="perfilBtn" class="btn btn-secondary me-2">Meu Perfil</a>
        <button class="btn btn-danger" id="logoutBtn">Sair</button>
      </div>
    </div>
  </nav>
  <div class="container main-container">
    <h2 class="mb-4">Vagas Disponíveis</h2>
    <div id="vagasContainer" class="row row-cols-1 g-4">
      </div>
  </div>
`;

const perfilTemplate = `
  <nav class="navbar navbar-expand-lg navbar-light bg-white border-bottom">
    <div class="container-fluid container main-container d-flex justify-content-between align-items-center">
      <a class="navbar-brand" href="#">
        <h4 class="mb-0">Vagas App</h4>
      </a>
      <div class="d-flex align-items-center">
        <span class="me-3" id="welcomeMessage">Olá!</span>
        <a href="#dashboard" id="dashboardBtn" class="btn btn-secondary me-2">Dashboard</a>
        <button class="btn btn-danger" id="logoutBtn">Sair</button>
      </div>
    </div>
  </nav>
  <div class="container main-container mt-4">
    <div class="card shadow-sm profile-card">
      <h2 class="text-center mb-4">Meu Perfil</h2>
      <form id="perfilForm">
        <div class="mb-3">
          <label for="nome" class="form-label">Nome Completo</label>
          <input type="text" class="form-control" id="nome" required>
        </div>
        <div class="mb-3">
          <label for="telefone" class="form-label">Telefone</label>
          <input type="tel" class="form-control" id="telefone">
        </div>
        <div class="mb-3">
          <label for="localizacao" class="form-label">Localização</label>
          <input type="text" class="form-control" id="localizacao">
        </div>
        <div class="mb-3">
          <label for="sobreMim" class="form-label">Sobre Mim</label>
          <textarea class="form-control" id="sobreMim" rows="4"></textarea>
        </div>
        <button type="submit" class="btn btn-success w-100 mb-3">Salvar Perfil</button>
        <div id="statusPerfil" class="mt-2 text-center"></div>
      </form>
      <hr class="my-4">
      <h3 class="mb-3">Currículo</h3>
      <div id="curriculoStatus" class="mb-3"></div>
      <form id="curriculoForm">
        <div class="mb-3">
          <label for="curriculoFile" class="form-label">Upload de Currículo</label>
          <input type="file" class="form-control" id="curriculoFile" accept=".pdf,.doc,.docx">
        </div>
        <button type="submit" class="btn btn-primary w-100">Upload Currículo</button>
        <div id="statusCurriculo" class="mt-2 text-center"></div>
      </form>
    </div>
  </div>
`;

// Lógica para renderizar o conteúdo
function renderContent(template) {
  appContainer.innerHTML = template;

  if (template === loginTemplate) {
    const authForm = document.getElementById('authForm');
    const authMessage = document.getElementById('authMessage');

    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = authForm.email.value;
      const senha = authForm.senha.value;
      authMessage.textContent = 'Verificando...';

      try {
        await signInWithEmailAndPassword(auth, email, senha);
      } catch (loginError) {
        if (loginError.code === 'auth/user-not-found') {
          try {
            await createUserWithEmailAndPassword(auth, email, senha);
            authMessage.textContent = 'Conta criada com sucesso!';
          } catch (registerError) {
            authMessage.textContent = registerError.message;
          }
        } else {
          authMessage.textContent = loginError.message;
        }
      }
    });
  } else if (template === dashboardTemplate) {
    const welcomeMessage = document.getElementById('welcomeMessage');
    const logoutBtn = document.getElementById('logoutBtn');
    const vagasContainer = document.getElementById('vagasContainer');
    const perfilBtn = document.getElementById('perfilBtn');

    logoutBtn.addEventListener('click', async () => {
      await signOut(auth);
    });

    welcomeMessage.textContent = `Olá, ${auth.currentUser.email}!`;
    carregarVagas();
  } else if (template === perfilTemplate) {
    const welcomeMessage = document.getElementById('welcomeMessage');
    const logoutBtn = document.getElementById('logoutBtn');
    const perfilForm = document.getElementById('perfilForm');
    const curriculoForm = document.getElementById('curriculoForm');
    const statusPerfil = document.getElementById('statusPerfil');
    const statusCurriculo = document.getElementById('statusCurriculo');
    const curriculoStatus = document.getElementById('curriculoStatus');

    logoutBtn.addEventListener('click', async () => {
      await signOut(auth);
    });
    welcomeMessage.textContent = `Olá, ${auth.currentUser.email}!`;
    carregarPerfil(auth.currentUser.uid, perfilForm, statusCurriculo, curriculoStatus);

    perfilForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      salvarPerfil(auth.currentUser.uid, perfilForm, statusPerfil);
    });

    curriculoForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      uploadCurriculo(auth.currentUser.uid, curriculoForm, statusCurriculo);
    });
  }
}

// Lógica de Roteamento para a SPA
window.addEventListener('hashchange', () => {
  if (window.location.hash === '#perfil') {
    renderContent(perfilTemplate);
  } else {
    renderContent(dashboardTemplate);
  }
});


// Funções do Dashboard
async function carregarVagas() {
  const vagasContainer = document.getElementById('vagasContainer');
  vagasContainer.innerHTML = '<h4 class="text-center">Carregando vagas...</h4>';
  try {
    const querySnapshot = await getDocs(collection(db, "vagas"));
    vagasContainer.innerHTML = '';
    if (querySnapshot.empty) {
      vagasContainer.innerHTML = '<h4 class="text-center">Nenhuma vaga disponível no momento.</h4>';
      return;
    }
    
    querySnapshot.forEach((doc) => {
      const vaga = doc.data();
      const vagaHTML = `
        <div class="col">
          <div class="card job-card shadow-sm">
            <div class="card-body">
              <h5 class="card-title">${vaga.titulo}</h5>
              <h6 class="card-subtitle mb-2 text-muted">${vaga.empresa}</h6>
              <p class="card-text mb-2">Localização: ${vaga.localizacao}</p>
              <p class="card-text">Salário: ${vaga.salario || 'A combinar'}</p>
              <p class="card-text">Descrição: ${vaga.descricao}</p>
              <button class="btn btn-primary mt-2">Candidatar-se</button>
            </div>
          </div>
        </div>
      `;
      vagasContainer.innerHTML += vagaHTML;
    });
  } catch (error) {
    console.error("Erro ao carregar vagas:", error);
    vagasContainer.innerHTML = '<h4 class="text-center text-danger">Erro ao carregar as vagas.</h4>';
  }
}

// Funções do Perfil
async function carregarPerfil(uid, perfilForm, statusCurriculo, curriculoStatus) {
  const userRef = doc(db, "usuarios", uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const data = userSnap.data();
    perfilForm.nome.value = data.nome || '';
    perfilForm.telefone.value = data.telefone || '';
    perfilForm.localizacao.value = data.localizacao || '';
    perfilForm.sobreMim.value = data.sobreMim || '';
    if (data.curriculoURL) {
      curriculoStatus.innerHTML = `<p>Currículo atual: <a href="${data.curriculoURL}" target="_blank">Ver</a></p>`;
    }
  } else {
    await setDoc(userRef, { email: auth.currentUser.email });
  }
}

async function salvarPerfil(uid, perfilForm, statusPerfil) {
  statusPerfil.textContent = 'Salvando perfil...';
  const userRef = doc(db, "usuarios", uid);
  try {
    await updateDoc(userRef, {
      nome: perfilForm.nome.value,
      telefone: perfilForm.telefone.value,
      localizacao: perfilForm.localizacao.value,
      sobreMim: perfilForm.sobreMim.value
    });
    statusPerfil.textContent = 'Perfil salvo com sucesso!';
  } catch (error) {
    statusPerfil.textContent = 'Erro ao salvar o perfil.';
    console.error("Erro ao salvar perfil:", error);
  }
}

async function uploadCurriculo(uid, curriculoForm, statusCurriculo) {
  const file = curriculoForm.curriculoFile.files[0];
  if (!file) {
    statusCurriculo.textContent = 'Por favor, selecione um arquivo.';
    return;
  }
  statusCurriculo.textContent = 'Enviando currículo...';
  const storageRef = ref(storage, `curriculos/${uid}/${file.name}`);
  const userRef = doc(db, "usuarios", uid);

  try {
    const uploadTask = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(uploadTask.ref);
    await updateDoc(userRef, { curriculoURL: url });
    statusCurriculo.innerHTML = `Currículo enviado com sucesso! <a href="${url}" target="_blank">Ver</a>`;
  } catch (error) {
    statusCurriculo.textContent = 'Erro ao enviar o currículo.';
    console.error("Erro ao enviar currículo:", error);
  }
}


// Verifica o estado da autenticação do usuário e renderiza a página correta
onAuthStateChanged(auth, (user) => {
  if (user) {
    if (window.location.hash === '#perfil') {
      renderContent(perfilTemplate);
    } else {
      renderContent(dashboardTemplate);
    }
  } else {
    renderContent(loginTemplate);
  }
});
