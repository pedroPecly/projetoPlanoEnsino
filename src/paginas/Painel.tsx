import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { PlusCircle, LogOut, BookOpen, User, Folder, ChevronRight, ChevronDown, FileText, File, ArrowUp, ArrowDown, Upload, Calendar, GraduationCap, Clock } from 'lucide-react';
import type { PlanoEnsino, Professor, Curso } from '../tipos';
import toast from 'react-hot-toast';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ImportPlano } from '../components/ImportPlano';
import { PlanoPDF } from '../components/PlanoPDF';
import { GerenciarCursos } from '../components/GerenciarCursos';
import { GerenciarUsuarios } from '../components/GerenciarUsuarios';

type OrganizedPlanos = {
  [anoPeriodo: string]: {
    [cursoId: string]: {
      [periodo: string]: PlanoEnsino[]
    }
  }
};

export function Painel() {
  const navigate = useNavigate();
  const [planosEnsino, setPlanosEnsino] = useState<PlanoEnsino[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [professor, setProfessor] = useState<Professor | null>(null);
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [cursos, setCursos] = useState<Record<string, Curso>>({});
  const [filtroCurso, setFiltroCurso] = useState<string>('');
  const [filtroPeriodo, setFiltroPeriodo] = useState<string>('');
  const [filtroAnoPeriodo, setFiltroAnoPeriodo] = useState<string>('');
  const [filtroStatus, setFiltroStatus] = useState<string>('');
  const [ordenarPor, setOrdenarPor] = useState<string>('titulo');
  const [ordemAscendente, setOrdemAscendente] = useState<boolean>(true);
  const [menuAberto, setMenuAberto] = useState<boolean>(false);
  const [termoPesquisa, setTermoPesquisa] = useState<string>('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [showGerenciarCursos, setShowGerenciarCursos] = useState(false);
  const [expandedAnoPeriodo, setExpandedAnoPeriodo] = useState<string | null>(null);
  const [expandedCurso, setExpandedCurso] = useState<string | null>(null);
  const [showGerenciarUsuarios, setShowGerenciarUsuarios] = useState(false);
  const [anosPeriodsDisponiveis, setAnosPeriodsDisponiveis] = useState<string[]>([]);

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    if (planosEnsino.length > 0) {
      const anosUnicos = [...new Set(planosEnsino.map(plano => plano.ano_periodo))]
        .sort((a, b) => b.localeCompare(a));
      setAnosPeriodsDisponiveis(anosUnicos);
    }
  }, [planosEnsino]);

  async function carregarDados() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data: professorData, error: professorError } = await supabase
        .from('professores')
        .select('*')
        .eq('id', user.id)
        .single();

      if (professorError) throw professorError;
      setProfessor(professorData);

      const { data: cursosData, error: cursosError } = await supabase
        .from('cursos')
        .select('*')
        .order('nome');

      if (cursosError) throw cursosError;
      const cursosMap = Object.fromEntries(
        (cursosData || []).map(curso => [curso.id, curso])
      );
      setCursos(cursosMap);

      const { data: planosData, error: erroPlanos } = await supabase
        .from('planos_ensino')
        .select('*')
        .order('created_at', { ascending: false });

      if (erroPlanos) {
        console.error('Erro ao carregar planos:', erroPlanos);
      } else if (planosData) {
        const parsedPlanos = planosData.map(plano => ({
          ...plano,
          objetivos_especificos: tryParseJSON(plano.objetivos_especificos) || [],
          conteudo_programatico: tryParseJSON(plano.conteudo_programatico) || [],
          cronograma: tryParseJSON(plano.cronograma) || [],
          recursos_utilizados: tryParseJSON(plano.recursos_utilizados) || [],
          visitas_tecnicas: tryParseJSON(plano.visitas_tecnicas) || [],
          bibliografia_basica: tryParseJSON(plano.bibliografia_basica) || [],
          bibliografia_complementar: tryParseJSON(plano.bibliografia_complementar) || []
        }));
        setPlanosEnsino(parsedPlanos);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setCarregando(false);
    }
  }

  function tryParseJSON(jsonString: any) {
    if (!jsonString) return null;
    try {
      if (typeof jsonString === 'string') {
        return JSON.parse(jsonString);
      }
      return jsonString;
    } catch (e) {
      console.error('Error parsing JSON:', e);
      return null;
    }
  }

  async function carregarProfessores() {
    try {
      const { data, error } = await supabase
        .from('professores')
        .select('*')
        .order('nome');

      if (error) throw error;

      setProfessores(data || []);
    } catch (error) {
      console.error('Erro ao carregar professores:', error);
      toast.error('Erro ao carregar professores');
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/login');
  }

  const planosFiltrados = planosEnsino
    .filter(plano => {
      const filtroCursoValido = filtroCurso ? plano.curso_id === filtroCurso : true;
      const filtroPeriodoValido = filtroPeriodo ? plano.periodo === filtroPeriodo : true;
      const filtroStatusValido = filtroStatus ? plano.status === filtroStatus : true;
      const filtroAnoPeriodoValido = filtroAnoPeriodo ? plano.ano_periodo === filtroAnoPeriodo : true;
      const pesquisaValida = plano.titulo.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
        plano.disciplina.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
        cursos[plano.curso_id]?.nome.toLowerCase().includes(termoPesquisa.toLowerCase());
      return filtroCursoValido && filtroPeriodoValido && filtroStatusValido && filtroAnoPeriodoValido && pesquisaValida;
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

  function organizarPlanos(planos: PlanoEnsino[]): OrganizedPlanos {
    return planos
      .filter(plano => plano.status === 'finalizado') // Filtra apenas os planos finalizados
      .reduce((acc, plano) => {
        const { ano_periodo, curso_id, periodo } = plano;

        if (!acc[ano_periodo]) {
          acc[ano_periodo] = {};
        }
        if (!acc[ano_periodo][curso_id]) {
          acc[ano_periodo][curso_id] = {};
        }
        if (!acc[ano_periodo][curso_id][periodo]) {
          acc[ano_periodo][curso_id][periodo] = [];
        }

        acc[ano_periodo][curso_id][periodo].push(plano);
        return acc;
      }, {} as OrganizedPlanos);
  }

  function renderPlanosList(planos: PlanoEnsino[]) {
    return planos.map((plano) => (
      <div
        key={plano.id}
        onClick={() => navigate(`/editar-plano/${plano.id}`)}
        className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 cursor-pointer ml-8 rounded-md transition-all duration-200"
      >
        <File className="h-4 w-4 text-gray-400" />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{plano.disciplina}</p>
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <User className="h-3 w-3" />
            <span>{plano.professor_nome}</span>
            <Clock className="h-3 w-3 ml-2" />
            <span>{new Date(plano.atualizado_em).toLocaleDateString()}</span>
          </div>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${plano.status === 'finalizado'
          ? 'bg-green-100 text-green-800'
          : 'bg-yellow-100 text-yellow-800'
          }`}>
          {plano.status === 'finalizado' ? 'Finalizado' : 'Rascunho'}
        </span>
      </div>
    ));
  }

  const organizedPlanos = professor?.admin ? organizarPlanos(planosEnsino) : {};

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
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
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
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-full mx-auto py-4 px-4 sm:px-6 lg:px-8">
        {!professor?.admin && (
          <div className="mb-4 flex flex-wrap items-center justify-between space-y-4 lg:space-y-0">
            <div className="relative flex items-center space-x-2">
              <button
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition duration-200"
                onClick={() => setMenuAberto(!menuAberto)}
              >
                Filtros e Ordem {(menuAberto ? <ArrowDown className="ml-1 h-4 w-4" /> : <ArrowUp className="ml-1 h-4 w-4" />)}
              </button>
              <input
                type="text"
                value={termoPesquisa}
                onChange={(e) => setTermoPesquisa(e.target.value)}
                placeholder="Pesquisar..."
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition duration-200 w-56 lg:w-80 focus:outline-none"
              />
              <div
                className={`absolute top-12 left-0 mt-2 w-56 lg:w-72 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 transition-all duration-300 transform origin-top z-50 ${menuAberto ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'
                  }`}
              >
                {menuAberto && (
                  <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                    <div className="px-4 py-2">
                      <label className="block text-sm font-medium text-gray-700">Filtros</label>
                      <select
                        value={filtroAnoPeriodo}
                        onChange={(e) => setFiltroAnoPeriodo(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:outline-none hover:bg-gray-50 text-sm font-medium text-gray-700"
                      >
                        <option value="">Todos Anos/Períodos</option>
                        {anosPeriodsDisponiveis.map(anoPeriodo => (
                          <option key={anoPeriodo} value={anoPeriodo}>
                            {anoPeriodo}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="px-4 py-2">
                      <select
                        value={filtroCurso}
                        onChange={(e) => setFiltroCurso(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:outline-none hover:bg-gray-50 text-sm font-medium text-gray-700"
                      >
                        <option value="">Todos Cursos</option>
                        {Object.values(cursos).map(curso => (
                          <option key={curso.id} value={curso.id}>
                            {curso.nome}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="px-4 py-2">
                      <select
                        value={filtroPeriodo}
                        onChange={(e) => setFiltroPeriodo(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:outline-none hover:bg-gray-50 text-sm font-medium text-gray-700"
                      >
                        <option value="">Todos Períodos</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                          <option key={num} value={`${num}º Período`}>
                            {num}º Período
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="px-4 py-2">
                      <select
                        value={filtroStatus}
                        onChange={(e) => setFiltroStatus(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:outline-none hover:bg-gray-50 text-sm font-medium text-gray-700"
                      >
                        <option value="">Todos status</option>
                        <option value="rascunho">Rascunho</option>
                        <option value="finalizado">Finalizado</option>
                      </select>
                    </div>
                    <div className="px-4 py-2">
                      <label className="block text-sm font-medium text-gray-700">Ordenar</label>
                      <button
                        onClick={() => {
                          setOrdenarPor('titulo');
                          setOrdemAscendente(!ordemAscendente);
                        }}
                        className="inline-flex items-center px-2 py-1 mt-1 w-full border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition duration-200"
                      >
                        Título {ordenarPor === 'titulo' && (ordemAscendente ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />)}
                      </button>
                      <button
                        onClick={() => {
                          setOrdenarPor('data');
                          setOrdemAscendente(!ordemAscendente);
                        }}
                        className="inline-flex items-center px-2 py-1 mt-1 w-full border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition duration-200"
                      >
                        Data de Atualização {ordenarPor === 'data' && (ordemAscendente ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />)}
                      </button>
                      <button
                        onClick={() => {
                          setOrdenarPor('disciplina');
                          setOrdemAscendente(!ordemAscendente);
                        }}
                        className="inline-flex items-center px-2 py-1 mt-1 w-full border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition duration-200"
                      >
                        Disciplina {ordenarPor === 'disciplina' && (ordemAscendente ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />)}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              {/*<button
                onClick={() => setShowImportModal(true)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition duration-200"
              >
                <Upload className="h-5 w-5 mr-2" />
                Importar PDF
              </button>*/}
              <button
                onClick={() => navigate('/novo-plano')}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#2b9f3f] hover:bg-[#248a35] transition duration-200"
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                Novo Plano
              </button>
            </div>
          </div>
        )}
        {professor?.admin && (
          <div className="flex justify-start mb-4 space-x-4"> {/* Adicionado space-x-4 para espaçamento padrão */}
            <button
              onClick={() => setShowGerenciarCursos(true)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <GraduationCap className="h-5 w-5 mr-2" />
              Gerenciar Cursos
            </button>
            <button
              onClick={() => {
                setShowGerenciarUsuarios(true);
                carregarProfessores();
              }}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <User className="h-5 w-5 mr-2" />
              Gerenciar Usuários
            </button>
          </div>
        )}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              {professor?.admin ? 'Todos os Planos de Ensino' : 'Meus Planos de Ensino'}
            </h2>
          </div>

          {professor?.admin ? (
            Object.keys(organizedPlanos).length === 0 ? (
              <div className="text-center py-12">
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Nenhum plano de ensino encontrado
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Não há planos de ensino cadastrados no sistema.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {Object.entries(organizedPlanos)
                  .sort(([a], [b]) => b.localeCompare(a))
                  .map(([anoPeriodo, cursosPlanos]) => (
                    <div key={anoPeriodo} className="bg-white">
                      <button
                        onClick={() => setExpandedAnoPeriodo(expandedAnoPeriodo === anoPeriodo ? null : anoPeriodo)}
                        className="w-full flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors duration-200"
                      >
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-5 w-5 text-[#2b9f3f]" />
                          <span className="font-medium text-gray-900">Ano/Período: {anoPeriodo}</span>
                        </div>
                        {expandedAnoPeriodo === anoPeriodo ? (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        )}
                      </button>

                      {expandedAnoPeriodo === anoPeriodo && (
                        <div className="ml-4 bg-gray-50 rounded-lg m-4">
                          {Object.entries(cursosPlanos)
                            .sort(([a, b]) => {
                              const cursoA = cursos[a]?.nome || '';
                              const cursoB = cursos[b as unknown as string]?.nome || '';
                              return cursoA.localeCompare(cursoB);
                            })
                            .map(([cursoId, periodos]) => {
                              const cursoNome = cursos[cursoId]?.nome;
                              if (!cursoNome) return null;

                              return (
                                <div key={cursoId} className="border-l-4 border-[#2b9f3f] bg-white rounded-lg shadow-sm m-4">
                                  <button
                                    onClick={() => setExpandedCurso(expandedCurso === cursoId ? null : cursoId)}
                                    className="w-full flex items-center justify-between px-6 py-3 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                                  >
                                    <div className="flex items-center space-x-3">
                                      <GraduationCap className="h-5 w-5 text-[#2b9f3f]" />
                                      <span className="font-medium text-gray-900">{cursoNome}</span>
                                    </div>
                                    {expandedCurso === cursoId ? (
                                      <ChevronDown className="h-5 w-5 text-gray-400" />
                                    ) : (
                                      <ChevronRight className="h-5 w-5 text-gray-400" />
                                    )}
                                  </button>

                                  {expandedCurso === cursoId && (
                                    <div className="ml-4">
                                      {Object.entries(periodos)
                                        .sort(([a], [b]) => {
                                          const numA = parseInt(a.split('º')[0]);
                                          const numB = parseInt(b.split('º')[0]);
                                          return numA - numB;
                                        })
                                        .map(([periodo, planos]) => (
                                          <div key={periodo} className="border-l-2 border-gray-200 m-4">
                                            <div className="flex items-center justify-between px-6 py-3 bg-gray-50 rounded-lg">
                                              <div className="flex items-center space-x-3">
                                                <BookOpen className="h-5 w-5 text-[#2b9f3f]" />
                                                <span className="font-medium text-gray-900">{periodo}</span>
                                                <span className="text-sm text-gray-500">({planos.length} planos)</span>
                                              </div>
                                              <PDFDownloadLink
                                                document={
                                                  <PlanoPDF
                                                    planos={planos}
                                                    curso={cursoNome}
                                                    periodo={periodo.split('º')[0]}
                                                  />
                                                }
                                                fileName={`planos-${anoPeriodo}-${cursoNome}-${periodo}.pdf`}
                                                className="flex items-center space-x-2 text-sm text-[#2b9f3f] hover:text-[#248a35] transition-colors duration-200"
                                              >
                                                {({ loading }) => (
                                                  <>
                                                    <FileText className="h-5 w-5" />
                                                    <span>{loading ? 'Gerando PDF...' : 'Baixar PDF'}</span>
                                                  </>
                                                )}
                                              </PDFDownloadLink>
                                            </div>
                                            <div className="space-y-1 mt-2">
                                              {renderPlanosList(planos)}
                                            </div>
                                          </div>
                                        ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )
          ) : planosFiltrados.length === 0 ? (
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
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#2b9f3f] hover:bg-[#248a35] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200"
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Criar novo plano
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 transition duration-200">
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
                    <p className='text-sm text-gray-500'>
                      Ano/periodo: {plano.ano_periodo}
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
        {showImportModal && (
          <ImportPlano onClose={() => setShowImportModal(false)} />
        )}
        {showGerenciarCursos && (
          <GerenciarCursos
            cursos={Object.values(cursos)}
            onClose={() => setShowGerenciarCursos(false)}
            onUpdate={carregarDados}
          />
        )}
        {showGerenciarUsuarios && (
          <GerenciarUsuarios
            usuarios={professores}
            onClose={() => setShowGerenciarUsuarios(false)}
            onUpdate={() => {
              carregarDados();
              carregarProfessores();
            }}
          />
        )}
      </main>
    </div>
  );
}