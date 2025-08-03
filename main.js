// main.js
import { auth, onAuthStateChanged, signOut } from "./firebase.js";

const appContainer = document.getElementById('app');

// Templates das páginas
const loginTemplate = `
  <div class="container d-flex justify-content-center align-items-center" style="min-height: 100vh;">
    <div class="d-flex flex-column flex-md-row gap-3 p-4 bg-white rounded-3 shadow-sm">
      <div class="form-box border rounded-3 p-4">
        <h2 class="text-center mb-4">Criar Conta</h2>
        <form id="cadastroForm">
          <input type="email" id="cadastroEmail" class="form-control mb-3" placeholder="E-mail" required>
          <input type="password" id="cadastroSenha" class="form-control mb-3" placeholder="Senha" required>
          <button type="submit" class="btn btn-success w-100">Cadastrar</button>
        </form>
        <p class="text-center mt-3 text-danger" id="cadastroMessage"></p>
      </div>
      <div class="form-box border rounded-3 p-4">
        <h2 class="text-center mb-4">Entrar</h2>
        <form id="loginForm">
          <input type="email" id="loginEmail" class="form-control mb-3" placeholder="E-mail" required>
          <input type="password" id="loginSenha" class="form-control mb-3" placeholder="Senha" required>
          <button type="submit" class="btn btn-success w-100">Entrar</button>
        </form>
        <p class="text-center mt-3 text-danger" id="loginMessage"></p>
      </div>
    </div>
  </div>
`;

// Lógica para renderizar o conteúdo
function renderContent(template) {
  appContainer.innerHTML = template;
}

// Verifica o estado da autenticação do usuário
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Se o usuário está logado, renderize o dashboard
    // Por enquanto, vamos manter o login para teste
    renderContent(loginTemplate);
    // TODO: Adicionar lógica para o dashboard
  } else {
    // Se não há usuário, renderize a tela de login
    renderContent(loginTemplate);
  }
});
