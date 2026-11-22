import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const formVazio = {
  nome: "", marca: "", fabricante: "",
  preco_compra: "", preco_venda: "", quantidade_estoque: "",
};
const moeda = (v) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function Estoque() {
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
    try { setLista(await api.estoque.listar()); }
    catch (e) { setErro(true); setMensagem(e.message); }
    finally { setCarregando(false); }
  }

  useEffect(() => { carregar(); }, []);

  const filtrados = useMemo(() => {
    const termo = textoFiltro.trim().toLowerCase();
    if (!termo) return lista;
    return lista.filter((p) => {
      const v = campoFiltro === "ativo" ? (p.ativo ? "ativa" : "inativa") : p[campoFiltro];
      return String(v ?? "").toLowerCase().includes(termo);
    });
  }, [lista, campoFiltro, textoFiltro]);

  function abrirNovo() {
    setEditando(null); setForm(formVazio); setMensagem(""); setErro(false);
    setSearchParams({ acao: "cadastrar" });
  }

  function abrirEdicao(p) {
    setEditando(p);
    setForm({
      nome: p.nome || "", marca: p.marca || "", fabricante: p.fabricante || "",
      preco_compra: p.preco_compra, preco_venda: p.preco_venda,
      quantidade_estoque: p.quantidade_estoque,
    });
    setMensagem(""); setErro(false);
    setSearchParams({ acao: "cadastrar", id: p.id });
  }

  function fechar() { setEditando(null); setForm(formVazio); setSearchParams({}); }
  function alterar(e) { setForm((f) => ({ ...f, [e.target.name]: e.target.value })); }

  async function salvar(e) {
    e.preventDefault();
    setSalvando(true); setMensagem(""); setErro(false);
    try {
      const dados = {
        nome: form.nome.trim(),
        marca: form.marca.trim() || null,
        fabricante: form.fabricante.trim() || null,
        preco_compra: Number(form.preco_compra),
        preco_venda: Number(form.preco_venda),
        quantidade_estoque: Number(form.quantidade_estoque),
      };
      if (editando) await api.estoque.atualizar(editando.id, dados);
      else await api.estoque.cadastrar(dados);
      setMensagem(editando ? "Peça alterada com sucesso." : "Peça cadastrada com sucesso.");
      fechar();
      await carregar();
    } catch (err) {
      setErro(true); setMensagem(err.message);
    } finally {
      setSalvando(false);
    }
  }

  async function alternar(p) {
    if (!confirm(`Deseja ${p.ativo ? "inativar" : "reativar"} esta peça?`)) return;
    try {
      if (p.ativo) await api.estoque.inativar(p.id);
      else await api.estoque.reativar(p.id);
      await carregar();
    } catch (err) { alert(err.message); }
  }

  return (
    <>
      <Navbar usuario={usuario} onLogout={logout}
        acao={{ texto: "Nova Peça", rota: "/painel-estoque?acao=cadastrar" }} />

      <main className="container content-offset-navbar">
        <div className="mb-4">
          <h1 className="fw-bold m-0 text-brand-dark">Estoque</h1>
          <p className="text-muted m-0">Gerencie peças, preços e disponibilidade.</p>
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
                {editando ? "Alterar peça" : "Nova peça / item"}
              </h5>
              <form onSubmit={salvar} className="row g-3">
                <div className="col-12">
                  <label className="form-label">Nome</label>
                  <input className="form-control" name="nome" value={form.nome} onChange={alterar} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Marca</label>
                  <input className="form-control" name="marca" value={form.marca} onChange={alterar} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Fabricante</label>
                  <input className="form-control" name="fabricante" value={form.fabricante} onChange={alterar} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Quantidade</label>
                  <input type="number" className="form-control" name="quantidade_estoque"
                    value={form.quantidade_estoque} onChange={alterar} min="0" required />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Preço de compra</label>
                  <input type="number" step="0.01" className="form-control" name="preco_compra"
                    value={form.preco_compra} onChange={alterar} min="0" required />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Preço de venda</label>
                  <input type="number" step="0.01" className="form-control" name="preco_venda"
                    value={form.preco_venda} onChange={alterar} min="0" required />
                </div>
                <div className="col-12 d-flex gap-2">
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
            <div className="row g-3 align-items-end">
              <div className="col-md-3">
                <label className="form-label fw-semibold">Filtrar por</label>
                <select className="form-select" value={campoFiltro} onChange={(e) => setCampoFiltro(e.target.value)}>
                  <option value="nome">Nome</option>
                  <option value="marca">Marca</option>
                  <option value="fabricante">Fabricante</option>
                  <option value="ativo">Situação</option>
                </select>
              </div>
              <div className="col-md-7">
                <label className="form-label fw-semibold">Pesquisar</label>
                <input className="form-control" placeholder="Digite para buscar..."
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
                    <th>Nome</th><th>Marca</th><th>Fabricante</th><th>Estoque</th>
                    <th>Compra</th><th>Venda</th><th>Situação</th>
                    <th className="text-end">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {carregando ? (
                    <tr><td colSpan="8" className="empty-state">Carregando...</td></tr>
                  ) : filtrados.length === 0 ? (
                    <tr><td colSpan="8" className="empty-state">
                      {lista.length === 0 ? "Nenhuma peça cadastrada." : "Nenhuma peça encontrada para esse filtro."}
                    </td></tr>
                  ) : filtrados.map((p) => (
                    <tr key={p.id}>
                      <td className="fw-bold">{p.nome}</td>
                      <td>{p.marca || "-"}</td>
                      <td>{p.fabricante || "-"}</td>
                      <td>{p.quantidade_estoque}</td>
                      <td>{moeda(p.preco_compra)}</td>
                      <td>{moeda(p.preco_venda)}</td>
                      <td>
                        <span className={`badge ${p.ativo ? "bg-success" : "bg-secondary"}`}>
                          {p.ativo ? "Ativa" : "Inativa"}
                        </span>
                      </td>
                      <td className="text-end">
                        <button className="btn btn-warning btn-sm me-1" onClick={() => abrirEdicao(p)}>
                          <i className="fa-solid fa-pen"></i>
                        </button>
                        <button className={`btn btn-sm ${p.ativo ? "btn-danger" : "btn-success"}`}
                          onClick={() => alternar(p)}>
                          <i className={`fa-solid ${p.ativo ? "fa-ban" : "fa-rotate-left"}`}></i>
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
