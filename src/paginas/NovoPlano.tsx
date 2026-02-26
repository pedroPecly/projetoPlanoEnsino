import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Save, CheckCircle, ArrowLeft, LogOut, User, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { CargaHoraria } from '../components/CargaHoraria';
import { ConteudoProgramatico } from '../components/ConteudoProgramatico';
import { Cronograma } from '../components/Cronograma';
import { RecursosUtilizados } from '../components/RecursosUtilizados';
import { VisitasTecnicas } from '../components/VisitasTecnicas';
import { Bibliografia } from '../components/Bibliografia';
import { ObjetivosEspecificos } from '../components/ObjetivosEspecificos';
import { PlanoSumario } from '../components/PlanoSumario';
import type { Curso, Professor } from '../tipos';

const summaryItems = [
  { id: '1', label: 'Ano/Período', target: 'ano-periodo' },
  { id: '2', label: 'Informações Básicas', target: 'info-basicas' },
  { id: '3', label: 'Ementa', target: 'ementa' },
  { id: '4', label: 'Objetivo', target: 'objetivo-geral' },
  { id: '5', label: 'Conteúdo', target: 'conteudo-programatico' },
  { id: '6', label: 'Metodologia', target: 'metodologia' },
  { id: '7', label: 'Atividades de Extensão', target: 'atividades_extensao' },
  { id: '8', label: 'Justificativa Modalidade', target: 'justificativa_modalidade' },
  { id: '9', label: 'Recursos Utilizados', target: 'recursos' },
  { id: '10', label: 'Visitas Técnicas', target: 'visitas' },
  { id: '11', label: 'Cronograma', target: 'cronograma' },
  { id: '12', label: 'Bibliografia', target: 'bibliografia' },

];

