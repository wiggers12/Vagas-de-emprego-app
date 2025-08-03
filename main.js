// main.js
import { auth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "./firebase.js";

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
        // Não faz nada aqui, a função onAuthStateChanged vai lidar com o redirecionamento
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
  }
}

// Verifica o estado da autenticação do usuário
onAuthStateChanged(auth, (user) => {
  if (user) {
    // TODO: Adicionar o dashboard aqui
    renderContent(loginTemplate);
  } else {
    renderContent(loginTemplate);
  }
});
