import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function CadastroCliente() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nome: "", cpf: "", email: "", senha: "", confirmaSenha: "" });
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState(false);
  const [salvando, setSalvando] = useState(false);

  function alterar(evento) {
    setForm((atual) => ({ ...atual, [evento.target.name]: evento.target.value }));
  }

  async function salvar(evento) {
    evento.preventDefault();
    setMensagem("");
    setErro(false);

    if (form.senha !== form.confirmaSenha) {
      setErro(true);
      setMensagem("As senhas não coincidem.");
      return;
    }

    setSalvando(true);
    try {
      await api.clientes.cadastrar({
        nome: form.nome.trim(),
        cpf: form.cpf.trim(),
        email: form.email.trim(),
        senha: form.senha,
      });
      setMensagem("Conta criada com sucesso! Redirecionando para o login...");
      setTimeout(() => navigate("/login"), 800);
    } catch (e) {
      setErro(true);
      setMensagem(e.message);
    } finally {
      setSalvando(false);
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
            <h3 className="fw-bold mb-4 text-center">Criar Nova Conta</h3>
            <form onSubmit={salvar}>
              <div className="mb-3">
                <label className="form-label" htmlFor="nome">Nome Completo</label>
                <input className="form-control" id="nome" name="nome" type="text"
                  placeholder="Digite seu nome completo"
                  value={form.nome} onChange={alterar} required />
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="cpf">CPF</label>
                <input className="form-control" id="cpf" name="cpf" type="text"
                  placeholder="000.000.000-00"
                  value={form.cpf} onChange={alterar} required />
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="email">E-mail</label>
                <input className="form-control" id="email" name="email" type="email"
                  placeholder="exemplo@email.com"
                  value={form.email} onChange={alterar} required />
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="senha">Senha</label>
                <input className="form-control" id="senha" name="senha" type="password"
                  placeholder="Digite uma senha segura"
                  value={form.senha} onChange={alterar} required />
              </div>
              <div className="mb-4">
                <label className="form-label" htmlFor="confirmaSenha">Confirmar Senha</label>
                <input className="form-control" id="confirmaSenha" name="confirmaSenha" type="password"
                  placeholder="Digite a senha novamente"
                  value={form.confirmaSenha} onChange={alterar} required />
              </div>
              <button className="btn text-white w-100 fw-bold py-2 bg-brand-orange" type="submit" disabled={salvando}>
                {salvando ? "Cadastrando..." : "Cadastrar Conta"}
              </button>
              {mensagem && (
                <div className={`mt-3 text-center fw-bold ${erro ? "text-danger" : "text-success"}`}>
                  {mensagem}
                </div>
              )}
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
