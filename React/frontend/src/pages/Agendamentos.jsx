import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const dataHora = (v) => (v ? new Date(v).toLocaleString("pt-BR") : "-");

export default function Agendamentos() {
  const { usuario, logout } = useAuth();
  const [agendamentos, setAgendamentos] = useState([]);
  const [pesquisa, setPesquisa] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState(false);
  const [carregando, setCarregando] = useState(true);

  async function carregar() {
    try { setAgendamentos(await api.agendamentos.listar()); }
    catch (e) { setErro(true); setMensagem(e.message); }
    finally { setCarregando(false); }
  }

  useEffect(() => { carregar(); }, []);

  const filtrados = useMemo(() => {
    const termo = pesquisa.trim().toLowerCase();
    return agendamentos.filter((a) => {
      if (filtroStatus && a.status !== filtroStatus) return false;
      if (!termo) return true;
      return [a.cliente_nome, a.placa, a.modelo].filter(Boolean).join(" ").toLowerCase().includes(termo);
    });
  }, [agendamentos, pesquisa, filtroStatus]);

  async function alterarStatus(a, novoStatus) {
    if (novoStatus === a.status) return;
    try {
      await api.agendamentos.atualizar(a.id, { status: novoStatus });
      await carregar();
    } catch (e) {
      alert(e.message);
      await carregar();
    }
  }

  return (
    <>
      <Navbar usuario={usuario} onLogout={logout} fallback="/painel-admin" />

      <main className="container content-offset-navbar">
        <div className="mb-4">
          <h1 className="fw-bold m-0 text-brand-dark">Gerenciamento de Agendamentos</h1>
          <p className="text-muted m-0">Consulte os agendamentos e altere seus status.</p>
        </div>

        {mensagem && (
          <div className={`alert ${erro ? "alert-danger" : "alert-success"} d-flex justify-content-between`}>
            <span>{mensagem}</span>
            <button className="btn-close" onClick={() => setMensagem("")}></button>
          </div>
        )}

        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body">
            <h5 className="fw-bold section-title mb-3">
              <i className="fa-solid fa-magnifying-glass me-2 text-brand-blue"></i>Filtrar Agendamentos
            </h5>
            <div className="row g-3 align-items-end">
              <div className="col-md-8">
                <label className="form-label fw-semibold">Pesquisar</label>
                <input className="form-control" placeholder="Cliente, placa ou veículo..."
                  value={pesquisa} onChange={(e) => setPesquisa(e.target.value)} />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">Status</label>
                <select className="form-select" value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
                  <option value="">Todos</option>
                  <option value="agendado">Agendado</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="concluido">Concluído</option>
                  <option value="cancelado">Cancelado</option>
                </select>
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
                    <th>Cliente</th><th>Veículo</th><th>Data</th>
                    <th>Status</th><th>Observações</th>
                  </tr>
                </thead>
                <tbody>
                  {carregando ? (
                    <tr><td colSpan="5" className="empty-state">Carregando...</td></tr>
                  ) : filtrados.length === 0 ? (
                    <tr><td colSpan="5" className="empty-state">
                      {agendamentos.length === 0 ? "Nenhum agendamento cadastrado." : "Nenhum agendamento encontrado para esse filtro."}
                    </td></tr>
                  ) : filtrados.map((a) => (
                    <tr key={a.id}>
                      <td>{a.cliente_nome || "-"}</td>
                      <td>
                        {a.modelo} {a.placa ? <small className="d-block text-muted">{a.placa}</small> : null}
                      </td>
                      <td>{dataHora(a.data_hora)}</td>
                      <td>
                        <select className="form-select form-select-sm"
                          value={a.status} onChange={(e) => alterarStatus(a, e.target.value)}>
                          <option value="agendado">Agendado</option>
                          <option value="confirmado">Confirmado</option>
                          <option value="concluido">Concluído</option>
                          <option value="cancelado">Cancelado</option>
                        </select>
                      </td>
                      <td>{a.observacoes || "-"}</td>
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
