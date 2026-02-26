import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { BookOpen, Eye, EyeOff, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

export function CriarConta() {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [matriculaSiape, setMatriculaSiape] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleCriarConta(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
          data: { nome },
        },
      });

      if (signUpError) {
        if (signUpError.message === 'User already registered') {
          toast.error('Este e-mail já possui uma conta cadastrada. Faça login.');
          navigate('/login');
          return;
        }
        if (signUpError.message.includes('Password should be at least')) {
          toast.error('A senha deve ter pelo menos 6 caracteres.');
          return;
        }
        throw signUpError;
      }

      if (!authData.user) throw new Error('Erro ao criar usuário');

      const { error: insertError } = await supabase
        .from('professores')
        .upsert([
          {
            id: authData.user.id,
            nome,
            email,
            matricula_siape: matriculaSiape,
          },
        ], {
          onConflict: 'id',
        });

      if (insertError) throw insertError;

      toast.success('Conta criada com sucesso! Faça login para continuar.');
      navigate('/login');
    } catch (error: any) {
      console.error('Erro ao criar conta:', error);
      toast.error(error?.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Painel esquerdo — identidade visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#2b9f3f] flex-col justify-between p-12">
        <div className="flex items-center space-x-3">
          <BookOpen className="h-9 w-9 text-white" />
          <span className="text-white text-xl font-bold tracking-wide">Planos de Ensino</span>
        </div>
        <div>
          <h1 className="text-4xl font-extrabold text-white leading-tight">
            Comece a criar seus<br />Planos de Ensino<br />hoje mesmo.
          </h1>
          <p className="mt-4 text-green-100 text-lg leading-relaxed">
            Cadastre-se gratuitamente e tenha acesso a todas<br />
            as ferramentas para uma gestão pedagógica eficiente.
          </p>
        </div>
        <p className="text-green-200 text-sm">
          Sistema de Planos de Ensino © {new Date().getFullYear()}
        </p>
      </div>

      {/* Painel direito — formulário */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 bg-gray-50 overflow-y-auto py-10">
        <div className="max-w-md w-full mx-auto">
          {/* Logo mobile */}
          <div className="flex items-center space-x-2 mb-10 lg:hidden">
            <BookOpen className="h-7 w-7 text-[#2b9f3f]" />
            <span className="text-gray-900 text-lg font-bold">Planos de Ensino</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Criar nova conta</h2>
            <p className="mt-2 text-gray-500">Preencha os dados abaixo para se cadastrar.</p>
          </div>

          <form className="space-y-5" onSubmit={handleCriarConta}>
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1.5">
                Nome completo
              </label>
              <input
                id="nome"
                name="nome"
                type="text"
                required
                placeholder="Prof. João da Silva"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2b9f3f] focus:border-[#2b9f3f] transition"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                E-mail institucional
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="professor@instituicao.edu.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2b9f3f] focus:border-[#2b9f3f] transition"
              />
            </div>

            <div>
              <label htmlFor="matricula_siape" className="block text-sm font-medium text-gray-700 mb-1.5">
                Matrícula SIAPE
              </label>
              <input
                id="matricula_siape"
                name="matricula_siape"
                type="text"
                required
                placeholder="Ex: 1234567"
                value={matriculaSiape}
                onChange={(e) => setMatriculaSiape(e.target.value)}
                className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2b9f3f] focus:border-[#2b9f3f] transition"
              />
            </div>

            <div>
              <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-1.5">
                Senha <span className="text-gray-400 font-normal">(mínimo 6 caracteres)</span>
              </label>
              <div className="relative">
                <input
                  id="senha"
                  name="senha"
                  type={mostrarSenha ? 'text' : 'password'}
                  required
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

            <button
              type="submit"
              disabled={carregando}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-[#2b9f3f] hover:bg-[#248a35] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2b9f3f] disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {carregando ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Criando conta...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Criar conta
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Já tem uma conta?{' '}
            <Link to="/login" className="font-semibold text-[#2b9f3f] hover:text-[#248a35] transition">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
