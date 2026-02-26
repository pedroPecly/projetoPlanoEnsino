import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { BookOpen, Eye, EyeOff, AlertCircle, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setErro('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (error) {
        if (error.message === 'Invalid login credentials') {
          setErro('E-mail ou senha incorretos. Verifique suas credenciais.');
        } else {
          setErro('Erro ao fazer login. Tente novamente.');
        }
        return;
      }

      toast.success('Login realizado com sucesso!');
      navigate('/painel');
    } catch (error) {
      setErro('Erro ao fazer login. Tente novamente.');
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
            Gerencie seus<br />Planos de Ensino<br />com eficiência.
          </h1>
          <p className="mt-4 text-green-100 text-lg leading-relaxed">
            Crie, edite e exporte planos de ensino completos,<br />
            com controle total sobre conteúdo, cronograma e bibliografia.
          </p>
        </div>
        <p className="text-green-200 text-sm">
          Sistema de Planos de Ensino © {new Date().getFullYear()}
        </p>
      </div>

      {/* Painel direito — formulário */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 bg-gray-50">
        <div className="max-w-md w-full mx-auto">
          {/* Logo mobile */}
          <div className="flex items-center space-x-2 mb-10 lg:hidden">
            <BookOpen className="h-7 w-7 text-[#2b9f3f]" />
            <span className="text-gray-900 text-lg font-bold">Planos de Ensino</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Bem-vindo de volta</h2>
            <p className="mt-2 text-gray-500">Acesse sua conta para continuar.</p>
          </div>

          {erro && (
            <div className="mb-6 flex items-start gap-3 rounded-lg bg-red-50 border border-red-200 p-4">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{erro}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
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
              <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-1.5">
                Senha
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
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Entrar
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Não tem uma conta?{' '}
            <Link to="/criar-conta" className="font-semibold text-[#2b9f3f] hover:text-[#248a35] transition">
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}