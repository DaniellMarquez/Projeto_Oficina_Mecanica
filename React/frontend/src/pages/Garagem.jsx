import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function Garagem() {
  const { usuario, logout } = useAuth();
  const [veiculos, setVeiculos] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ placa: "", marca: "", modelo: "", ano: "" });
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(true);

  async function carregar() {
    try {
      const dados = await api.clientes.veiculos(usuario.id);
      setVeiculos(dados);
    } catch (e) {
      setErro(true); setMensagem(e.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { if (usuario) carregar(); }, [usuario]);

  function abrirNovo() {
    setEditando(null);
    setForm({ placa: "", marca: "", modelo: "", ano: "" });
    setMensagem(""); setErro(false);
    setMostrarForm(true);
  }

  function abrirEdicao(v) {
    setEditando(v);
    setForm({ placa: v.placa || "", marca: v.marca || "", modelo: v.modelo || "", ano: v.ano || "" });
    setMensagem(""); setErro(false);
    setMostrarForm(true);
  }

  function fechar() {
    setMostrarForm(false);
    setEditando(null);
    setForm({ placa: "", marca: "", modelo: "", ano: "" });
  }

  function alterar(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function salvar(e) {
    e.preventDefault();
    setSalvando(true); setMensagem(""); setErro(false);
    try {
      const dados = {
        placa: form.placa.trim().toUpperCase(),
        marca: form.marca.trim(),
        modelo: form.modelo.trim(),
        ano: Number(form.ano),
        cliente_id: usuario.id,
      };
      if (editando) {
        await api.veiculos.atualizar(editando.id, dados);
        setMensagem("Veículo atualizado com sucesso.");
      } else {
        await api.veiculos.cadastrar(dados);
        setMensagem("Veículo cadastrado com sucesso.");
      }
      fechar();
      await carregar();
    } catch (err) {
      setErro(true); setMensagem(err.message);
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(v) {
    if (!confirm(`Excluir o veículo ${v.placa}?`)) return;
    try {
      await api.veiculos.excluir(v.id);
      await carregar();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <>
      <Navbar usuario={usuario} onLogout={logout} />

      <main className="container content-offset-navbar">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="fw-bold">Minha Garagem</h1>
            <p className="text-muted mb-0">Cadastre e acompanhe seus veículos.</p>
          </div>
          <button type="button" className="btn btn-brand fw-bold" onClick={abrirNovo}>
            <i className="fa-solid fa-plus me-1"></i> Novo veículo
          </button>
        </div>

        {mostrarForm && (
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body">
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
                <div className="col-12 d-flex gap-2">
                  <button type="submit" className="btn btn-brand fw-bold" disabled={salvando}>
                    {salvando ? "Salvando..." : "Salvar"}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={fechar}>Cancelar</button>
                </div>
              </form>
              {mensagem && (
                <div className={`mt-3 fw-bold ${erro ? "text-danger" : "text-success"}`}>{mensagem}</div>
              )}
            </div>
          </div>
        )}

        <div className="card shadow-sm border-0">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover table-brand align-middle">
                <thead>
                  <tr>
                    <th>Placa</th>
                    <th>Marca</th>
                    <th>Modelo</th>
                    <th>Ano</th>
                    <th className="text-end">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {carregando ? (
                    <tr><td colSpan="5" className="empty-state">Carregando...</td></tr>
                  ) : veiculos.length === 0 ? (
                    <tr><td colSpan="5" className="empty-state">Nenhum veículo cadastrado.</td></tr>
                  ) : veiculos.map((v) => (
                    <tr key={v.id}>
                      <td className="fw-bold">{v.placa}</td>
                      <td>{v.marca}</td>
                      <td>{v.modelo}</td>
                      <td>{v.ano}</td>
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
