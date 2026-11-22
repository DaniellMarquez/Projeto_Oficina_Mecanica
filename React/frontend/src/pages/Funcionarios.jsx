import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const formVazio = {
  nome: "", cpf: "", telefone: "", estado_civil: "",
  endereco: "", cargo: "", email: "", senha: "",
};

export default function Funcionarios() {
  const { usuario, logout } = useAuth();
  const [lista, setLista] = useState([]);
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
    try { setLista(await api.funcionarios.listar()); }
    catch (e) { setErro(true); setMensagem(e.message); }
    finally { setCarregando(false); }
  }

  useEffect(() => { carregar(); }, []);

  const filtrados = useMemo(() => {
    const termo = textoFiltro.trim().toLowerCase();
    if (!termo) return lista;
    return lista.filter((f) => String(f[campoFiltro] ?? "").toLowerCase().includes(termo));
  }, [lista, campoFiltro, textoFiltro]);

  function abrirNovo() {
    setEditando(null); setForm(formVazio); setMensagem(""); setErro(false);
    setSearchParams({ acao: "cadastrar" });
  }

  function abrirEdicao(f) {
    setEditando(f);
    setForm({
      nome: f.nome || "", cpf: f.cpf || "", telefone: f.telefone || "",
      estado_civil: f.estado_civil || "", endereco: f.endereco || "",
      cargo: f.cargo || "", email: f.email || "", senha: "",
    });
    setMensagem(""); setErro(false);
    setSearchParams({ acao: "cadastrar", id: f.id });
  }

  function fechar() {
    setEditando(null); setForm(formVazio); setSearchParams({});
  }

  function alterar(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function salvar(e) {
    e.preventDefault();
    setSalvando(true); setMensagem(""); setErro(false);
    try {
      const dados = {
        nome: form.nome.trim(),
        cpf: form.cpf.trim(),
        telefone: form.telefone.trim() || null,
        estado_civil: form.estado_civil.trim() || null,
        endereco: form.endereco.trim() || null,
        cargo: form.cargo.trim() || null,
        email: form.email.trim(),
      };
      if (editando) {
        await api.funcionarios.atualizar(editando.id, dados);
        setMensagem("Funcionário alterado com sucesso.");
      } else {
        await api.funcionarios.cadastrar({ ...dados, senha: form.senha });
        setMensagem("Funcionário cadastrado com sucesso.");
      }
      fechar();
      await carregar();
    } catch (err) {
      setErro(true); setMensagem(err.message);
    } finally {
      setSalvando(false);
    }
  }

  async function alternar(f) {
    if (!confirm(`Deseja ${f.ativo ? "inativar" : "reativar"} este funcionário?`)) return;
    try {
      if (f.ativo) await api.funcionarios.inativar(f.id);
      else await api.funcionarios.reativar(f.id);
      await carregar();
    } catch (err) { alert(err.message); }
  }

  return (
    <>
      <Navbar usuario={usuario} onLogout={logout}
        acao={{ texto: "Novo Funcionário", rota: "/painel-funcionarios?acao=cadastrar" }} />

      <main className="container content-offset-navbar">
        <div className="mb-4">
          <h1 className="fw-bold m-0 text-brand-dark">Gerenciamento de Funcionários</h1>
          <p className="text-muted m-0">Consulte e gerencie os profissionais cadastrados na oficina.</p>
        </div>

        {mensagem && (
          <div className={`alert ${erro ? "alert-danger" : "alert-success"} d-flex justify-content-between`}>
            <span>{mensagem}</span>
            <button className="btn-close" onClick={() => setMensagem("")}></button>
          </div>
        )}

        {mostrarForm && (
          <div className="card shadow border-0 mb-4">
            <div className="card-body p-4">
              <h5 className="fw-bold section-title mb-3">
                {editando ? "Alterar funcionário" : "Novo funcionário"}
              </h5>
              <form onSubmit={salvar} className="row g-3">
                <div className="col-12">
                  <label className="form-label">Nome completo</label>
                  <input className="form-control" name="nome" value={form.nome} onChange={alterar} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">CPF</label>
                  <input className="form-control" name="cpf" value={form.cpf} onChange={alterar} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Telefone</label>
                  <input className="form-control" name="telefone" value={form.telefone} onChange={alterar} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Cargo</label>
                  <input className="form-control" name="cargo" value={form.cargo} onChange={alterar} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Estado Civil</label>
                  <input className="form-control" name="estado_civil" value={form.estado_civil} onChange={alterar} />
                </div>
                <div className="col-12">
                  <label className="form-label">Endereço</label>
                  <input className="form-control" name="endereco" value={form.endereco} onChange={alterar} />
                </div>
                <div className="col-12">
                  <label className="form-label">E-mail</label>
                  <input className="form-control" type="email" name="email" value={form.email} onChange={alterar} required />
                </div>
                {!editando && (
                  <div className="col-12">
                    <label className="form-label">Senha</label>
                    <input className="form-control" type="password" name="senha" value={form.senha} onChange={alterar} required />
                  </div>
                )}
                <div className="col-12 d-flex gap-2">
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
              <i className="fa-solid fa-magnifying-glass me-2 text-brand-blue"></i>Filtrar Funcionários
            </h5>
            <div className="row g-3 align-items-end">
              <div className="col-md-3">
                <label className="form-label fw-semibold">Filtrar por</label>
                <select className="form-select" value={campoFiltro} onChange={(e) => setCampoFiltro(e.target.value)}>
                  <option value="id">ID</option>
                  <option value="nome">Nome</option>
                  <option value="cpf">CPF</option>
                  <option value="cargo">Cargo</option>
                  <option value="email">E-mail</option>
                </select>
              </div>
              <div className="col-md-7">
                <label className="form-label fw-semibold">Pesquisar</label>
                <input className="form-control" placeholder="Digite o que deseja pesquisar..."
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
                    <th>ID</th><th>Nome</th><th>Cargo</th><th>CPF</th><th>E-mail</th>
                    <th>Situação</th><th className="text-end">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {carregando ? (
                    <tr><td colSpan="7" className="empty-state">Carregando...</td></tr>
                  ) : filtrados.length === 0 ? (
                    <tr><td colSpan="7" className="empty-state">
                      {lista.length === 0 ? "Nenhum funcionário cadastrado." : "Nenhum funcionário encontrado para esse filtro."}
                    </td></tr>
                  ) : filtrados.map((f) => (
                    <tr key={f.id}>
                      <td>{f.id}</td>
                      <td>{f.nome}</td>
                      <td>{f.cargo || "-"}</td>
                      <td>{f.cpf}</td>
                      <td>{f.email}</td>
                      <td>
                        <span className={`badge ${f.ativo ? "bg-success" : "bg-secondary"}`}>
                          {f.ativo ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="text-end">
                        <button className="btn btn-warning btn-sm me-1" onClick={() => abrirEdicao(f)}>
                          <i className="fa-solid fa-pen"></i>
                        </button>
                        <button
                          className={`btn btn-sm ${f.ativo ? "btn-danger" : "btn-success"}`}
                          onClick={() => alternar(f)}
                        >
                          <i className={`fa-solid ${f.ativo ? "fa-user-slash" : "fa-user-check"}`}></i>
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
