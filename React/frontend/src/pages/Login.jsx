import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login, destinoAposLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar(evento) {
    evento.preventDefault();
    setMensagem("");
    setCarregando(true);
    try {
      const dados = await login(email.trim(), senha);
      navigate(destinoAposLogin(dados.nivel), { replace: true });
    } catch (erro) {
      setMensagem(erro.message || "Não foi possível conectar ao servidor.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="bg-light min-vh-100">
      <nav className="navbar navbar-expand-lg fixed-top shadow-sm py-2 bg-brand-blue">
        <div className="container-fluid px-4">
          <div className="d-flex w-100 align-items-center justify-content-between position-relative">
            <div>
              <Link to="/" className="text-white text-decoration-none fw-semibold d-inline-flex align-items-center gap-2">
                <i className="fa-solid fa-arrow-left text-white"></i> Voltar
              </Link>
            </div>
            <div className="position-absolute start-50 translate-middle-x">
              <Link className="navbar-brand fw-bold fs-3 m-0" to="/">
                <span className="brand-light">Vibe</span>
                <span className="brand-dark">Mechanics</span>
              </Link>
            </div>
            <div className="invisible-placeholder">
              <span className="fw-semibold">Voltar</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="container py-4 auth-container">
        <div className="card shadow border-0">
          <div className="card-body p-4">
            <h3 className="fw-bold mb-4 text-center">Acessar Conta</h3>
            <form onSubmit={entrar}>
              <div className="mb-3">
                <label className="form-label" htmlFor="email">E-mail</label>
                <input
                  className="form-control"
                  id="email"
                  type="email"
                  placeholder="exemplo@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="form-label" htmlFor="senha">Senha</label>
                <input
                  className="form-control"
                  id="senha"
                  type="password"
                  placeholder="Digite sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                />
              </div>
              <button className="btn text-white w-100 fw-bold py-2 bg-brand-orange" type="submit" disabled={carregando}>
                {carregando ? "Entrando..." : "Entrar"}
              </button>
              {mensagem && (
                <div className="text-danger mt-3 text-center fw-bold">{mensagem}</div>
              )}
            </form>
            <div className="text-center mt-3">
              <p className="text-muted">
                Ainda não tem uma conta?{" "}
                <Link className="text-decoration-none fw-semibold text-brand-blue" to="/cadastro-cliente">
                  Cadastre-se
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
