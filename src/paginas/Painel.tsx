import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { PlusCircle, LogOut, BookOpen, User, ArrowUp, ArrowDown, Settings } from 'lucide-react';
import type { PlanoEnsino, Professor, Curso } from '../tipos';
import toast from 'react-hot-toast';

export function Painel() {
  const navigate = useNavigate();
  const [planosEnsino, setPlanosEnsino] = useState<PlanoEnsino[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [professor, setProfessor] = useState<Professor | null>(null);
  const [cursos, setCursos] = useState<Record<string, Curso>>({});
  const [filtroCurso, setFiltroCurso] = useState<string>('');
  const [filtroPeriodo, setFiltroPeriodo] = useState<string>('');
  const [filtroStatus, setFiltroStatus] = useState<string>('');
  const [ordenarPor, setOrdenarPor] = useState<string>('titulo');
  const [ordemAscendente, setOrdemAscendente] = useState<boolean>(true);

  useEffect(() => {
    async function carregarDados() {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          navigate('/login');
          return;
        }

        // Carregar dados do professor
        const { data: professorData, error: professorError } = await supabase
          .from('professores')
          .select('*')
          .eq('id', user.id)
          .single();

        if (professorError) throw professorError;
        setProfessor(professorData);

        // Carregar cursos
        const { data: cursosData, error: cursosError } = await supabase
          .from('cursos')
          .select('*')
          .order('nome');

        if (cursosError) throw cursosError;
        const cursosMap = Object.fromEntries(
          (cursosData || []).map(curso => [curso.id, curso])
        );
        setCursos(cursosMap);

        // Carregar planos de ensino
        const { data: planosData, error: erroPlanos } = await supabase
          .from('planos_ensino')
          .select('*')
          .order('created_at', { ascending: false });

        if (erroPlanos) {
          console.error('Erro ao carregar planos:', erroPlanos);
        } else {
          setPlanosEnsino(planosData || []);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, [navigate]);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/login');
  }

  const planosFiltrados = planosEnsino
    .filter(plano => {
      const filtroCursoValido = filtroCurso ? plano.curso_id === filtroCurso : true;
      const filtroPeriodoValido = filtroPeriodo ? plano.periodo === filtroPeriodo : true;
      const filtroStatusValido = filtroStatus ? plano.status === filtroStatus : true;
      return filtroCursoValido && filtroPeriodoValido && filtroStatusValido;
    })
    .sort((a, b) => {
      if (ordenarPor === 'titulo') {
        return ordemAscendente ? a.titulo.localeCompare(b.titulo) : b.titulo.localeCompare(a.titulo);
      } else if (ordenarPor === 'data') {
        return ordemAscendente ? new Date(a.atualizado_em).getTime() - new Date(b.atualizado_em).getTime() : new Date(b.atualizado_em).getTime() - new Date(a.atualizado_em).getTime();
      } else if (ordenarPor === 'disciplina') {
        return ordemAscendente ? a.disciplina.localeCompare(b.disciplina) : b.disciplina.localeCompare(a.disciplina);
      }
      return 0;
    });

  if (carregando) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-semibold text-gray-900">
                Sistema de Planos de Ensino
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-700">
                <User className="h-5 w-5 text-gray-400 mr-2" />
                <span>Olá, {professor?.nome}</span>
              </div>
              <button
                onClick={() => navigate('/alterar-dados-usuario')}
                className="inline-flex items-center px-2 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Settings className="h-5 w-5" />
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

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-wrap items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="block text-sm font-medium text-gray-700">Filtros</label>
              <select
                value={filtroCurso}
                onChange={(e) => setFiltroCurso(e.target.value)}
                className="mt-1 block w-32 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm font-medium text-gray-700"
              >
                <option value="">Todos Cursos</option>
                {Object.values(cursos).map(curso => (
                  <option key={curso.id} value={curso.id}>
                    {curso.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={filtroPeriodo}
                onChange={(e) => setFiltroPeriodo(e.target.value)}
                className="mt-1 block w-32 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm font-medium text-gray-700"
              >
                <option value="">Todos Períodos</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                  <option key={num} value={`${num}º Período`}>
                    {num}º Período
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="mt-1 block w-32 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm font-medium text-gray-700"
              >
                <option value="">Todos status</option>
                <option value="rascunho">Rascunho</option>
                <option value="finalizado">Finalizado</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <label className="block text-sm font-medium text-gray-700">Ordenar</label>
              <button
                onClick={() => {
                  setOrdenarPor('titulo');
                  setOrdemAscendente(!ordemAscendente);
                }}
                className="inline-flex items-center px-2 py-1 mt-1 h-6 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Título {ordenarPor === 'titulo' && (ordemAscendente ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />)}
              </button>
              <button
                onClick={() => {
                  setOrdenarPor('data');
                  setOrdemAscendente(!ordemAscendente);
                }}
                className="inline-flex items-center px-2 py-1 mt-1 h-6 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Data de Atualização {ordenarPor === 'data' && (ordemAscendente ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />)}
              </button>
              <button
                onClick={() => {
                  setOrdenarPor('disciplina');
                  setOrdemAscendente(!ordemAscendente);
                }}
                className="inline-flex items-center px-2 py-1 mt-1 h-6 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Disciplina {ordenarPor === 'disciplina' && (ordemAscendente ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />)}
              </button>
            </div>
          </div>
          <button
            onClick={() => navigate('/novo-plano')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Novo Plano
          </button>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Meus Planos de Ensino</h2>
          </div>

          {planosFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Nenhum plano de ensino encontrado
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Tente ajustar os filtros ou criar um novo plano de ensino.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => navigate('/novo-plano')}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Criar novo plano
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {planosFiltrados.map((plano) => (
                <div
                  key={plano.id}
                  onClick={() => navigate(`/editar-plano/${plano.id}`)}
                  className="relative bg-white border rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                >
                  <div className="absolute top-4 right-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${plano.status === 'finalizado'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                      }`}>
                      {plano.status === 'finalizado' ? 'Finalizado' : 'Rascunho'}
                    </span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 truncate pr-20">
                    {plano.titulo}
                  </h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-500">
                      Disciplina: {plano.disciplina}
                    </p>
                    <p className="text-sm text-gray-500">
                      Período: {plano.periodo}
                    </p>
                    <p className="text-sm text-gray-500">
                      Curso: {cursos[plano.curso_id]?.nome}
                    </p>
                    <p className="text-sm text-gray-500">
                      Atualizado em: {new Date(plano.atualizado_em).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}