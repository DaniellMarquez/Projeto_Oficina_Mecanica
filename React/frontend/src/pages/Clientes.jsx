import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const formVazio = { nome: "", cpf: "", email: "", senha: "" };

export default function Clientes() {
  const { usuario, logout } = useAuth();
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState(formVazio);
  const [editando, setEditando] = useState(null);
  const [campoFiltro, setCampoFiltro] = useState("nome");
  const [textoFiltro, setTextoFiltro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const mostrarForm = searchParams.get("acao") === "cadastrar";

  async function carregar() {
    try {
      const dados = await api.clientes.listar();
      setClientes(dados);
    } catch (e) {
      setErro(true); setMensagem(e.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { carregar(); }, []);

  const filtrados = useMemo(() => {
    const termo = textoFiltro.trim().toLowerCase();
    if (!termo) return clientes;
    return clientes.filter((c) => String(c[campoFiltro] ?? "").toLowerCase().includes(termo));
  }, [clientes, campoFiltro, textoFiltro]);

  function abrirNovo() {
    setEditando(null);
    setForm(formVazio);
    setMensagem(""); setErro(false);
    setSearchParams({ acao: "cadastrar" });
  }

  function abrirEdicao(c) {
    setEditando(c);
    setForm({ nome: c.nome || "", cpf: c.cpf || "", email: c.email || "", senha: "" });
    setMensagem(""); setErro(false);
    setSearchParams({ acao: "cadastrar", id: c.id });
  }

  function fechar() {
    setEditando(null);
    setForm(formVazio);
    setSearchParams({});
  }

  function alterar(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function salvar(e) {
    e.preventDefault();
    setSalvando(true); setMensagem(""); setErro(false);
    try {
      if (editando) {
        await api.clientes.atualizar(editando.id, {
          nome: form.nome.trim(), cpf: form.cpf.trim(), email: form.email.trim(),
        });
        setMensagem("Cliente alterado com sucesso.");
      } else {
        await api.clientes.cadastrar({
          nome: form.nome.trim(), cpf: form.cpf.trim(),
          email: form.email.trim(), senha: form.senha,
        });
        setMensagem("Cliente cadastrado com sucesso.");
      }
      fechar();
      await carregar();
    } catch (err) {
      setErro(true); setMensagem(err.message);
    } finally {
      setSalvando(false);
    }
  }

  async function alternar(c) {
    if (!confirm(`Deseja ${c.ativo ? "inativar" : "reativar"} este cliente?`)) return;
    try {
      if (c.ativo) await api.clientes.inativar(c.id);
      else await api.clientes.reativar(c.id);
      await carregar();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <>
      <Navbar usuario={usuario} onLogout={logout}
        acao={{ texto: "Novo Cliente", rota: "/painel-clientes?acao=cadastrar" }} />

      <main className="container content-offset-navbar">
        <div className="mb-4">
          <h1 className="fw-bold m-0 text-brand-dark">Gerenciamento de Clientes</h1>
          <p className="text-muted m-0">Consulte e gerencie os clientes registrados na oficina.</p>
        </div>

        {mensagem && (
          <div className={`alert ${erro ? "alert-danger" : "alert-success"} d-flex justify-content-between`}>
            <span>{mensagem}</span>
            <button type="button" className="btn-close" onClick={() => setMensagem("")}></button>
          </div>
        )}

        {mostrarForm && (
          <div className="card shadow border-0 mb-4">
            <div className="card-body p-4">
              <h5 className="fw-bold section-title mb-3">
                {editando ? "Alterar cliente" : "Novo cliente"}
              </h5>
              <form onSubmit={salvar}>
                <div className="mb-3">
                  <label className="form-label">Nome completo</label>
                  <input className="form-control" name="nome" value={form.nome} onChange={alterar} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">CPF</label>
                  <input className="form-control" name="cpf" value={form.cpf} onChange={alterar} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">E-mail</label>
                  <input className="form-control" type="email" name="email" value={form.email} onChange={alterar} required />
                </div>
                {!editando && (
                  <div className="mb-3">
                    <label className="form-label">Senha</label>
                    <input className="form-control" type="password" name="senha" value={form.senha} onChange={alterar} required />
                  </div>
                )}
                <div className="d-flex gap-2 mt-3">
                  <button className="btn btn-brand fw-bold" type="submit" disabled={salvando}>
                    {salvando ? "Salvando..." : editando ? "Salvar alterações" : "Cadastrar"}
                  </button>
                  <button className="btn btn-secondary" type="button" onClick={fechar}>Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body">
            <h5 className="fw-bold section-title mb-3">
              <i className="fa-solid fa-magnifying-glass me-2 text-brand-blue"></i>Filtrar Clientes
            </h5>
            <div className="row g-3 align-items-end">
              <div className="col-md-3">
                <label className="form-label fw-semibold">Filtrar por</label>
                <select className="form-select" value={campoFiltro} onChange={(e) => setCampoFiltro(e.target.value)}>
                  <option value="id">ID</option>
                  <option value="nome">Nome</option>
                  <option value="cpf">CPF</option>
                  <option value="email">E-mail</option>
                </select>
              </div>
              <div className="col-md-7">
                <label className="form-label fw-semibold">Pesquisar</label>
                <input className="form-control" placeholder="Digite o termo para buscar..."
                  value={textoFiltro} onChange={(e) => setTextoFiltro(e.target.value)} />
              </div>
              <div className="col-md-2">
                <button className="btn btn-secondary w-100 fw-bold" type="button"
                  onClick={() => { setCampoFiltro("nome"); setTextoFiltro(""); }}>
                  Limpar
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="card shadow-sm border-0">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover table-brand align-middle">
                <thead>
                  <tr>
                    <th>ID</th><th>Nome</th><th>CPF</th><th>E-mail</th>
                    <th>Situação</th><th className="text-end">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {carregando ? (
                    <tr><td colSpan="6" className="empty-state">Carregando...</td></tr>
                  ) : filtrados.length === 0 ? (
                    <tr><td colSpan="6" className="empty-state">
                      {clientes.length === 0 ? "Nenhum cliente cadastrado." : "Nenhum cliente encontrado para esse filtro."}
                    </td></tr>
                  ) : filtrados.map((c) => (
                    <tr key={c.id}>
                      <td>{c.id}</td>
                      <td>{c.nome}</td>
                      <td>{c.cpf}</td>
                      <td>{c.email}</td>
                      <td>
                        <span className={`badge ${c.ativo ? "bg-success" : "bg-secondary"}`}>
                          {c.ativo ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="text-end">
                        <button className="btn btn-warning btn-sm me-1" onClick={() => abrirEdicao(c)}>
                          <i className="fa-solid fa-pen"></i>
                        </button>
                        <button
                          className={`btn btn-sm ${c.ativo ? "btn-danger" : "btn-success"}`}
                          onClick={() => alternar(c)}
                        >
                          <i className={`fa-solid ${c.ativo ? "fa-user-slash" : "fa-user-check"}`}></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
