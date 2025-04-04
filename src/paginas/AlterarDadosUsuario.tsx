import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Save, ArrowLeft, User, LogOut, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Professor } from '../tipos';

export function AlterarDadosUsuario() {
  const navigate = useNavigate();
  const [carregando, setCarregando] = useState(true);
  const [professor, setProfessor] = useState<Professor | null>(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [matriculaSiape, setMatriculaSiape] = useState('');
  const [professorId, setProfessorId] = useState('');

  useEffect(() => {
    carregarDadosUsuario();
  }, []);

  async function carregarDadosUsuario() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data: professor, error } = await supabase
        .from('professores')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      console.log('Professor carregado:', professor); // Adicione este log
      setNome(professor.nome);
      setEmail(professor.email);
      setMatriculaSiape(professor.matricula_siape || '');
      setProfessorId(professor.id);
      setProfessor(professor); // Certifique-se de atualizar o estado `professor`
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      toast.error('Erro ao carregar dados do usuário');
    } finally {
      setCarregando(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/login');
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);

    try {
      const { error: updateError } = await supabase
        .from('professores')
        .update({ nome, email, matricula_siape: matriculaSiape })
        .eq('id', professorId);

      if (updateError) throw updateError;

      if (senha) {
        const { error: passwordError } = await supabase.auth.updateUser({ password: senha });
        if (passwordError) throw passwordError;
      }

      toast.success('Dados atualizados com sucesso!');
      navigate('/painel');
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      toast.error('Erro ao atualizar dados');
    } finally {
      setCarregando(false);
    }
  }

  if (carregando) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Cabeçalho */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-[#2b9f3f]" />
              <span className="ml-2 text-xl font-semibold text-gray-900">
                Planos de Ensino
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-700">
                <span>Olá, {professor?.nome}</span>
              </div>
              <button
                onClick={() => navigate('/alterar-dados-usuario')}
                className="inline-flex items-center px-2 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <User className="h-5 w-5" />
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Conteúdo principal */}
      <div className="flex flex-col justify-center py-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <button
            onClick={() => navigate('/painel')}
            className="mt-4 flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar ao Painel
          </button>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleSalvar}>
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
                  Nome completo
                </label>
                <div className="mt-1">
                  <input
                    id="nome"
                    name="nome"
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#2b9f3f] focus:border-[#2b9f3f]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  E-mail
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#2b9f3f] focus:border-[#2b9f3f]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="matricula_siape" className="block text-sm font-medium text-gray-700">
                  Matrícula SIAPE
                </label>
                <div className="mt-1">
                  <input
                    id="matricula_siape"
                    name="matricula_siape"
                    type="text"
                    required
                    value={matriculaSiape}
                    onChange={(e) => setMatriculaSiape(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#2b9f3f] focus:border-[#2b9f3f]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="senha" className="block text-sm font-medium text-gray-700">
                  Nova Senha (deixe em branco para não alterar)
                </label>
                <div className="mt-1">
                  <input
                    id="senha"
                    name="senha"
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#2b9f3f] focus:border-[#2b9f3f]"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={carregando}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2b9f3f] hover:bg-[#248a35] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2b9f3f] disabled:opacity-50"
                >
                  {carregando ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}