import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Save, ArrowLeft, User, LogOut, BookOpen, Eye, EyeOff, Shield, Mail, Hash } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Professor } from '../tipos';

export function AlterarDadosUsuario() {
  const navigate = useNavigate();
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [professor, setProfessor] = useState<Professor | null>(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [matriculaSiape, setMatriculaSiape] = useState('');
  const [professorId, setProfessorId] = useState('');

  useEffect(() => {
    carregarDadosUsuario();
  }, []);

  async function carregarDadosUsuario() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/login'); return; }

      const { data: prof, error } = await supabase
        .from('professores')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setNome(prof.nome);
      setEmail(prof.email);
      setMatriculaSiape(prof.matricula_siape || '');
      setProfessorId(prof.id);
      setProfessor(prof);
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
    setSalvando(true);

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
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-[#2b9f3f]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="text-sm text-gray-500">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
              <BookOpen className="h-7 w-7 text-[#2b9f3f]" />
              <span className="text-lg font-bold text-gray-900">Planos de Ensino</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:block text-sm text-gray-500">Olá, <strong className="text-gray-700">{professor?.nome}</strong></span>
              <button
                onClick={() => navigate('/alterar-dados-usuario')}
                className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:text-[#2b9f3f] hover:border-[#2b9f3f] transition"
                title="Meu perfil"
              >
                <User className="h-5 w-5" />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:text-red-600 hover:border-red-300 transition"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <button
          onClick={() => navigate('/painel')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao Painel
        </button>

        {/* Cabeçalho da página */}
        <div className="mb-8 flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-[#2b9f3f]/10 flex items-center justify-center">
            <User className="h-7 w-7 text-[#2b9f3f]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
            <p className="text-sm text-gray-500 mt-0.5">Gerencie suas informações pessoais e de acesso</p>
          </div>
        </div>

        <form onSubmit={handleSalvar} className="space-y-6">
          {/* Card: Informações pessoais */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Informações Pessoais</h2>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nome completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="nome"
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="block w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2b9f3f] focus:border-[#2b9f3f] transition"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2b9f3f] focus:border-[#2b9f3f] transition"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="matricula_siape" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Matrícula SIAPE
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="matricula_siape"
                    type="text"
                    required
                    value={matriculaSiape}
                    onChange={(e) => setMatriculaSiape(e.target.value)}
                    className="block w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2b9f3f] focus:border-[#2b9f3f] transition"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card: Segurança */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              <Shield className="h-4 w-4 text-gray-500" />
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Segurança</h2>
            </div>
            <div className="px-6 py-5">
              <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-1.5">
                Nova senha <span className="text-gray-400 font-normal">(deixe em branco para não alterar)</span>
              </label>
              <div className="relative">
                <input
                  id="senha"
                  type={mostrarSenha ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2b9f3f] focus:border-[#2b9f3f] transition pr-11"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {mostrarSenha ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/painel')}
              className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#2b9f3f] hover:bg-[#248a35] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2b9f3f] disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {salvando ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Salvar alterações
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
