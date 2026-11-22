import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const formVazio = { placa: "", marca: "", modelo: "", ano: "", cliente_id: "" };

export default function Veiculos() {
  const { usuario, logout } = useAuth();
  const [lista, setLista] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState(formVazio);
  const [editando, setEditando] = useState(null);
  const [campoFiltro, setCampoFiltro] = useState("placa");
  const [textoFiltro, setTextoFiltro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const mostrarForm = searchParams.get("acao") === "cadastrar";

  async function carregar() {
    try {
      const [vs, cs] = await Promise.all([api.veiculos.listar(), api.clientes.listar()]);
      setLista(vs);
      setClientes(cs);
    } catch (e) {
      setErro(true); setMensagem(e.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { carregar(); }, []);

  const filtrados = useMemo(() => {
    const termo = textoFiltro.trim().toLowerCase();
    if (!termo) return lista;
    return lista.filter((v) => String(v[campoFiltro] ?? "").toLowerCase().includes(termo));
  }, [lista, campoFiltro, textoFiltro]);

  function abrirNovo() {
    setEditando(null); setForm(formVazio); setMensagem(""); setErro(false);
    setSearchParams({ acao: "cadastrar" });
  }

  function abrirEdicao(v) {
    setEditando(v);
    setForm({
      placa: v.placa || "", marca: v.marca || "", modelo: v.modelo || "",
      ano: v.ano || "", cliente_id: String(v.cliente_id || ""),
    });
    setMensagem(""); setErro(false);
    setSearchParams({ acao: "cadastrar", id: v.id });
  }

  function fechar() {
    setEditando(null); setForm(formVazio); setSearchParams({});
  }

  function alterar(e) { setForm((f) => ({ ...f, [e.target.name]: e.target.value })); }

  async function salvar(e) {
    e.preventDefault();
    setSalvando(true); setMensagem(""); setErro(false);
    try {
      const dados = {
        placa: form.placa.trim().toUpperCase(),
        marca: form.marca.trim(),
        modelo: form.modelo.trim(),
        ano: Number(form.ano),
        cliente_id: Number(form.cliente_id),
      };
      if (editando) await api.veiculos.atualizar(editando.id, dados);
      else await api.veiculos.cadastrar(dados);
      setMensagem(editando ? "Veículo alterado com sucesso." : "Veículo cadastrado com sucesso.");
      fechar();
      await carregar();
    } catch (err) {
      setErro(true); setMensagem(err.message);
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(v) {
    if (!confirm(`Deseja excluir o veículo ${v.placa}?`)) return;
    try {
      await api.veiculos.excluir(v.id);
      await carregar();
    } catch (err) { alert(err.message); }
  }

  return (
    <>
      <Navbar usuario={usuario} onLogout={logout}
        acao={{ texto: "Novo Veículo", rota: "/painel-veiculos?acao=cadastrar" }} />

      <main className="container content-offset-navbar">
        <div className="mb-4">
          <h1 className="fw-bold m-0 text-brand-dark">Gerenciamento de Veículos</h1>
          <p className="text-muted m-0">Consulte e gerencie a frota de veículos cadastrados na oficina.</p>
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
                {editando ? "Alterar veículo" : "Novo veículo"}
              </h5>
              <form onSubmit={salvar} className="row g-3">
                <div className="col-md-3">
                  <label className="form-label">Placa</label>
                  <input className="form-control text-uppercase-input" name="placa"
                    value={form.placa} onChange={alterar} maxLength={7} required />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Marca</label>
                  <input className="form-control" name="marca" value={form.marca} onChange={alterar} required />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Modelo</label>
                  <input className="form-control" name="modelo" value={form.modelo} onChange={alterar} required />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Ano</label>
                  <input type="number" className="form-control" name="ano"
                    value={form.ano} onChange={alterar} min="1900" max="2100" required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Cliente</label>
                  <select className="form-select" name="cliente_id" value={form.cliente_id} onChange={alterar} required>
                    <option value="">Selecione um cliente</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>{c.nome} ({c.cpf})</option>
                    ))}
                  </select>
                </div>
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
              <i className="fa-solid fa-magnifying-glass me-2 text-brand-blue"></i>Filtrar Veículos
            </h5>
            <div className="row g-3 align-items-end">
              <div className="col-md-3">
                <label className="form-label fw-semibold">Filtrar por</label>
                <select className="form-select" value={campoFiltro} onChange={(e) => setCampoFiltro(e.target.value)}>
                  <option value="placa">Placa</option>
                  <option value="modelo">Modelo</option>
                  <option value="marca">Marca</option>
                  <option value="cliente_nome">Nome do Cliente</option>
                </select>
              </div>
              <div className="col-md-7">
                <label className="form-label fw-semibold">Pesquisar</label>
                <input className="form-control" placeholder="Digite para filtrar..."
                  value={textoFiltro} onChange={(e) => setTextoFiltro(e.target.value)} />
              </div>
              <div className="col-md-2">
                <button className="btn btn-secondary w-100 fw-bold" type="button"
                  onClick={() => { setCampoFiltro("placa"); setTextoFiltro(""); }}>
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
                    <th>ID</th><th>Placa</th><th>Marca / Modelo</th><th>Ano</th><th>Cliente</th>
                    <th className="text-end">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {carregando ? (
                    <tr><td colSpan="6" className="empty-state">Carregando...</td></tr>
                  ) : filtrados.length === 0 ? (
                    <tr><td colSpan="6" className="empty-state">
                      {lista.length === 0 ? "Nenhum veículo cadastrado." : "Nenhum veículo encontrado para esse filtro."}
                    </td></tr>
                  ) : filtrados.map((v) => (
                    <tr key={v.id}>
                      <td>{v.id}</td>
                      <td className="fw-bold">{v.placa}</td>
                      <td>{v.marca} {v.modelo}</td>
                      <td>{v.ano}</td>
                      <td>{v.cliente_nome || "N/A"}</td>
                      <td className="text-end">
                        <button className="btn btn-warning btn-sm me-1" onClick={() => abrirEdicao(v)}>
                          <i className="fa-solid fa-pen"></i>
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => excluir(v)}>
                          <i className="fa-solid fa-trash"></i>
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