export function NovoPlano() {
  const navigate = useNavigate();
  const [professor, setProfessor] = useState<Professor | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const currentYear = new Date().getFullYear();
  const [plano, setPlano] = useState<{
    titulo: string;
    periodo: string;
    periodo_numero: number;
    curso_id: string;
    disciplina: string;
    abreviatura: string;
    ano_periodo: string;
    carga_horaria_total: number;
    carga_horaria_presencial: number;
    carga_horaria_presencial_percentual: number;
    carga_horaria_teorica: number;
    carga_horaria_teorica_percentual: number;
    carga_horaria_pratica: number;
    carga_horaria_pratica_percentual: number;
    carga_horaria_semanal: number;
    carga_horaria_semanal_percentual: number;
    carga_horaria_distancia?: number;
    carga_horaria_distancia_percentual?: number;
    ementa: string;
    atividades_extensao: string;
    justificativa_modalidade: string;
    objetivo_geral: string;
    objetivos_especificos: any[];
    conteudo_programatico: any[];
    cronograma: any[];
    recursos_utilizados: any[];
    visitas_tecnicas: any[];
    metodologia: string;
    bibliografia_basica: string[];
    bibliografia_complementar: string[];
  }>({
    titulo: '',
    periodo: '',
    periodo_numero: 1,
    curso_id: '',
    disciplina: '',
    abreviatura: '',
    ano_periodo: `${currentYear}/1`,
    carga_horaria_total: 0,
    carga_horaria_presencial: 0,
    carga_horaria_presencial_percentual: 0,
    carga_horaria_teorica: 0,
    carga_horaria_teorica_percentual: 0,
    carga_horaria_pratica: 0,
    carga_horaria_pratica_percentual: 0,
    carga_horaria_semanal: 0,
    carga_horaria_semanal_percentual: 0,
    carga_horaria_distancia: 0,
    carga_horaria_distancia_percentual: 0,
    ementa: '',
    atividades_extensao: '',
    justificativa_modalidade: '',
    objetivo_geral: '',
    objetivos_especificos: [],
    conteudo_programatico: [],
    cronograma: [],
    recursos_utilizados: [],
    visitas_tecnicas: [],
    metodologia: '',
    bibliografia_basica: [''],
    bibliografia_complementar: [''],
  });

  useEffect(() => {
    verificarAutenticacao();
    carregarCursos();
  }, []);

  async function verificarAutenticacao() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data: professor, error: professorError } = await supabase
        .from('professores')
        .select('*')
        .eq('id', user.id)
        .single();

      if (professorError || !professor) {
        const { error: insertError } = await supabase
          .from('professores')
          .insert([
            {
              id: user.id,
              nome: user.user_metadata.nome || 'Professor',
              email: user.email,
            },
          ]);

        if (insertError) {
          console.error('Erro ao criar registro do professor:', insertError);
          toast.error('Erro ao verificar dados do professor');
          navigate('/login');
        }
      } else {
        setProfessor(professor);
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      navigate('/login');
    } finally {
      setCarregando(false);
    }
  }

  async function carregarCursos() {
    try {
      const { data, error } = await supabase
        .from('cursos')
        .select('*')
        .order('nome');

      if (error) throw error;
      setCursos(data || []);
      if (data && data.length > 0) {
        setPlano(prev => ({ ...prev, curso_id: data[0].id }));
      }
    } catch (error) {
      console.error('Erro ao carregar cursos:', error);
      toast.error('Erro ao carregar cursos');
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setPlano(prev => ({
      ...prev,
      [name]: name.includes('carga_horaria') || name === 'periodo_numero' ? Number(value) : value
    }));
  }

  function handleCargaHorariaChange(values: {
    carga_horaria_total: number;
    carga_horaria_presencial: number;
    carga_horaria_presencial_percentual: number;
    carga_horaria_teorica: number;
    carga_horaria_teorica_percentual: number;
    carga_horaria_pratica: number;
    carga_horaria_pratica_percentual: number;
    carga_horaria_semanal: number;
    carga_horaria_semanal_percentual: number;
    carga_horaria_distancia?: number;
    carga_horaria_distancia_percentual?: number;
  }) {
    setPlano(prev => ({ ...prev, ...values }));
  }

  function handleObjetivosEspecificosChange(conteudos: any[]) {
    setPlano(prev => ({ ...prev, objetivos_especificos: conteudos }));
  }

  function handleConteudoProgramaticoChange(conteudos: any[]) {
    setPlano(prev => ({ ...prev, conteudo_programatico: conteudos }));
  }

  function handleCronogramaChange(cronograma: any[]) {
    setPlano(prev => ({ ...prev, cronograma: cronograma }));
  }

  function handleRecursosUtilizadosChange(recursos: any[]) {
    setPlano(prev => ({ ...prev, recursos_utilizados: recursos }));
  }

  function handleVisitasTecnicasChange(visitas: any[]) {
    setPlano(prev => ({ ...prev, visitas_tecnicas: visitas }));
  }

  function handleBibliografiaChange(tipo: 'basica' | 'complementar', referencias: string[]) {
    setPlano(prev => ({
      ...prev,
      [`bibliografia_${tipo}`]: referencias
    }));
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/login');
  }

  async function salvarPlano(status: 'rascunho' | 'finalizado') {
    setCarregando(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: professor } = await supabase
        .from('professores')
        .select('nome, matricula_siape')
        .eq('id', user.id)
        .single();

      const { error } = await supabase
        .from('planos_ensino')
        .insert([{
          ...plano,
          professor_id: user.id,
          professor_nome: professor ? professor.nome : 'Professor',
          matricula_siape: professor ? professor.matricula_siape : '',
          status,
          periodo: `${plano.periodo_numero}º Período`,
          objetivos_especificos: JSON.stringify(plano.objetivos_especificos),
          conteudo_programatico: JSON.stringify(plano.conteudo_programatico),
          cronograma: JSON.stringify(plano.cronograma),
          recursos_utilizados: JSON.stringify(plano.recursos_utilizados),
          visitas_tecnicas: JSON.stringify(plano.visitas_tecnicas),
          bibliografia_basica: JSON.stringify(plano.bibliografia_basica),
          bibliografia_complementar: JSON.stringify(plano.bibliografia_complementar),
          finalizado: status === 'finalizado'
        }]);

      if (error) throw error;

      toast.success(status === 'rascunho' ? 'Rascunho salvo com sucesso!' : 'Plano finalizado com sucesso!');
      navigate('/painel');
    } catch (error) {
      console.error('Erro ao salvar plano:', error);
      toast.error('Erro ao salvar o plano');
    } finally {
      setCarregando(false);
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
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
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
      <div className="max-w-full mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/painel')}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Painel
          </button>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Novo Plano de Ensino</h1>

        <div className="flex gap-6">
          <div className="w-64 flex-shrink-0">
            <PlanoSumario items={summaryItems} />
          </div>

          <div className="flex-1 space-y-6">
            <div id="ano-periodo" className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Ano/Período</h2>
              </div>
              <div className="p-6">
              <div className="flex space-x-4">
                <select
                  name="ano_periodo"
                  value={plano.ano_periodo}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-gray-300 p-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2b9f3f] focus:border-[#2b9f3f] transition"
                >
                  {[currentYear - 1, currentYear, currentYear + 1].map(year => (
                    <React.Fragment key={year}>
                      <option value={`${year}/1`}>{year}/1</option>
                      <option value={`${year}/2`}>{year}/2</option>
                    </React.Fragment>
                  ))}
                </select>
              </div>
              </div>
            </div>

            <div id="info-basicas" className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Informações Básicas</h2>
              </div>
              <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Curso</label>
                  <select
                    name="curso_id"
                    value={plano.curso_id}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-gray-300 p-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2b9f3f] focus:border-[#2b9f3f] transition"
                  >
                    {cursos.map(curso => (
                      <option key={curso.id} value={curso.id}>
                        {curso.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Período</label>
                  <select
                    name="periodo_numero"
                    value={plano.periodo_numero}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-gray-300 p-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2b9f3f] focus:border-[#2b9f3f] transition"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <option key={num} value={num}>
                        {num}º Período
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Disciplina</label>
                  <input
                    type="text"
                    name="disciplina"
                    value={plano.disciplina}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2b9f3f] focus:border-[#2b9f3f] transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Abreviatura</label>
                  <input
                    type="text"
                    name="abreviatura"
                    value={plano.abreviatura}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2b9f3f] focus:border-[#2b9f3f] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Título do Plano</label>
                <input
                  type="text"
                  name="titulo"
                  value={plano.titulo}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2b9f3f] focus:border-[#2b9f3f] transition"
                />
              </div>

              <div>
                <CargaHoraria
                  carga_horaria_total={plano.carga_horaria_total}
                  carga_horaria_presencial={plano.carga_horaria_presencial}
                  carga_horaria_presencial_percentual={plano.carga_horaria_presencial_percentual}
                  carga_horaria_teorica={plano.carga_horaria_teorica}
                  carga_horaria_teorica_percentual={plano.carga_horaria_teorica_percentual}
                  carga_horaria_pratica={plano.carga_horaria_pratica}
                  carga_horaria_pratica_percentual={plano.carga_horaria_pratica_percentual}
                  carga_horaria_semanal={plano.carga_horaria_semanal}
                  carga_horaria_semanal_percentual={plano.carga_horaria_semanal_percentual}
                  carga_horaria_distancia={plano.carga_horaria_distancia}
                  carga_horaria_distancia_percentual={plano.carga_horaria_distancia_percentual}
                  onChange={handleCargaHorariaChange}
                />
              </div>
              </div>
            </div>

            <div id="ementa" className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Ementa</h2>
              </div>
              <div className="p-6">
              <textarea
                name="ementa"
                value={plano.ementa}
                onChange={handleChange}
                rows={4}
                className="block w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2b9f3f] focus:border-[#2b9f3f] transition"
              />
              </div>
            </div>

            <div id="objetivo-geral" className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Objetivos</h2>
              </div>
              <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Objetivo Geral</label>
              <textarea
                name="objetivo_geral"
                value={plano.objetivo_geral}
                onChange={handleChange}
                rows={3}
                className="block w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2b9f3f] focus:border-[#2b9f3f] transition"
              />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Objetivos Específicos</label>
              <ObjetivosEspecificos
                conteudos={plano.objetivos_especificos}
                onChange={handleObjetivosEspecificosChange}
              />
              </div>
              </div>
            </div>

            <div id="conteudo-programatico" className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Conteúdo Programático</h2>
              </div>
              <div className="p-6">
              <ConteudoProgramatico
                conteudos={plano.conteudo_programatico}
                onChange={handleConteudoProgramaticoChange}
              />
              </div>
            </div>

            <div id="metodologia" className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Metodologia</h2>
              </div>
              <div className="p-6">
              <textarea
                name="metodologia"
                value={plano.metodologia}
                onChange={handleChange}
                rows={6}
                className="block w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2b9f3f] focus:border-[#2b9f3f] transition"
              />
              </div>
            </div>

            <div id="atividades_extensao" className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Atividades de Extensão</h2>
              </div>
              <div className="p-6">
              <textarea
                name="atividades_extensao"
                value={plano.atividades_extensao}
                onChange={handleChange}
                rows={5}
                className="block w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2b9f3f] focus:border-[#2b9f3f] transition"
              />
              </div>
            </div>

            <div id="justificativa_modalidade" className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Justificativa de Modalidade</h2>
              </div>
              <div className="p-6">
              <textarea
                name="justificativa_modalidade"
                value={plano.justificativa_modalidade}
                onChange={handleChange}
                rows={5}
                className="block w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2b9f3f] focus:border-[#2b9f3f] transition"
              />
              </div>
            </div>

            <div id="recursos" className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Recursos Utilizados</h2>
              </div>
              <div className="p-6">
              <RecursosUtilizados
                recursos={plano.recursos_utilizados}
                onChange={handleRecursosUtilizadosChange}
              />
              </div>
            </div>

            <div id="visitas" className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Visitas Técnicas</h2>
              </div>
              <div className="p-6">
              <VisitasTecnicas
                visitas={plano.visitas_tecnicas}
                onChange={handleVisitasTecnicasChange}
              />
              </div>
            </div>

            <div id="cronograma" className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Cronograma</h2>
              </div>
              <div className="p-6">
              <Cronograma
                cronograma={plano.cronograma}
                onChange={handleCronogramaChange}
              />
              </div>
            </div>

            <div id="bibliografia" className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Bibliografia</h2>
              </div>
              <div className="p-6">
              <Bibliografia
                basica={plano.bibliografia_basica}
                complementar={plano.bibliografia_complementar}
                onChange={handleBibliografiaChange}
              />
              </div>
            </div>

            <div className="flex justify-end gap-3 pb-8">
              <button
                onClick={() => salvarPlano('rascunho')}
                disabled={carregando}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition shadow-sm disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                Salvar Rascunho
              </button>
              <button
                onClick={() => salvarPlano('finalizado')}
                disabled={carregando}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#2b9f3f] hover:bg-[#248a35] transition shadow-sm disabled:opacity-50"
              >
                <CheckCircle className="h-4 w-4" />
                Finalizar Plano
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}