import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import * as pdfjsLib from 'pdfjs-dist';
import toast from 'react-hot-toast';
import { Upload, X } from 'lucide-react';

// Initialize PDF.js worker
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface ImportPlanoProps {
  onClose: () => void;
}

export function ImportPlano({ onClose }: ImportPlanoProps) {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const extractTextContent = async (pdf: any) => {
    const numPages = pdf.numPages;
    let fullText = '';
    
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
    }
    
    return fullText;
  };

  // Helper function to extract text between patterns
  const extractBetween = (content: string, startPattern: string, endPattern: string): string => {
    const regex = new RegExp(`${startPattern}([\\s\\S]*?)${endPattern}`);
    const match = content.match(regex);
    return match ? match[1].trim() : '';
  };

  // Helper function to extract numbered items
  const extractNumberedItems = (content: string, prefix: string): string[] => {
    const items: string[] = [];
    const regex = new RegExp(`${prefix}\\s*\\d+[.)]\\s*([^\\d.][^\\n]*(?:\\n(?!\\d)[^\\n]*)*)`,'g');
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      if (match[1].trim()) {
        items.push(match[1].trim());
      }
    }
    
    return items;
  };

  // Helper function to truncate text
  const truncateText = (text: string, maxLength: number = 255): string => {
    return text.substring(0, maxLength);
  };

  // Helper function to extract carga horária values
  const extractCargaHoraria = (content: string): any => {
    const values = {
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
      carga_horaria_distancia_percentual: 0
    };

    // Extract numbers only from the text
    const extractNumber = (text: string): number => {
      const match = text.match(/\d+/);
      return match ? parseInt(match[0]) : 0;
    };

    const totalMatch = content.match(/Carga\s+hor[aá]ria\s+Total:\s*(\d+)/i);
    const presencialMatch = content.match(/Carga\s+hor[aá]ria\s+presencial:\s*(\d+)/i);
    const teoricaMatch = content.match(/Carga\s+hor[aá]ria.*Te[óo]rica:\s*(\d+)/i);
    const praticaMatch = content.match(/Carga\s+hor[aá]ria.*Pr[áa]tica:\s*(\d+)/i);
    const semanalMatch = content.match(/Carga\s+hor[aá]ria.*Semanal:\s*(\d+)/i);
    const distanciaMatch = content.match(/Carga\s+hor[aá]ria.*[àa]\s+dist[âa]ncia:\s*(\d+)/i);

    values.carga_horaria_total = totalMatch ? extractNumber(totalMatch[1]) : 0;
    values.carga_horaria_presencial = presencialMatch ? extractNumber(presencialMatch[1]) : values.carga_horaria_total;
    values.carga_horaria_teorica = teoricaMatch ? extractNumber(teoricaMatch[1]) : values.carga_horaria_total;
    values.carga_horaria_pratica = praticaMatch ? extractNumber(praticaMatch[1]) : 0;
    values.carga_horaria_semanal = semanalMatch ? extractNumber(semanalMatch[1]) : Math.ceil(values.carga_horaria_total / 20);
    values.carga_horaria_distancia = distanciaMatch ? extractNumber(distanciaMatch[1]) : 0;

    // Calculate percentages
    const total = values.carga_horaria_total || 1;
    values.carga_horaria_presencial_percentual = (values.carga_horaria_presencial / total) * 100;
    values.carga_horaria_teorica_percentual = (values.carga_horaria_teorica / total) * 100;
    values.carga_horaria_pratica_percentual = (values.carga_horaria_pratica / total) * 100;
    values.carga_horaria_semanal_percentual = (values.carga_horaria_semanal / total) * 100;
    values.carga_horaria_distancia_percentual = (values.carga_horaria_distancia / total) * 100;

    return values;
  };

  // Helper function to extract disciplina
  const extractDisciplina = (content: string): string => {
    const match = content.match(/Componente\s+Curricular:\s*([^\n]+)/);
    return match ? match[1].trim() : '';
  };

  // Helper function to extract curso
  const extractCurso = (content: string): string => {
    const match = content.match(/Curso:\s*([^\n]+)/);
    return match ? match[1].trim() : '';
  };

  // Helper function to extract ementa
  const extractEmenta = (content: string): string => {
    const ementa = extractBetween(content, '2\\)\\s*Ementa', '3\\)');
    return truncateText(ementa);
  };

  // Helper function to extract objetivos específicos with structure
  const extractObjetivosEspecificos = (content: string): any[] => {
    const objetivosSection = extractBetween(content, '3\\.2\\s*Espec[íi]ficos:', '4\\)');
    const objetivos = objetivosSection.split(/\d+\.\s+/).filter(Boolean);
    
    return objetivos.map((obj, index) => ({
      id: crypto.randomUUID(),
      titulo: truncateText(obj.trim()),
      subtopicos: [],
      ordem: index
    }));
  };

  // Helper function to extract conteúdo programático with structure
  const extractConteudoProgramatico = (content: string): any[] => {
    const conteudoSection = extractBetween(content, '4\\)\\s*Conte[úu]do', '5\\)');
    const conteudos = conteudoSection.split(/\d+\.\s+/).filter(Boolean);
    
    return conteudos.map((cont, index) => ({
      id: crypto.randomUUID(),
      titulo: truncateText(cont.trim()),
      data_prevista: '',
      carga_horaria: '',
      subtopicos: [],
      ordem: index
    }));
  };

  // Helper function to extract cronograma items
  const extractCronograma = (content: string): any[] => {
    const cronogramaSection = extractBetween(content, '10\\)\\s*Cronograma', '11\\)');
    const items = [];
    const weekPattern = /Semana\s*(\d+)[:\s]*(.*?)(?=Semana|$)/gs;
    let match;

    while ((match = weekPattern.exec(cronogramaSection)) !== null) {
      items.push({
        id: crypto.randomUUID(),
        semana: parseInt(match[1]),
        data_inicio: '',
        data_fim: '',
        atividades: [match[2].trim()],
        recursos: [''],
        avaliacao: ''
      });
    }

    return items;
  };

  // Helper function to extract recursos utilizados
  const extractRecursos = (content: string): any[] => {
    const recursosSection = extractBetween(content, '8\\)\\s*Recursos\\s+Utilizados', '9\\)');
    return recursosSection.split(/\d+\.\s+/)
      .filter(Boolean)
      .map(recurso => ({
        id: crypto.randomUUID(),
        tipo: 'material',
        descricao: truncateText(recurso.trim()),
        quantidade: 1
      }));
  };

  // Helper function to extract visitas técnicas
  const extractVisitas = (content: string): any[] => {
    const visitasSection = extractBetween(content, '9\\)\\s*Visitas\\s+T[ée]cnicas', '10\\)');
    return visitasSection.split(/\d+\.\s+/)
      .filter(Boolean)
      .map(visita => ({
        id: crypto.randomUUID(),
        local: truncateText(visita.trim()),
        data_prevista: '',
        materiais_necessarios: ['']
      }));
  };

  const parseContent = (content: string) => {
    const disciplina = extractDisciplina(content);
    const ementa = extractEmenta(content);
    const objetivoGeral = extractBetween(content, '3\\.1\\s*Geral:', '3\\.2');
    const metodologia = extractBetween(content, '5\\)\\s*Metodologia', '6\\)');
    const justificativaModalidade = extractBetween(content, '6\\)\\s*Justificativa\\s+da\\s+Modalidade', '7\\)');
    const atividadesExtensao = extractBetween(content, '7\\)\\s*Atividades\\s+de\\s+Extens[ãa]o', '8\\)');
    const bibliografiaBasica = extractNumberedItems(content, '11\\.1\\.').map(ref => truncateText(ref));
    const bibliografiaComplementar = extractNumberedItems(content, '11\\.2\\.').map(ref => truncateText(ref));
    const periodoMatch = content.match(/Per[íi]odo:\s*(\d+)/i);
    
    return {
      disciplina: truncateText(disciplina),
      ementa: truncateText(ementa),
      objetivo_geral: truncateText(objetivoGeral),
      metodologia: truncateText(metodologia),
      justificativa_modalidade: truncateText(justificativaModalidade),
      atividades_extensao: truncateText(atividadesExtensao),
      periodo_numero: periodoMatch ? parseInt(periodoMatch[1]) : 1,
      objetivos_especificos: extractObjetivosEspecificos(content),
      conteudo_programatico: extractConteudoProgramatico(content),
      cronograma: extractCronograma(content),
      recursos_utilizados: extractRecursos(content),
      visitas_tecnicas: extractVisitas(content),
      bibliografia_basica: bibliografiaBasica,
      bibliografia_complementar: bibliografiaComplementar,
      ...extractCargaHoraria(content)
    };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Selecione um arquivo PDF');
      return;
    }

    setLoading(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      const content = await extractTextContent(pdf);
      const parsedData = parseContent(content);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: professor } = await supabase
        .from('professores')
        .select('*')
        .eq('id', user.id)
        .single();

      // Get curso_id based on the extracted curso name
      let cursoId = professor?.curso_id;
      const cursoName = extractCurso(content);
      
      if (cursoName) {
        const { data: cursoData } = await supabase
          .from('cursos')
          .select('id')
          .ilike('nome', `%${cursoName}%`)
          .maybeSingle();
        
        if (cursoData?.id) {
          cursoId = cursoData.id;
        }
      }

      // If still no curso_id, get first available course
      if (!cursoId) {
        const { data: cursos } = await supabase
          .from('cursos')
          .select('id')
          .limit(1)
          .single();
        
        if (!cursos?.id) {
          throw new Error('Nenhum curso encontrado no sistema');
        }
        cursoId = cursos.id;
      }

      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth();
      const semester = currentMonth < 6 ? 1 : 2;

      const titulo = file.name.replace('.pdf', '');
      const truncatedTitulo = truncateText(titulo);

      const planoData = {
        ...parsedData,
        professor_id: user.id,
        titulo: truncatedTitulo,
        ano_periodo: `${currentYear}/${semester}`,
        status: 'rascunho',
        finalizado: false,
        curso_id: cursoId,
        periodo: `${parsedData.periodo_numero}º Período`,
        objetivos_especificos: JSON.stringify(parsedData.objetivos_especificos),
        conteudo_programatico: JSON.stringify(parsedData.conteudo_programatico),
        cronograma: JSON.stringify(parsedData.cronograma),
        recursos_utilizados: JSON.stringify(parsedData.recursos_utilizados),
        visitas_tecnicas: JSON.stringify(parsedData.visitas_tecnicas),
        bibliografia_basica: JSON.stringify(parsedData.bibliografia_basica),
        bibliografia_complementar: JSON.stringify(parsedData.bibliografia_complementar)
      };

      const { data, error } = await supabase
        .from('planos_ensino')
        .insert([planoData])
        .select()
        .single();

      if (error) throw error;

      toast.success('Plano importado com sucesso!');
      navigate(`/editar-plano/${data.id}`);
    } catch (error) {
      console.error('Erro ao importar PDF:', error);
      toast.error('Erro ao importar o plano. Verifique se o arquivo está no formato correto.');
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Importar Plano de Ensino
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer bg-white rounded-md font-medium text-[#2b9f3f] hover:text-[#248a35] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#2b9f3f]"
                >
                  <span>Selecione um arquivo PDF</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept=".pdf"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              {file && (
                <p className="mt-2 text-sm text-gray-500">
                  Arquivo selecionado: {file.name}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={!file || loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#2b9f3f] hover:bg-[#248a35] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2b9f3f] disabled:opacity-50"
            >
              {loading ? 'Importando...' : 'Importar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}