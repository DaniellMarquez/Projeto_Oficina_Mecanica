import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function Agendamento() {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();
  const [veiculos, setVeiculos] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [form, setForm] = useState({ veiculo_id: "", data_hora: "", observacoes: "" });
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState(false);

  async function carregar() {
    if (!usuario) return;
    try {
      const [vs, ags] = await Promise.all([
        api.clientes.veiculos(usuario.id),
        api.clientes.agendamentos(usuario.id),
      ]);
      setVeiculos(vs);
      setAgendamentos(ags);
    } catch (e) {
      setErro(true); setMensagem(e.message);
    }
  }

  useEffect(() => { carregar(); }, [usuario]);

  function alterar(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function salvar(e) {
    e.preventDefault();
    setMensagem(""); setErro(false);
    if (!form.veiculo_id) { setErro(true); setMensagem("Selecione um veículo."); return; }
    if (!form.data_hora) { setErro(true); setMensagem("Informe a data e o horário."); return; }
    try {
      await api.agendamentos.cadastrar({
        veiculo_id: Number(form.veiculo_id),
        data_hora: form.data_hora,
        observacoes: form.observacoes.trim() || null,
      });
      setMensagem("Agendamento realizado com sucesso!");
      setForm({ veiculo_id: "", data_hora: "", observacoes: "" });
      await carregar();
    } catch (err) {
      setErro(true); setMensagem(err.message);
    }
  }

  return (
    <>
      <Navbar usuario={usuario} onLogout={logout} />
      <main className="container form-container-600">
        <div className="card shadow border-0">
          <div className="card-body p-4">
            <h3 className="fw-bold section-title">Agendar atendimento</h3>
            <p className="text-muted">Escolha um veículo da sua garagem e a data desejada.</p>
            <form onSubmit={salvar}>
              <div className="mb-3">
                <label className="form-label">Veículo</label>
                <select className="form-select" name="veiculo_id"
                  value={form.veiculo_id} onChange={alterar} required>
                  <option value="">Selecione um veículo</option>
                  {veiculos.map((v) => (
                    <option key={v.id} value={v.id}>{v.marca} {v.modelo} - {v.placa}</option>
                  ))}
                </select>
                <div className="form-text">
                  Não encontrou o veículo?{" "}
                  <a href="/garagem">Cadastre-o na garagem.</a>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Data e hora</label>
                <input type="datetime-local" className="form-control" name="data_hora"
                  value={form.data_hora} onChange={alterar} required />
              </div>
              <div className="mb-4">
                <label className="form-label">Observações</label>
                <textarea className="form-control" name="observacoes" rows="3"
                  value={form.observacoes} onChange={alterar}></textarea>
              </div>
              <button className="btn btn-brand w-100 fw-bold">Confirmar agendamento</button>
              {mensagem && (
                <div className={`mt-3 text-center fw-bold ${erro ? "text-danger" : "text-success"}`}>
                  {mensagem}
                </div>
              )}
            </form>
          </div>
        </div>

        <div className="card shadow-sm border-0 mt-4">
          <div className="card-body">
            <h5 className="fw-bold">Meus agendamentos</h5>
            {agendamentos.length === 0 ? (
              <div className="empty-state">Nenhum agendamento cadastrado.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-brand">
                    <tr>
                      <th>Veículo</th>
                      <th>Data</th>
                      <th>Status</th>
                      <th>Observações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agendamentos.map((a) => (
                      <tr key={a.id}>
                        <td>{a.modelo} - {a.placa}</td>
                        <td>{new Date(a.data_hora).toLocaleString("pt-BR")}</td>
                        <td><span className="badge bg-secondary">{a.status}</span></td>
                        <td>{a.observacoes || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
