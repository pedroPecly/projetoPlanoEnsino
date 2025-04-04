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
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ')
        .replace(/\s+/g, ' '); // Normalize whitespace
      fullText += pageText + '\n';
    }
    
    return fullText;
  };

  // Helper function to extract text between patterns with better pattern matching
  const extractBetween = (content: string, startPattern: string, endPattern: string): string => {
    try {
      const regex = new RegExp(`${startPattern}\\s*([\\s\\S]*?)(?=${endPattern}|$)`, 'i');
      const match = content.match(regex);
      return match ? match[1].trim() : '';
    } catch (error) {
      console.error('Error in extractBetween:', error);
      return '';
    }
  };

  // Helper function to extract numbered items with subtopics
  const extractNumberedItemsWithSubtopics = (content: string, mainPattern: string): any[] => {
    try {
      const items: any[] = [];
      // Match main topics with format like "1. Topic" or "1) Topic"
      const mainTopicRegex = new RegExp(`(?:^|\\n)\\s*(\\d+)[.)]\\s*([^\\n]+)`, 'gm');
      let mainMatch;
      
      while ((mainMatch = mainTopicRegex.exec(content)) !== null) {
        const mainNumber = mainMatch[1];
        const mainContent = mainMatch[2].trim();
        
        // Find subtopics that start with the main number
        const subtopicRegex = new RegExp(`(?:^|\\n)\\s*${mainNumber}\\.(\\d+)[.)]\\s*([^\\n]+)`, 'gm');
        const subtopics = [];
        let subtopicMatch;
        
        while ((subtopicMatch = subtopicRegex.exec(content)) !== null) {
          subtopics.push({
            id: crypto.randomUUID(),
            titulo: subtopicMatch[2].trim(),
            subtopicos: [],
            ordem: parseInt(subtopicMatch[1]) - 1
          });
        }

        items.push({
          id: crypto.randomUUID(),
          titulo: mainContent,
          subtopicos: subtopics,
          ordem: parseInt(mainNumber) - 1
        });
      }
      
      return items;
    } catch (error) {
      console.error('Error in extractNumberedItemsWithSubtopics:', error);
      return [];
    }
  };

  // Helper function to parse date string with better format handling
  const parseDate = (dateStr: string): string => {
    try {
      const dateRegex = /(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/;
      const match = dateStr.match(dateRegex);
      if (match) {
        const [_, day, month, year] = match;
        const fullYear = year.length === 2 ? '20' + year : year;
        const formattedMonth = month.padStart(2, '0');
        const formattedDay = day.padStart(2, '0');
        return `${fullYear}-${formattedMonth}-${formattedDay}`;
      }
      return '';
    } catch (error) {
      console.error('Error in parseDate:', error);
      return '';
    }
  };

  // Helper function to extract carga horária values with better pattern matching
  const extractCargaHoraria = (content: string): any => {
    try {
      const values = {
        carga_horaria_total: 60,
        carga_horaria_presencial: 48,
        carga_horaria_presencial_percentual: 80,
        carga_horaria_teorica: 30,
        carga_horaria_teorica_percentual: 50,
        carga_horaria_pratica: 30,
        carga_horaria_pratica_percentual: 50,
        carga_horaria_semanal: 4,
        carga_horaria_semanal_percentual: 0,
        carga_horaria_distancia: 12,
        carga_horaria_distancia_percentual: 20
      };

      const extractNumber = (text: string): number => {
        const match = text.match(/\d+/);
        return match ? parseInt(match[0]) : 0;
      };

      // Try to find values in the content
      const totalMatch = content.match(/Carga\s+hor[aá]ria\s+[Tt]otal:?\s*(\d+)/i);
      const presencialMatch = content.match(/Carga\s+hor[aá]ria\s+[Pp]resencial:?\s*(\d+)/i);
      const teoricaMatch = content.match(/Carga\s+hor[aá]ria\s*[Tt]e[óo]rica:?\s*(\d+)/i);
      const praticaMatch = content.match(/Carga\s+hor[aá]ria\s*[Pp]r[áa]tica:?\s*(\d+)/i);
      const semanalMatch = content.match(/Carga\s+hor[aá]ria\s*[Ss]emanal:?\s*(\d+)/i);
      const distanciaMatch = content.match(/Carga\s+hor[aá]ria\s*[àa]\s*[Dd]ist[âa]ncia:?\s*(\d+)/i);

      // Update values if found in content
      if (totalMatch) values.carga_horaria_total = extractNumber(totalMatch[1]);
      if (presencialMatch) values.carga_horaria_presencial = extractNumber(presencialMatch[1]);
      if (teoricaMatch) values.carga_horaria_teorica = extractNumber(teoricaMatch[1]);
      if (praticaMatch) values.carga_horaria_pratica = extractNumber(praticaMatch[1]);
      if (semanalMatch) values.carga_horaria_semanal = extractNumber(semanalMatch[1]);
      if (distanciaMatch) values.carga_horaria_distancia = extractNumber(distanciaMatch[1]);

      // Calculate percentages
      const total = values.carga_horaria_total || 60;
      values.carga_horaria_presencial_percentual = Math.round((values.carga_horaria_presencial / total) * 100);
      values.carga_horaria_teorica_percentual = Math.round((values.carga_horaria_teorica / total) * 100);
      values.carga_horaria_pratica_percentual = Math.round((values.carga_horaria_pratica / total) * 100);
      values.carga_horaria_semanal_percentual = Math.round((values.carga_horaria_semanal / total) * 100);
      values.carga_horaria_distancia_percentual = Math.round((values.carga_horaria_distancia / total) * 100);

      return values;
    } catch (error) {
      console.error('Error in extractCargaHoraria:', error);
      return {
        carga_horaria_total: 60,
        carga_horaria_presencial: 48,
        carga_horaria_presencial_percentual: 80,
        carga_horaria_teorica: 30,
        carga_horaria_teorica_percentual: 50,
        carga_horaria_pratica: 30,
        carga_horaria_pratica_percentual: 50,
        carga_horaria_semanal: 4,
        carga_horaria_semanal_percentual: 0,
        carga_horaria_distancia: 12,
        carga_horaria_distancia_percentual: 20
      };
    }
  };

  // Helper function to extract disciplina and abreviatura
  const extractDisciplinaAndAbreviatura = (content: string): { disciplina: string; abreviatura: string } => {
    try {
      const patterns = [
        /Componente\s+Curricular:?\s*([^:]+?)(?:\s+abreviatura:?\s*([a-zA-Z0-9]+)|$)/i,
        /Disciplina:?\s*([^:]+?)(?:\s+abreviatura:?\s*([a-zA-Z0-9]+)|$)/i
      ];
  
      for (const pattern of patterns) {
        const match = content.match(pattern);
        if (match) {
          return {
            disciplina: match[1]?.trim() || '',
            abreviatura: match[2]?.trim() || ''
          };
        }
      }
  
      return {
        disciplina: '',
        abreviatura: ''
      };
    } catch (error) {
      console.error('Error in extractDisciplinaAndAbreviatura:', error);
      return {
        disciplina: '',
        abreviatura: ''
      };
    }
  };

  // Helper function to extract objetivos específicos with proper structure
  const extractObjetivosEspecificos = (content: string): any[] => {
    try {
      const objetivosSection = extractBetween(content, '(?:3\\.2|III\\.2)\\s*Espec[íi]ficos', '(?:4|IV)\\)');
      const items: any[] = [];
      
      // Match main objectives (3.2.1, 3.2.2, etc)
      const mainObjectivePattern = /(?:3\.2\.|III\.2\.)(\d+)\s*([^.]+?)(?=(?:3\.2\.|III\.2\.|\d+\.\d+\.|$))/g;
      let mainMatch;
      
      while ((mainMatch = mainObjectivePattern.exec(objetivosSection)) !== null) {
        const mainNumber = mainMatch[1];
        const mainContent = mainMatch[2].trim();
        
        // Find subtopics for this main objective
        const subtopicPattern = new RegExp(`(?:3\\.2\\.|III\\.2\\.)${mainNumber}\\.(\\d+)\\s*([^.]+?)(?=(?:3\\.2\\.|III\\.2\\.\\d+|\\d+\\.\\d+\\.|$))`, 'g');
        const subtopics = [];
        let subtopicMatch;
        
        // Reset lastIndex to start searching from beginning of section
        subtopicPattern.lastIndex = 0;
        
        while ((subtopicMatch = subtopicPattern.exec(objetivosSection)) !== null) {
          subtopics.push({
            id: crypto.randomUUID(),
            titulo: subtopicMatch[2].trim(),
            subtopicos: [],
            ordem: parseInt(subtopicMatch[1]) - 1
          });
        }

        items.push({
          id: crypto.randomUUID(),
          titulo: mainContent,
          subtopicos: subtopics,
          ordem: parseInt(mainNumber) - 1
        });
      }
      
      return items;
    } catch (error) {
      console.error('Error in extractObjetivosEspecificos:', error);
      return [];
    }
  };

  // Helper function to extract curso with better pattern matching
  const extractCurso = (content: string): string => {
    try {
      const patterns = [
        /Curso:?\s*([^:\n]+?)(?=\s*(?:Per[íi]odo|Disciplina|$))/i,
        /Graduação\s+em:?\s*([^:\n]+?)(?=\s*(?:Per[íi]odo|Disciplina|$))/i
      ];

      for (const pattern of patterns) {
        const match = content.match(pattern);
        if (match && match[1].trim()) {
          return match[1].trim();
        }
      }

      return '';
    } catch (error) {
      console.error('Error in extractCurso:', error);
      return '';
    }
  };

  // Helper function to extract recursos utilizados with better pattern matching
  const extractRecursos = (content: string): any[] => {
    try {
      const recursosSection = extractBetween(content, '(?:8|VIII)\\)\\s*Recursos\\s+Utilizados', '(?:9|IX)\\)');
      return recursosSection
        .split(/(?:\d+\.|[-•])/)
        .map(item => item.trim())
        .filter(Boolean)
        .map(recurso => ({
          id: crypto.randomUUID(),
          tipo: 'material',
          descricao: recurso,
          quantidade: 1
        }));
    } catch (error) {
      console.error('Error in extractRecursos:', error);
      return [];
    }
  };

  // Helper function to extract visitas técnicas with better pattern matching
  const extractVisitas = (content: string): any[] => {
    try {
      const visitasSection = extractBetween(content, '(?:9|IX)\\)\\s*Visitas\\s+T[ée]cnicas', '(?:10|X)\\)');
      const visitaPattern = /(?:\d+\.|[-•])\s*([^]*?)(?=(?:\d+\.|[-•]|$))/g;
      const items = [];
      let match;

      while ((match = visitaPattern.exec(visitasSection)) !== null) {
        const visitaContent = match[1].trim();
        const dateMatch = visitaContent.match(/(\d{1,2}\/\d{1,2}\/\d{2,4})/);
        const materiaisMatch = visitaContent.match(/Materiais[^:]*:\s*([^]*?)(?=Data|$)/i);

        items.push({
          id: crypto.randomUUID(),
          local: visitaContent.split('\n')[0],
          data_prevista: dateMatch ? parseDate(dateMatch[1]) : '',
          materiais_necessarios: materiaisMatch 
            ? materiaisMatch[1].split(/[,;]/).map(m => m.trim()).filter(Boolean)
            : ['']
        });
      }

      return items;
    } catch (error) {
      console.error('Error in extractVisitas:', error);
      return [];
    }
  };

  // Helper function to extract cronograma items with better date handling
  const extractCronograma = (content: string): any[] => {
    try {
      const cronogramaSection = extractBetween(content, '(?:10|X)\\)\\s*Cronograma', '(?:11|XI)\\)');
      const items = [];
      const weekPattern = /Semana\s*(\d+)(?:\s*[-:]\s*)?(?:(\d{1,2}\/\d{1,2}\/\d{2,4})\s*(?:a|até|e)\s*(\d{1,2}\/\d{1,2}\/\d{2,4}))?\s*([\s\S]*?)(?=(?:Semana|$))/gi;
      let match;

      while ((match = weekPattern.exec(cronogramaSection)) !== null) {
        const [_, weekNum, startDate, endDate, content] = match;
        
        const contentLines = content.split(/[\n\r]+/).filter(line => line.trim());
        const activities = contentLines
          .filter(line => !line.toLowerCase().includes('recurso'))
          .map(line => line.trim())
          .filter(Boolean);

        const resources = contentLines
          .filter(line => line.toLowerCase().includes('recurso'))
          .map(line => line.trim())
          .filter(Boolean);

        items.push({
          id: crypto.randomUUID(),
          semana: parseInt(weekNum) || items.length + 1,
          data_inicio: startDate ? parseDate(startDate) : '',
          data_fim: endDate ? parseDate(endDate) : '',
          atividades: activities.length > 0 ? activities : [''],
          recursos: resources.length > 0 ? resources : [''],
          avaliacao: ''
        });
      }

      return items;
    } catch (error) {
      console.error('Error in extractCronograma:', error);
      return [];
    }
  };

  const parseContent = (content: string) => {
    try {
      const { disciplina, abreviatura } = extractDisciplinaAndAbreviatura(content);
      const ementa = extractBetween(content, '(?:2|II)\\)\\s*Ementa', '(?:3|III)\\)');
      const objetivoGeral = extractBetween(content, '(?:3\\.1|III\\.1)\\s*Geral', '(?:3\\.2|III\\.2)');
      const metodologia = extractBetween(content, '(?:5|V)\\)\\s*Metodologia', '(?:6|VI)\\)');
      const justificativaModalidade = extractBetween(content, '(?:6|VI)\\)\\s*Justificativa\\s+da\\s+Modalidade', '(?:7|VII)\\)');
      const atividadesExtensao = extractBetween(content, '(?:7|VII)\\)\\s*Atividades\\s+de\\s+Extens[ãa]o', '(?:8|VIII)\\)');
      const bibliografiaBasica = extractNumberedItemsWithSubtopics(content, '11\\.1\\.').map(item => item.titulo);
      const bibliografiaComplementar = extractNumberedItemsWithSubtopics(content, '11\\.2\\.').map(item => item.titulo);
      const periodoMatch = content.match(/Per[íi]odo:?\s*(\d+)/i);
      
      return {
        disciplina,
        abreviatura,
        ementa: ementa || '',
        objetivo_geral: objetivoGeral || '',
        metodologia: metodologia || '',
        justificativa_modalidade: justificativaModalidade || '',
        atividades_extensao: atividadesExtensao || '',
        periodo_numero: periodoMatch ? parseInt(periodoMatch[1]) : 1,
        objetivos_especificos: extractObjetivosEspecificos(content),
        conteudo_programatico: extractNumberedItemsWithSubtopics(content, '4\\.'),
        cronograma: extractCronograma(content),
        recursos_utilizados: extractRecursos(content),
        visitas_tecnicas: extractVisitas(content),
        bibliografia_basica: bibliografiaBasica.length > 0 ? bibliografiaBasica : [''],
        bibliografia_complementar: bibliografiaComplementar.length > 0 ? bibliografiaComplementar : [''],
        ...extractCargaHoraria(content)
      };
    } catch (error) {
      console.error('Error in parseContent:', error);
      throw new Error('Erro ao processar o conteúdo do PDF. Formato inválido.');
    }
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
      
      if (!content.trim()) {
        throw new Error('PDF vazio ou ilegível');
      }

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

      const planoData = {
        ...parsedData,
        professor_id: user.id,
        titulo: titulo,
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
    } catch (error: any) {
      console.error('Erro ao importar PDF:', error);
      toast.error(error.message || 'Erro ao importar o plano. Verifique se o arquivo está no formato correto.');
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