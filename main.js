// main.js
import { auth, onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "./firebase.js";
import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const appContainer = document.getElementById('app');

const loginTemplate = `
  <div class="container d-flex justify-content-center align-items-center" style="min-height: 100vh;">
    <div class="d-flex flex-column flex-md-row gap-3 p-4 card-login">
      <div class="form-box border rounded-3 p-4">
        <h2 class="text-center mb-4">Criar Conta</h2>
        <form id="cadastroForm">
          <input type="email" id="cadastroEmail" class="form-control mb-3" placeholder="E-mail" required>
          <input type="password" id="cadastroSenha" class="form-control mb-3" placeholder="Senha" required>
          <button type="submit" class="btn btn-custom-success w-100">Cadastrar</button>
        </form>
        <p class="text-center mt-3 text-danger" id="cadastroMessage"></p>
      </div>
      <div class="form-box border rounded-3 p-4">
        <h2 class="text-center mb-4">Entrar</h2>
        <form id="loginForm">
          <input type="email" id="loginEmail" class="form-control mb-3" placeholder="E-mail" required>
          <input type="password" id="loginSenha" class="form-control mb-3" placeholder="Senha" required>
          <button type="submit" class="btn btn-custom-success w-100">Entrar</button>
        </form>
        <p class="text-center mt-3 text-danger" id="loginMessage"></p>
      </div>
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
        <a href="#perfil" class="btn btn-secondary me-2">Meu Perfil</a>
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

// Lógica para renderizar o conteúdo
function renderContent(template) {
  appContainer.innerHTML = template;

  if (template === loginTemplate) {
    // Lógica para os formulários de login e cadastro
    const cadastroForm = document.getElementById('cadastroForm');
    const loginForm = document.getElementById('loginForm');
    const cadastroMessage = document.getElementById('cadastroMessage');
    const loginMessage = document.getElementById('loginMessage');

    cadastroForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = cadastroForm.cadastroEmail.value;
      const senha = cadastroForm.cadastroSenha.value;
      try {
        await createUserWithEmailAndPassword(auth, email, senha);
        cadastroMessage.textContent = 'Usuário cadastrado com sucesso!';
      } catch (error) {
        cadastroMessage.textContent = error.message;
      }
    });

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = loginForm.loginEmail.value;
      const senha = loginForm.loginSenha.value;
      try {
        await signInWithEmailAndPassword(auth, email, senha);
      } catch (error) {
        loginMessage.textContent = error.message;
      }
    });
  } else if (template === dashboardTemplate) {
    const welcomeMessage = document.getElementById('welcomeMessage');
    const logoutBtn = document.getElementById('logoutBtn');
    const vagasContainer = document.getElementById('vagasContainer');

    logoutBtn.addEventListener('click', async () => {
      await signOut(auth);
    });

    welcomeMessage.textContent = `Olá, ${auth.currentUser.email}!`;
    carregarVagas();
  }
}

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

// Verifica o estado da autenticação do usuário e renderiza a página correta
onAuthStateChanged(auth, (user) => {
  if (user) {
    renderContent(dashboardTemplate);
  } else {
    renderContent(loginTemplate);
  }
});
