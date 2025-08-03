// main.js
import { auth, onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, db, collection, addDoc, getDocs, doc, getDoc, setDoc, updateDoc, storage, ref, uploadBytes, getDownloadURL } from "./firebase.js";

const appContainer = document.getElementById('app');

const loginTemplate = `
  <div class="container d-flex justify-content-center align-items-center" style="min-height: 100vh;">
    <div class="card-login p-4">
      <h2 class="text-center mb-4">Acessar Vagas App</h2>
      <form id="authForm">
        <div class="form-box border rounded-3 p-4">
          <label for="userType" class="form-label">Você é:</label>
          <select id="userType" class="form-select mb-3">
            <option value="candidato">Candidato</option>
            <option value="empresa">Empresa</option>
          </select>
          <input type="email" id="email" class="form-control mb-3" placeholder="E-mail" required>
          <input type="password" id="senha" class="form-control mb-3" placeholder="Senha" required>
          <button type="submit" class="btn btn-custom-success w-100">Entrar / Cadastrar</button>
        </div>
      </form>
      <p class="text-center mt-3 text-danger" id="authMessage"></p>
    </div>
  </div>
`;

const candidatoDashboardTemplate = `
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

const empresaDashboardTemplate = `
  <nav class="navbar navbar-expand-lg navbar-light bg-white border-bottom">
    <div class="container-fluid container main-container d-flex justify-content-between align-items-center">
      <a class="navbar-brand" href="#">
        <h4 class="mb-0">Vagas App (Empresa)</h4>
      </a>
      <div class="d-flex align-items-center">
        <span class="me-3" id="welcomeMessage">Olá!</span>
        <button class="btn btn-danger" id="logoutBtn">Sair</button>
      </div>
    </div>
  </nav>
  <div class="container main-container">
    <h2 class="mb-4">Adicionar Nova Vaga</h2>
    <form id="vagaForm" class="bg-white p-4 rounded-3 shadow-sm">
      <div class="mb-3">
        <label for="titulo" class="form-label">Título da Vaga</label>
        <input type="text" class="form-control" id="titulo" placeholder="Ex: Desenvolvedor Front-end" required>
      </div>
      <div class="mb-3">
        <label for="empresa" class="form-label">Empresa</label>
        <input type="text" class="form-control" id="empresa" placeholder="Ex: Vagas App Ltda." required>
      </div>
      <div class="mb-3">
        <label for="localizacao" class="form-label">Localização</label>
        <input type="text" class="form-control" id="localizacao" placeholder="Ex: Remoto ou São Paulo, SP" required>
      </div>
      <div class="mb-3">
        <label for="salario" class="form-label">Salário (Opcional)</label>
        <input type="text" class="form-control" id="salario" placeholder="Ex: R$ 3.000 - R$ 5.000">
      </div>
      <div class="mb-3">
        <label for="descricao" class="form-label">Descrição da Vaga</label>
        <textarea class="form-control" id="descricao" rows="5" placeholder="Detalhes da vaga..." required></textarea>
      </div>
      <button type="submit" class="btn btn-success w-100">Adicionar Vaga</button>
      <div id="statusMessage" class="mt-3 text-center"></div>
    </form>
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
      const userType = authForm.userType.value;
      authMessage.textContent = 'Verificando...';

      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, senha);
        await verificarESalvarTipoUsuario(userCredential.user.uid, userType);
      } catch (loginError) {
        if (loginError.code === 'auth/user-not-found') {
          try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
            await verificarESalvarTipoUsuario(userCredential.user.uid, userType);
            authMessage.textContent = 'Conta criada com sucesso!';
          } catch (registerError) {
            authMessage.textContent = registerError.message;
          }
        } else {
          authMessage.textContent = loginError.message;
        }
      }
    });
  } else if (template === candidatoDashboardTemplate) {
    const welcomeMessage = document.getElementById('welcomeMessage');
    const logoutBtn = document.getElementById('logoutBtn');
    const vagasContainer = document.getElementById('vagasContainer');
    logoutBtn.addEventListener('click', async () => { await signOut(auth); });
    welcomeMessage.textContent = `Olá, ${auth.currentUser.email}!`;
    carregarVagas();
  } else if (template === empresaDashboardTemplate) {
    const welcomeMessage = document.getElementById('welcomeMessage');
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', async () => { await signOut(auth); });
    welcomeMessage.textContent = `Olá, ${auth.currentUser.email}!`;
    const vagaForm = document.getElementById('vagaForm');
    const statusMessage = document.getElementById('statusMessage');
    vagaForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      postarVaga(auth.currentUser.uid, vagaForm, statusMessage);
    });
  } else if (template === perfilTemplate) {
    const welcomeMessage = document.getElementById('welcomeMessage');
    const logoutBtn = document.getElementById('logoutBtn');
    const perfilForm = document.getElementById('perfilForm');
    const curriculoForm = document.getElementById('curriculoForm');
    const statusPerfil = document.getElementById('statusPerfil');
    const statusCurriculo = document.getElementById('statusCurriculo');
    const curriculoStatus = document.getElementById('curriculoStatus');
    logoutBtn.addEventListener('click', async () => { await signOut(auth); });
    welcomeMessage.textContent = `Olá, ${auth.currentUser.email}!`;
    carregarPerfil(auth.currentUser.uid, perfilForm, curriculoStatus);
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
  const user = auth.currentUser;
  if (!user) { renderContent(loginTemplate); return; }
  verificarTipoUsuarioEExibirDashboard(user.uid);
});

// Funções de Autenticação e Usuário
async function verificarESalvarTipoUsuario(uid, userType) {
  const userRef = doc(db, "usuarios", uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    await setDoc(userRef, { email: auth.currentUser.email, tipoUsuario: userType });
  }
}

async function verificarTipoUsuarioEExibirDashboard(uid) {
  const userRef = doc(db, "usuarios", uid);
  const userSnap = await getDoc(userRef);
  const userType = userSnap.data()?.tipoUsuario || 'candidato';
  if (userType === 'candidato') {
    if (window.location.hash === '#perfil') {
      renderContent(perfilTemplate);
    } else {
      renderContent(candidatoDashboardTemplate);
    }
  } else {
    renderContent(empresaDashboardTemplate);
  }
}

// Funções do Dashboard do Candidato
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

// Funções do Dashboard da Empresa
async function postarVaga(uid, vagaForm, statusMessage) {
  statusMessage.textContent = 'Adicionando vaga...';
  const novaVaga = {
    titulo: vagaForm.titulo.value,
    empresa: vagaForm.empresa.value,
    localizacao: vagaForm.localizacao.value,
    salario: vagaForm.salario.value,
    descricao: vagaForm.descricao.value,
    empresaUID: uid,
    candidatos: []
  };
  try {
    await addDoc(collection(db, "vagas"), novaVaga);
    statusMessage.textContent = 'Vaga adicionada com sucesso!';
    vagaForm.reset();
  } catch (e) {
    statusMessage.textContent = 'Erro ao adicionar a vaga: ' + e.message;
    console.error("Erro ao adicionar a vaga:", e);
  }
}

// Funções do Perfil do Candidato
async function carregarPerfil(uid, perfilForm, curriculoStatus) {
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

// Verifica o estado da autenticação e renderiza a página correta
onAuthStateChanged(auth, (user) => {
  if (user) {
    verificarTipoUsuarioEExibirDashboard(user.uid);
  } else {
    renderContent(loginTemplate);
  }
});
