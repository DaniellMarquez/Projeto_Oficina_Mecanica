import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const moeda = (v) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function OrdensServico() {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();
  const [ordens, setOrdens] = useState([]);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState(false);
  const [carregando, setCarregando] = useState(true);

  async function carregar() {
    try { setOrdens(await api.ordens.listar()); }
    catch (e) { setErro(true); setMensagem(e.message); }
    finally { setCarregando(false); }
  }

  useEffect(() => { carregar(); }, []);

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return ordens.filter((o) => {
      if (filtroStatus && o.status !== filtroStatus) return false;
      if (!termo) return true;
      return [o.id, o.cliente_nome, o.veiculo_placa, o.veiculo_modelo, o.descricao]
        .filter(Boolean).join(" ").toLowerCase().includes(termo);
    });
  }, [ordens, busca, filtroStatus]);

  async function alterarStatus(o, novoStatus) {
    if (novoStatus === o.status) return;
    try {
      await api.ordens.atualizar(o.id, { status: novoStatus });
      await carregar();
    } catch (e) {
      alert(e.message);
      await carregar();
    }
  }

  async function excluir(o) {
    if (!confirm(`Deseja realmente excluir a OS #${o.id}?`)) return;
    try {
      await api.ordens.excluir(o.id);
      await carregar();
    } catch (e) { alert(e.message); }
  }

  return (
    <>
      <Navbar usuario={usuario} onLogout={logout}
        acao={{ texto: "Nova OS", rota: "/cadastro-ordem-servico" }} />

      <main className="container content-offset-navbar">
        <div className="mb-4">
          <h1 className="fw-bold m-0 text-brand-dark">Gerenciamento de Ordens de Serviço</h1>
          <p className="text-muted m-0">Consulte e gerencie as ordens de serviço da oficina.</p>
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
              <i className="fa-solid fa-magnifying-glass me-2 text-brand-blue"></i>Filtrar Ordens de Serviço
            </h5>
            <div className="row g-3 align-items-end">
              <div className="col-md-8">
                <label className="form-label fw-semibold">Pesquisar</label>
                <input className="form-control" placeholder="Cliente, placa, modelo ou descrição..."
                  value={busca} onChange={(e) => setBusca(e.target.value)} />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">Status</label>
                <select className="form-select" value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
                  <option value="">Todos</option>
                  <option value="pendente">Pendente</option>
                  <option value="em_andamento">Em andamento</option>
                  <option value="concluida">Concluída</option>
                  <option value="cancelada">Cancelada</option>
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
                    <th>ID</th><th>Cliente</th><th>Veículo</th><th>Descrição</th>
                    <th>Status</th><th>Valor</th><th className="text-end">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {carregando ? (
                    <tr><td colSpan="7" className="empty-state">Carregando...</td></tr>
                  ) : filtradas.length === 0 ? (
                    <tr><td colSpan="7" className="empty-state">
                      {ordens.length === 0 ? "Nenhuma ordem de serviço cadastrada." : "Nenhuma ordem encontrada para esse filtro."}
                    </td></tr>
                  ) : filtradas.map((o) => (
                    <tr key={o.id}>
                      <td>{o.id}</td>
                      <td>{o.cliente_nome || "-"}</td>
                      <td>{o.veiculo_modelo} {o.veiculo_placa ? `- ${o.veiculo_placa}` : ""}</td>
                      <td>{o.descricao || "-"}</td>
                      <td>
                        <select className="form-select form-select-sm"
                          value={o.status} onChange={(e) => alterarStatus(o, e.target.value)}>
                          <option value="pendente">Pendente</option>
                          <option value="em_andamento">Em andamento</option>
                          <option value="concluida">Concluída</option>
                          <option value="cancelada">Cancelada</option>
                        </select>
                      </td>
                      <td>{moeda(o.valor_total)}</td>
                      <td className="text-end">
                        <button className="btn btn-warning btn-sm me-1"
                          onClick={() => navigate(`/cadastro-ordem-servico?id=${o.id}`)}>
                          <i className="fa-solid fa-pen"></i>
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => excluir(o)}>
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
