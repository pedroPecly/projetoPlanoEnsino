import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Save, CheckCircle, ArrowLeft, Trash2, FileText, LogOut, User, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { CargaHoraria } from '../components/CargaHoraria';
import { ConteudoProgramatico } from '../components/ConteudoProgramatico';
import { Cronograma } from '../components/Cronograma';
import { RecursosUtilizados } from '../components/RecursosUtilizados';
import { VisitasTecnicas } from '../components/VisitasTecnicas';
import { Bibliografia } from '../components/Bibliografia';
import { PlanoPDF } from '../components/PlanoPDF';
import { PDFDownloadLink } from '@react-pdf/renderer';
import type { PlanoEnsino, Professor, Curso } from '../tipos';
import { ObjetivosEspecificos } from '../components/ObjetivosEspecificos';
import { PlanoSumario } from '../components/PlanoSumario';

const summaryItems = [
  { id: '1', label: 'Ano/Período', target: 'ano-periodo' },
  { id: '2', label: 'Informações Básicas', target: 'info-basicas' },
  { id: '3', label: 'Carga Horária', target: 'carga-horaria' },
  { id: '4', label: 'Ementa', target: 'ementa' },
  { id: '5', label: 'Objetivo Geral', target: 'objetivo-geral' },
  { id: '6', label: 'Objetivos Específicos', target: 'objetivos-especificos' },
  { id: '7', label: 'Conteúdo Programático', target: 'conteudo-programatico' },
  { id: '8', label: 'Cronograma', target: 'cronograma' },
  { id: '9', label: 'Recursos Utilizados', target: 'recursos' },
  { id: '10', label: 'Visitas Técnicas', target: 'visitas' },
  { id: '11', label: 'Metodologia', target: 'metodologia' },
  { id: '12', label: 'Bibliografia', target: 'bibliografia' },
];

