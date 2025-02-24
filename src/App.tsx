import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Login } from './paginas/Login';
import { CriarConta } from './paginas/CriarConta';
import { Painel } from './paginas/Painel';
import { NovoPlano } from './paginas/NovoPlano';
import { EditarPlano } from './paginas/EditarPlano';
import { AlterarDadosUsuario } from './paginas/AlterarDadosUsuario'; // Importar a nova página

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/criar-conta" element={<CriarConta />} />
          <Route path="/painel" element={<Painel />} />
          <Route path="/novo-plano" element={<NovoPlano />} />
          <Route path="/editar-plano/:id" element={<EditarPlano />} />
          <Route path="/alterar-dados-usuario" element={<AlterarDadosUsuario />} /> {/* Nova rota */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </>
  );
}

export default App;