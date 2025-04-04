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
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center">
          <button
            onClick={() => navigate('/painel')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar ao Painel
          </button>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Novo Plano de Ensino</h1>

        <div className="flex gap-6">
          <div className="w-64 flex-shrink-0">
            <PlanoSumario items={summaryItems} />
          </div>

          <div className="flex-1 space-y-6">
            <div id="ano-periodo" className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Ano/Período</h2>
              <div className="mt-1 flex space-x-4">
                <select
                  name="ano_periodo"
                  value={plano.ano_periodo}
                  onChange={handleChange}
                  className="block w-full rounded-md border border-gray-200 p-2 shadow-sm focus:outline-none hover:bg-gray-50"
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

            <div id="info-basicas" className="bg-white shadow rounded-lg p-6">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Curso</label>
                  <select
                    name="curso_id"
                    value={plano.curso_id}
                    onChange={handleChange}
                    className="mt-2 block w-full rounded-md border border-gray-200 shadow-sm focus:outline-none hover:bg-gray-50"
                  >
                    {cursos.map(curso => (
                      <option key={curso.id} value={curso.id}>
                        {curso.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Período</label>
                  <select
                    name="periodo_numero"
                    value={plano.periodo_numero}
                    onChange={handleChange}
                    className="mt-2 block w-full rounded-md border border-gray-200 shadow-sm focus:outline-none hover:bg-gray-50"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                      <option key={num} value={num}>
                        {num}º Período
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Disciplina</label>
                  <input
                    type="text"
                    name="disciplina"
                    value={plano.disciplina}
                    onChange={handleChange}
                    className="mt-2 block w-full rounded-md border border-gray-200 shadow-sm focus:outline-none hover:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Abreviatura</label>
                  <input
                    type="text"
                    name="abreviatura"
                    value={plano.abreviatura}
                    onChange={handleChange}
                    className="mt-2 block w-full rounded-md border border-gray-200 shadow-sm focus:outline-none hover:bg-gray-50"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700">Título do Plano</label>
                <input
                  type="text"
                  name="titulo"
                  value={plano.titulo}
                  onChange={handleChange}
                  className="mt-2 block w-full rounded-md border border-gray-200 shadow-sm focus:outline-none hover:bg-gray-50"
                />
              </div>

              <div className="mt-6">
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

            <div id="ementa" className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Ementa</h2>
              <textarea
                name="ementa"
                value={plano.ementa}
                onChange={handleChange}
                rows={4}
                className="mt-1 block w-full rounded-md border border-gray-200 p-2 shadow-sm focus:outline-none hover:bg-gray-50"
              />
            </div>

            <div id="objetivo-geral" className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Objetivo geral</h2>
              <textarea
                name="objetivo_geral"
                value={plano.objetivo_geral}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full rounded-md border border-gray-200 p-2 shadow-sm focus:outline-none hover:bg-gray-50"
              />
              <h2 className="text-lg font-medium text-gray-900 mb-4">Objetivos Específicos</h2>
              <ObjetivosEspecificos
                conteudos={plano.objetivos_especificos}
                onChange={handleObjetivosEspecificosChange}
              />
            </div>

            <div id="conteudo-programatico" className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Conteúdo</h2>
              <ConteudoProgramatico
                conteudos={plano.conteudo_programatico}
                onChange={handleConteudoProgramaticoChange}
              />
            </div>

            <div id="metodologia" className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Metodologia</h2>
              <textarea
                name="metodologia"
                value={plano.metodologia}
                onChange={handleChange}
                rows={6}
                className="mt-1 block w-full rounded-md border border-gray-200 p-2 shadow-sm focus:outline-none hover:bg-gray-50"
              />
            </div>

            <div id="atividades_extensao" className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">atividade de extensão</h2>
              <textarea
                name="atividades_extensao"
                value={plano.atividades_extensao}
                onChange={handleChange}
                rows={5}
                className="mt-1 block w-full rounded-md border border-gray-200 p-2 shadow-sm focus:outline-none hover:bg-gray-50"
              />
            </div>

            <div id="justificativa_modalidade" className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Justificativa de Modalidade</h2>
              <textarea
                name="justificativa_modalidade"
                value={plano.justificativa_modalidade}
                onChange={handleChange}
                rows={5}
                className="mt-1 block w-full rounded-md border border-gray-200 p-2 shadow-sm focus:outline-none hover:bg-gray-50"
              />
            </div>

            <div id="recursos" className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Recursos Utilizados</h2>
              <RecursosUtilizados
                recursos={plano.recursos_utilizados}
                onChange={handleRecursosUtilizadosChange}
              />
            </div>

            <div id="visitas" className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Visitas Técnicas</h2>
              <VisitasTecnicas
                visitas={plano.visitas_tecnicas}
                onChange={handleVisitasTecnicasChange}
              />
            </div>

            <div id="cronograma" className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Cronograma</h2>
              <Cronograma
                cronograma={plano.cronograma}
                onChange={handleCronogramaChange}
              />
            </div>

            <div id="bibliografia" className="bg-white shadow rounded-lg p-6">
              <Bibliografia
                basica={plano.bibliografia_basica}
                complementar={plano.bibliografia_complementar}
                onChange={handleBibliografiaChange}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => salvarPlano('rascunho')}
                disabled={carregando}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Save className="h-5 w-5 mr-2" />
                Salvar Rascunho
              </button>
              <button
                onClick={() => salvarPlano('finalizado')}
                disabled={carregando}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#2b9f3f] hover:bg-[#248a35] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Finalizar Plano
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}