export function EditarPlano() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [carregando, setCarregando] = useState(true);
  const [excluindo, setExcluindo] = useState(false);
  const [plano, setPlano] = useState<PlanoEnsino | null>(null);
  const [professor, setProfessor] = useState<Professor | null>(null);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    carregarDados();
  }, [id]);

  async function carregarDados() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data: dadosProfessor, error: erroProfessor } = await supabase
        .from('professores')
        .select('*')
        .eq('id', user.id)
        .single();

      if (erroProfessor) throw erroProfessor;
      setProfessor(dadosProfessor);

      const { data: cursosData, error: erroCursos } = await supabase
        .from('cursos')
        .select('*')
        .order('nome');

      if (erroCursos) throw erroCursos;
      setCursos(cursosData || []);

      const { data: planoData, error: erroPlano } = await supabase
        .from('planos_ensino')
        .select('*')
        .eq('id', id)
        .single();

      if (erroPlano) throw erroPlano;

      const parsedPlano = {
        ...planoData,
        conteudo_programatico: planoData.conteudo_programatico ? JSON.parse(planoData.conteudo_programatico) : [],
        cronograma: planoData.cronograma ? JSON.parse(planoData.cronograma) : [],
        recursos_utilizados: planoData.recursos_utilizados ? JSON.parse(planoData.recursos_utilizados) : [],
        visitas_tecnicas: planoData.visitas_tecnicas ? JSON.parse(planoData.visitas_tecnicas) : [],
        objetivos_especificos: planoData.objetivos_especificos ? JSON.parse(planoData.objetivos_especificos) : [],
        bibliografia_basica: planoData.bibliografia_basica ? JSON.parse(planoData.bibliografia_basica) : [''],
        bibliografia_complementar: planoData.bibliografia_complementar ? JSON.parse(planoData.bibliografia_complementar) : ['']
      };

      setPlano(parsedPlano);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar o plano de ensino');
    } finally {
      setCarregando(false);
    }
  }

  async function excluirPlano() {
    if (!plano || !id) return;
    setExcluindo(true);
    try {
      const { error } = await supabase
        .from('planos_ensino')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Plano excluído com sucesso!');
      navigate('/painel');
    } catch (error) {
      console.error('Erro ao excluir plano:', error);
      toast.error('Erro ao excluir o plano');
    } finally {
      setExcluindo(false);
      setShowDeleteConfirm(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    if (!plano) return;
    const { name, value } = e.target;
    setPlano(prev => prev ? ({ ...prev, [name]: value }) : null);
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
  }) {
    setPlano(prev => prev ? ({ ...prev, ...values }) : null);
  }

  function handleObjetivosEspecificosChange(conteudos: any[]) {
    setPlano(prev => prev ? ({ ...prev, objetivos_especificos: conteudos }) : null);
  }

  function handleConteudoProgramaticoChange(conteudos: any[]) {
    setPlano(prev => prev ? ({ ...prev, conteudo_programatico: conteudos }) : null);
  }

  function handleCronogramaChange(cronograma: any[]) {
    setPlano(prev => prev ? ({ ...prev, cronograma }) : null);
  }

  function handleRecursosUtilizadosChange(recursos: any[]) {
    setPlano(prev => prev ? ({ ...prev, recursos_utilizados: recursos }) : null);
  }

  function handleVisitasTecnicasChange(visitas: any[]) {
    setPlano(prev => prev ? ({ ...prev, visitas_tecnicas: visitas }) : null);
  }

  function handleBibliografiaChange(tipo: 'basica' | 'complementar', referencias: string[]) {
    setPlano(prev => prev ? ({
      ...prev,
      [`bibliografia_${tipo}`]: referencias
    }) : null);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/login');
  }

  async function salvarPlano(status?: 'rascunho' | 'finalizado') {
    if (!plano) return;
    setCarregando(true);
    try {
      const { error } = await supabase
        .from('planos_ensino')
        .update({
          ...plano,
          status: status || plano.status,
          periodo: `${plano.periodo_numero}º Período`,
          objetivos_especificos: JSON.stringify(plano.objetivos_especificos),
          conteudo_programatico: JSON.stringify(plano.conteudo_programatico),
          cronograma: JSON.stringify(plano.cronograma),
          recursos_utilizados: JSON.stringify(plano.recursos_utilizados),
          visitas_tecnicas: JSON.stringify(plano.visitas_tecnicas),
          bibliografia_basica: JSON.stringify(plano.bibliografia_basica),
          bibliografia_complementar: JSON.stringify(plano.bibliografia_complementar),
          finalizado: status === 'finalizado'
        })
        .eq('id', plano.id);

      if (error) throw error;

      toast.success('Plano atualizado com sucesso!');
      navigate('/painel');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar o plano');
    } finally {
      setCarregando(false);
    }
  }

  if (carregando) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">Carregando...</div>
    </div>;
  }

  if (!plano) return null;

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
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => navigate('/painel')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar ao Painel
          </button>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Editar Plano de Ensino</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
            >
              <Trash2 className="h-5 w-5 mr-2" />
              Excluir Plano
            </button>
            {plano.status === 'finalizado' && (
              <PDFDownloadLink
                document={<PlanoPDF planos={[plano]} curso={cursos.find(curso => curso.id === plano.curso_id)?.nome || ''} periodo={String(plano.periodo_numero)} />}
                fileName={`${plano.disciplina}.pdf`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <FileText className="h-5 w-5 mr-2" />
                Exportar PDF
              </PDFDownloadLink>
            )}
          </div>
        </div>

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Confirmar exclusão
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Tem certeza que deseja excluir este plano de ensino? Esta ação não pode ser desfeita.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  disabled={excluindo}
                >
                  Cancelar
                </button>
                <button
                  onClick={excluirPlano}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                  disabled={excluindo}
                >
                  {excluindo ? 'Excluindo...' : 'Confirmar exclusão'}
                </button>
              </div>
            </div>
          </div>
        )}

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
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:outline-none hover:bg-gray-50"
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
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Curso</label>
                  <select
                    name="curso_id"
                    value={plano.curso_id}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:outline-none hover:bg-gray-50"
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
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:outline-none hover:bg-gray-50"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                      <option key={num} value={num}>
                        {num}º Período
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Disciplina</label>
                <input
                  type="text"
                  name="disciplina"
                  value={plano.disciplina}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:outline-none hover:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Abreviatura</label>
                <input
                  type="text"
                  name="abreviatura"
                  value={plano.abreviatura}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:outline-none hover:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Título do Plano</label>
                <input
                  type="text"
                  name="titulo"
                  value={plano.titulo}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:outline-none hover:bg-gray-50"
                />
              </div>
            </div>

            <div id="carga-horaria" className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Carga Horária</h2>
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
                onChange={handleCargaHorariaChange}
              />
            </div>

            <div id="ementa" className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Ementa</h2>
              <textarea
                name="ementa"
                value={plano.ementa}
                onChange={handleChange}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:outline-none hover:bg-gray-50"
              />
            </div>

            <div id="objetivo-geral" className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Objetivo Geral</h2>
              <textarea
                name="objetivo_geral"
                value={plano.objetivo_geral}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:outline-none hover:bg-gray-50"
              />
            </div>

            <div id="objetivos-especificos" className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Objetivos Específicos</h2>
              <ObjetivosEspecificos
                conteudos={plano.objetivos_especificos}
                onChange={handleObjetivosEspecificosChange}
              />
            </div>

            <div id="conteudo-programatico" className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Conteúdo Programático</h2>
              <ConteudoProgramatico
                conteudos={plano.conteudo_programatico}
                onChange={handleConteudoProgramaticoChange}
              />
            </div>

            <div id="cronograma" className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Cronograma</h2>
              <Cronograma
                cronograma={plano.cronograma}
                onChange={handleCronogramaChange}
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

            <div id="metodologia" className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Metodologia</h2>
              <textarea
                name="metodologia"
                value={plano.metodologia}
                onChange={handleChange}
                rows={6}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:outline-none hover:bg-gray-50"
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
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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