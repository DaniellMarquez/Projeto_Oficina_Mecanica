import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import CadastroCliente from "./pages/CadastroCliente";
import Garagem from "./pages/Garagem";
import HistoricoServicos from "./pages/HistoricoServicos";
import Agendamento from "./pages/Agendamento";
import Sistema from "./pages/Sistema";
import Clientes from "./pages/Clientes";
import Funcionarios from "./pages/Funcionarios";
import Veiculos from "./pages/Veiculos";
import Estoque from "./pages/Estoque";
import Servicos from "./pages/Servicos";
import OrdensServico from "./pages/OrdensServico";
import CadastroOrdemServico from "./pages/CadastroOrdemServico";
import Agendamentos from "./pages/Agendamentos";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Público */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro-cliente" element={<CadastroCliente />} />

          {/* Cliente */}
          <Route path="/garagem" element={<ProtectedRoute papeis={["cliente"]}><Garagem /></ProtectedRoute>} />
          <Route path="/historico-servicos" element={<ProtectedRoute papeis={["cliente"]}><HistoricoServicos /></ProtectedRoute>} />
          <Route path="/agendamento" element={<ProtectedRoute papeis={["cliente"]}><Agendamento /></ProtectedRoute>} />

          {/* Painel unificado: admin + funcionário */}
          <Route path="/painel-admin" element={<ProtectedRoute papeis={["admin", "funcionario"]}><Sistema /></ProtectedRoute>} />

          {/* Admin-only */}
          <Route path="/painel-clientes" element={<ProtectedRoute papeis={["admin"]}><Clientes /></ProtectedRoute>} />
          <Route path="/painel-funcionarios" element={<ProtectedRoute papeis={["admin"]}><Funcionarios /></ProtectedRoute>} />
          <Route path="/painel-veiculos" element={<ProtectedRoute papeis={["admin"]}><Veiculos /></ProtectedRoute>} />
          <Route path="/painel-estoque" element={<ProtectedRoute papeis={["admin"]}><Estoque /></ProtectedRoute>} />
          <Route path="/painel-servicos" element={<ProtectedRoute papeis={["admin"]}><Servicos /></ProtectedRoute>} />

          {/* Staff (admin + funcionário) — só OS e agendamentos */}
          <Route path="/painel-ordens" element={<ProtectedRoute papeis={["admin", "funcionario"]}><OrdensServico /></ProtectedRoute>} />
          <Route path="/cadastro-ordem-servico" element={<ProtectedRoute papeis={["admin", "funcionario"]}><CadastroOrdemServico /></ProtectedRoute>} />
          <Route path="/painel-agendamentos" element={<ProtectedRoute papeis={["admin", "funcionario"]}><Agendamentos /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;