import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const formVazio = { descricao: "", valor_mao_obra: "" };
const moeda = (v) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function Servicos() {
  const { usuario, logout } = useAuth();
  const [lista, setLista] = useState([]);
  const [form, setForm] = useState(formVazio);
  const [editando, setEditando] = useState(null);
  const [textoFiltro, setTextoFiltro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const mostrarForm = searchParams.get("acao") === "cadastrar";

  async function carregar() {
    try { setLista(await api.servicos.listar()); }
    catch (e) { setErro(true); setMensagem(e.message); }
    finally { setCarregando(false); }
  }

  useEffect(() => { carregar(); }, []);

  const filtrados = useMemo(() => {
    const termo = textoFiltro.trim().toLowerCase();
    if (!termo) return lista;
    return lista.filter((s) => String(s.descricao ?? "").toLowerCase().includes(termo));
  }, [lista, textoFiltro]);

  function abrirNovo() {
    setEditando(null); setForm(formVazio); setMensagem(""); setErro(false);
    setSearchParams({ acao: "cadastrar" });
  }

  function abrirEdicao(s) {
    setEditando(s);
    setForm({ descricao: s.descricao || "", valor_mao_obra: s.valor_mao_obra });
    setMensagem(""); setErro(false);
    setSearchParams({ acao: "cadastrar", id: s.id });
  }

  function fechar() { setEditando(null); setForm(formVazio); setSearchParams({}); }
  function alterar(e) { setForm((f) => ({ ...f, [e.target.name]: e.target.value })); }

  async function salvar(e) {
    e.preventDefault();
    setSalvando(true); setMensagem(""); setErro(false);
    try {
      const dados = { descricao: form.descricao.trim(), valor_mao_obra: Number(form.valor_mao_obra) };
      if (editando) await api.servicos.atualizar(editando.id, dados);
      else await api.servicos.cadastrar(dados);
      setMensagem(editando ? "Serviço alterado com sucesso." : "Serviço cadastrado com sucesso.");
      fechar();
      await carregar();
    } catch (err) {
      setErro(true); setMensagem(err.message);
    } finally {
      setSalvando(false);
    }
  }

  async function alternar(s) {
    if (!confirm(`Deseja ${s.ativo ? "inativar" : "reativar"} este serviço?`)) return;
    try {
      if (s.ativo) await api.servicos.inativar(s.id);
      else await api.servicos.reativar(s.id);
      await carregar();
    } catch (err) { alert(err.message); }
  }

  return (
    <>
      <Navbar usuario={usuario} onLogout={logout}
        acao={{ texto: "Novo Serviço", rota: "/painel-servicos?acao=cadastrar" }} />

      <main className="container content-offset-navbar">
        <div className="mb-4">
          <h1 className="fw-bold m-0 text-brand-dark">Serviços</h1>
          <p className="text-muted m-0">Gerencie o catálogo de serviços da oficina.</p>
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
                {editando ? "Alterar serviço" : "Novo serviço"}
              </h5>
              <form onSubmit={salvar}>
                <div className="mb-3">
                  <label className="form-label">Descrição</label>
                  <input className="form-control" name="descricao" value={form.descricao} onChange={alterar} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Valor da mão de obra</label>
                  <input type="number" step="0.01" className="form-control" name="valor_mao_obra"
                    value={form.valor_mao_obra} onChange={alterar} min="0" required />
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-brand fw-bold" type="submit" disabled={salvando}>
                    {salvando ? "Salvando..." : editando ? "Salvar alterações" : "Salvar"}
                  </button>
                  <button className="btn btn-secondary" type="button" onClick={fechar}>Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body">
            <input className="form-control" placeholder="Pesquisar serviço..."
              value={textoFiltro} onChange={(e) => setTextoFiltro(e.target.value)} />
          </div>
        </div>

        <div className="card shadow-sm border-0">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover table-brand align-middle">
                <thead>
                  <tr>
                    <th>Descrição</th><th>Valor</th><th>Situação</th>
                    <th className="text-end">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {carregando ? (
                    <tr><td colSpan="4" className="empty-state">Carregando...</td></tr>
                  ) : filtrados.length === 0 ? (
                    <tr><td colSpan="4" className="empty-state">
                      {lista.length === 0 ? "Nenhum serviço cadastrado." : "Nenhum serviço encontrado para esse filtro."}
                    </td></tr>
                  ) : filtrados.map((s) => (
                    <tr key={s.id}>
                      <td>{s.descricao}</td>
                      <td>{moeda(s.valor_mao_obra)}</td>
                      <td>
                        <span className={`badge ${s.ativo ? "bg-success" : "bg-secondary"}`}>
                          {s.ativo ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="text-end">
                        <button className="btn btn-warning btn-sm me-1" onClick={() => abrirEdicao(s)}>
                          <i className="fa-solid fa-pen"></i>
                        </button>
                        <button className={`btn btn-sm ${s.ativo ? "btn-danger" : "btn-success"}`}
                          onClick={() => alternar(s)}>
                          <i className={`fa-solid ${s.ativo ? "fa-ban" : "fa-rotate-left"}`}></i>
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
