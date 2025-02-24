import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Save, CheckCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { CargaHoraria } from '../components/CargaHoraria';
import { ConteudoProgramatico } from '../components/ConteudoProgramatico';
import { CriteriosAvaliacao } from '../components/CriteriosAvaliacao';
import { Bibliografia } from '../components/Bibliografia';
import type { Curso } from '../tipos';

export function NovoPlano() {
  const navigate = useNavigate();
  const [carregando, setCarregando] = useState(false);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [plano, setPlano] = useState<{
    titulo: string;
    periodo: string;
    periodo_numero: number;
    curso_id: string;
    disciplina: string;
    carga_horaria_total: number;
    carga_horaria_presencial: number;
    carga_horaria_presencial_percentual: number;
    carga_horaria_teorica: number;
    carga_horaria_teorica_percentual: number;
    carga_horaria_pratica: number;
    carga_horaria_pratica_percentual: number;
    carga_horaria_semanal: number;
    ementa: string;
    objetivo_geral: string;
    objetivos_especificos: string[];
    conteudo_programatico: any[];
    metodologia: string;
    criterios_avaliacao: { descricao: string; peso: number }[];
    recuperacao_aprendizagem: string;
    bibliografia_basica: string[];
    bibliografia_complementar: string[];
  }>({
    titulo: '',
    periodo: '',
    periodo_numero: 1,
    curso_id: '',
    disciplina: '',
    carga_horaria_total: 0,
    carga_horaria_presencial: 0,
    carga_horaria_presencial_percentual: 0,
    carga_horaria_teorica: 0,
    carga_horaria_teorica_percentual: 0,
    carga_horaria_pratica: 0,
    carga_horaria_pratica_percentual: 0,
    carga_horaria_semanal: 0,
    ementa: '',
    objetivo_geral: '',
    objetivos_especificos: [''],
    conteudo_programatico: [],
    metodologia: '',
    criterios_avaliacao: [],
    recuperacao_aprendizagem: '',
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
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      navigate('/login');
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
  }) {
    setPlano(prev => ({ ...prev, ...values }));
  }

  function handleObjetivosEspecificosChange(objetivos: string[]) {
    setPlano(prev => ({ ...prev, objetivos_especificos: objetivos }));
  }

  function handleConteudoProgramaticoChange(conteudos: any[]) {
    setPlano(prev => ({ ...prev, conteudo_programatico: conteudos }));
  }

  function handleCriteriosAvaliacaoChange(criterios: { descricao: string; peso: number }[]) {
    setPlano(prev => ({ ...prev, criterios_avaliacao: criterios }));
  }

  function handleBibliografiaChange(tipo: 'basica' | 'complementar', referencias: string[]) {
    setPlano(prev => ({
      ...prev,
      [`bibliografia_${tipo}`]: referencias
    }));
  }

  async function salvarPlano(status: 'rascunho' | 'finalizado') {
    setCarregando(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: professor, error: professorError } = await supabase
        .from('professores')
        .select('id')
        .eq('id', user.id)
        .single();

      if (professorError || !professor) {
        throw new Error('Registro do professor não encontrado');
      }

      const { error } = await supabase
        .from('planos_ensino')
        .insert([{
          ...plano,
          professor_id: user.id,
          status,
          periodo: `${plano.periodo_numero}º Período`,
          objetivos_especificos: JSON.stringify(plano.objetivos_especificos),
          conteudo_programatico: JSON.stringify(plano.conteudo_programatico),
          criterios_avaliacao: JSON.stringify(plano.criterios_avaliacao),
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

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center">
          <button
            onClick={() => navigate('/painel')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar ao Painel
          </button>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Novo Plano de Ensino</h1>

          <div className="space-y-6">
            {/* Informações Básicas */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Curso</label>
                <select
                  name="curso_id"
                  value={plano.curso_id}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Título do Plano</label>
              <input
                type="text"
                name="titulo"
                value={plano.titulo}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            {/* Carga Horária */}
            <div>
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
                onChange={handleCargaHorariaChange}
              />
            </div>

            {/* Ementa */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Ementa</label>
              <textarea
                name="ementa"
                value={plano.ementa}
                onChange={handleChange}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            {/* Objetivos */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Objetivo Geral</label>
              <textarea
                name="objetivo_geral"
                value={plano.objetivo_geral}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            {/* Conteúdo Programático */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Conteúdo Programático</h2>
              <ConteudoProgramatico
                conteudos={plano.conteudo_programatico}
                onChange={handleConteudoProgramaticoChange}
              />
            </div>

            {/* Metodologia */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Metodologia</label>
              <textarea
                name="metodologia"
                value={plano.metodologia}
                onChange={handleChange}
                rows={6}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            {/* Critérios de Avaliação */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Critérios de Avaliação</h2>
              <CriteriosAvaliacao
                criterios={plano.criterios_avaliacao}
                onChange={handleCriteriosAvaliacaoChange}
              />
            </div>

            {/* Recuperação da Aprendizagem */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Recuperação da Aprendizagem</label>
              <textarea
                name="recuperacao_aprendizagem"
                value={plano.recuperacao_aprendizagem}
                onChange={handleChange}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            {/* Bibliografia */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Bibliografia</h2>
              <Bibliografia
                basica={plano.bibliografia_basica}
                complementar={plano.bibliografia_complementar}
                onChange={handleBibliografiaChange}
              />
            </div>

            {/* Botões de Ação */}
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
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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