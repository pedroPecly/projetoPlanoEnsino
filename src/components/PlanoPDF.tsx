import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import type { PlanoEnsino } from '../tipos';

Font.register({
  family: 'Calibri',
  src: '/src/assets/fonts/Calibri.ttf',
});

const styles = StyleSheet.create({
  page: {
    padding: 70,
    fontSize: 11,
    fontFamily: 'Calibri',
    lineHeight: 1.5,
    color: '#000',
  },
  subtitle: {
    fontSize: 11,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: '#333',
    borderStyle: 'solid',
    breakInside: 'avoid',
  },
  sectionTitle: {
    fontSize: 11,
    marginBottom: 8,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: '#f0f0f0',
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    marginHorizontal: -10,
    marginTop: -10,
  },
  content: {
    marginBottom: 8,
    textAlign: 'justify',
    borderColor: '#333',
  },
  list: {
    marginLeft: 20,
    borderColor: '#333',
  },
  listItem: {
    marginBottom: 4,
    borderColor: '#333',
  },
  subtopico: {
    marginLeft: 20,
    marginTop: 4,
    marginBottom: 4,
  },
  pageBreak: {
    marginTop: 30,
    marginBottom: 30,
    borderTopWidth: 1,
    borderTopColor: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    breakAfter: 'page',
  },
  infoRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    marginHorizontal: -10,
  },
  infoLabelCell: {
    padding: 5,
    width: '65%',
    fontWeight: 'bold',
    borderRightWidth: 1,
    borderRightColor: '#333',
    display: 'flex',
    justifyContent: 'center',
  },
  infoValueCell: {
    padding: 5,
    width: '35%',
    display: 'flex',
    justifyContent: 'center',
  },
  lastInfoRow: {
    flexDirection: 'row',
    marginHorizontal: -10,
    marginBottom: -10,
  },
  FirstInfoRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    marginTop: -9,
    marginHorizontal: -10,
  },
  cronogramaHeader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#333',
    marginHorizontal: -10,
    marginTop: -10,
  },
  cronogramaRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#333',
    minHeight: 35,
    marginHorizontal: -10,
  },
  cronogramaCell: {
    padding: 5,
    borderRightWidth: 1,
    borderRightColor: '#333',
  },
  visitaHeader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#333',
    marginTop: -10,
    marginLeft: -10,
    marginRight: -11,
  },
  visitaRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    minHeight: 35,
    marginLeft: -10,
    marginRight: -11,
  },
  visitaCell: {
    padding: 5,
    borderRightWidth: 1,
    borderRightColor: '#333',
  },
  sectionWrapper: {
    marginBottom: 20,
  },
  tableWrapper: {
    breakInside: 'avoid',
  },
});

interface PlanoPDFProps {
  planos: PlanoEnsino[];
  curso: string;
  periodo: string;
}

function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
}

function formatValue(value: any): string {
  return value ? value.toString() : 'N/A';
}

function formatNumber(value: number): string {
  return value ? value.toFixed(2) : 'N/A';
}

function formatCronogramaContent(semana: any): string {
  const parts = [];

  if (semana.atividades?.length) {
    parts.push('Atividades:');
    semana.atividades.forEach((atividade: any, index: number) => {
      parts.push(`${index + 1}. ${atividade.titulo}`);
      if (atividade.subtopicos?.length) {
        atividade.subtopicos.forEach((sub: any, subIndex: number) => {
          parts.push(`${index + 1}.${subIndex + 1}. ${sub.titulo}`);
        });
      }
    });
  }

  if (semana.avaliacao?.length) {
    parts.push('\nAvaliação:');
    semana.avaliacao.forEach((aval: any, index: number) => {
      parts.push(`${index + 1}. ${aval.titulo}`);
      if (aval.subtopicos?.length) {
        aval.subtopicos.forEach((sub: any, subIndex: number) => {
          parts.push(`${index + 1}.${subIndex + 1}. ${sub.titulo}`);
        });
      }
    });
  }

  return parts.join('\n');
}

export function PlanoPDF({ planos, curso, periodo }: PlanoPDFProps) {
  return (
    <Document>
      {planos.map((plano) => (
        <Page key={plano.id} size="A4" style={styles.page}>
          <Text style={styles.subtitle}>Ano {plano.ano_periodo}</Text>
          
          <View style={styles.sectionWrapper}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>1) IDENTIFICAÇÃO DO COMPONENTE CURRICULAR</Text>
              <View>
                <View style={styles.FirstInfoRow}>
                  <Text style={styles.infoLabelCell}>Componente Curricular:</Text>
                  <Text style={styles.infoValueCell}>{formatValue(plano.disciplina)}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabelCell}>abreviatura:</Text>
                  <Text style={styles.infoValueCell}>{formatValue(plano.abreviatura)}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabelCell}>Carga horaria Total:</Text>
                  <Text style={styles.infoValueCell}>{formatValue(plano.carga_horaria_total)} h/a 100%</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabelCell}>Carga horária presencial:</Text>
                  <Text style={styles.infoValueCell}>{formatValue(plano.carga_horaria_presencial)} h/a {formatNumber(plano.carga_horaria_presencial_percentual)}%</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabelCell}>Carga horária a distancia:</Text>
                  <Text style={styles.infoValueCell}>{plano.carga_horaria_distancia ? `${plano.carga_horaria_distancia} h/a ${formatNumber(plano.carga_horaria_distancia_percentual || 0)}%` : 'N/A'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabelCell}>Carga horaria de atividades Teórica:</Text>
                  <Text style={styles.infoValueCell}>{formatValue(plano.carga_horaria_teorica)} h/a {formatNumber(plano.carga_horaria_teorica_percentual)}%</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabelCell}>Carga horaria de atividades Prática:</Text>
                  <Text style={styles.infoValueCell}>{formatValue(plano.carga_horaria_pratica)} h/a {formatNumber(plano.carga_horaria_pratica_percentual)}%</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabelCell}>Carga horária/Aula Semanal:</Text>
                  <Text style={styles.infoValueCell}>{formatValue(plano.carga_horaria_semanal)} h/a</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabelCell}>Professor:</Text>
                  <Text style={styles.infoValueCell}>{formatValue(plano.professor_nome)}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabelCell}>Matrícula SIAPE:</Text>
                  <Text style={styles.infoValueCell}>{formatValue(plano.matricula_siape)}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabelCell}>Curso:</Text>
                  <Text style={styles.infoValueCell}>{formatValue(curso)}</Text>
                </View>
                <View style={styles.lastInfoRow}>
                  <Text style={styles.infoLabelCell}>Período:</Text>
                  <Text style={styles.infoValueCell}>{formatValue(periodo)}º período</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.sectionWrapper}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2) Ementa</Text>
              <Text style={styles.content}>{formatValue(plano.ementa)}</Text>
            </View>
          </View>

          <View style={styles.sectionWrapper}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>3) Objetivos</Text>
              <Text style={styles.content}>3.1 Geral:</Text>
              <Text style={styles.content}>{formatValue(plano.objetivo_geral)}</Text>
              <Text style={styles.content}>3.2 Específicos:</Text>
              <View style={styles.list}>
                {plano.objetivos_especificos.map((conteudo, index) => (
                  <View key={index}>
                    <Text style={styles.listItem}>3.2.{index + 1} {formatValue(conteudo.titulo)}</Text>
                    {conteudo.subtopicos.map((sub, subIndex) => (
                      <Text key={subIndex} style={[styles.listItem, { marginLeft: 20 }]}>
                        3.2.{index + 1}.{subIndex + 1} {formatValue(sub.titulo)}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.sectionWrapper}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>4) Conteúdo</Text>
              <View style={styles.list}>
                {plano.conteudo_programatico.map((conteudo, index) => (
                  <View key={index}>
                    <Text style={styles.listItem}>4.{index + 1} {formatValue(conteudo.titulo)}</Text>
                    {conteudo.subtopicos.map((sub, subIndex) => (
                      <Text key={subIndex} style={[styles.listItem, { marginLeft: 20 }]}>
                        4.{index + 1}.{subIndex + 1} {formatValue(sub.titulo)}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.sectionWrapper}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>5) Metodologia</Text>
              <Text style={styles.content}>{formatValue(plano.metodologia)}</Text>
            </View>
          </View>

          <View style={styles.sectionWrapper}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>6) Justificativa da Modalidade</Text>
              <Text style={styles.content}>{formatValue(plano.justificativa_modalidade)}</Text>
            </View>
          </View>

          <View style={styles.sectionWrapper}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>7) Atividades de Extensão</Text>
              <Text style={styles.content}>{formatValue(plano.atividades_extensao)}</Text>
            </View>
          </View>

          <View style={styles.sectionWrapper}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>8) Recursos Utilizados</Text>
              <View style={styles.list}>
                {plano.recursos_utilizados.map((recurso, index) => (
                  <View key={index}>
                    <Text style={styles.listItem}>
                      8.{index + 1} {recurso.tipo.charAt(0).toUpperCase() + recurso.tipo.slice(1)}: {recurso.descricao}
                      {recurso.quantidade && ` (Quantidade: ${recurso.quantidade})`}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.sectionWrapper}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>9) Visitas Técnicas</Text>
              <View style={styles.tableWrapper}>
                <View style={styles.visitaHeader}>
                  <View style={[styles.visitaCell, { width: '45%' }]}>
                    <Text>Local</Text>
                  </View>
                  <View style={[styles.visitaCell, { width: '20%' }]}>
                    <Text>Data Prevista</Text>
                  </View>
                  <View style={[styles.visitaCell, { width: '35%' }]}>
                    <Text>Materiais Necessários</Text>
                  </View>
                </View>
                {plano.visitas_tecnicas.map((visita, index) => (
                  <View key={index} style={styles.visitaRow}>
                    <View style={[styles.visitaCell, { width: '45%' }]}>
                      <Text>{visita.local}</Text>
                    </View>
                    <View style={[styles.visitaCell, { width: '20%' }]}>
                      <Text>{formatDate(visita.data_prevista)}</Text>
                    </View>
                    <View style={[styles.visitaCell, { width: '35%' }]}>
                      <Text>{visita.materiais_necessarios.join(', ')}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.sectionWrapper}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>10) Cronograma</Text>
              <View style={styles.tableWrapper}>
                <View style={styles.cronogramaHeader}>
                  <View style={[styles.cronogramaCell, { width: '13%' }]}>
                    <Text>Data</Text>
                  </View>
                  <View style={[styles.cronogramaCell, { width: '87%', borderRightWidth: 0 }]}>
                    <Text>Conteúdo / Atividade docente e/ou discente</Text>
                  </View>
                </View>
                {plano.cronograma.map((semana, index) => (
                  <View key={index} style={styles.cronogramaRow}>
                    <View style={[styles.cronogramaCell, { width: '13%' }]}>
                      <Text>{formatDate(semana.data_inicio)} a {formatDate(semana.data_fim)}</Text>
                    </View>
                    <View style={[styles.cronogramaCell, { width: '87%', borderRightWidth: 0 }]}>
                      <Text>{formatCronogramaContent(semana)}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.sectionWrapper}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>11) Bibliografia</Text>
              <Text style={styles.content}>11.1 Básica:</Text>
              <View style={styles.list}>
                {plano.bibliografia_basica.map((ref, index) => (
                  <Text key={index} style={styles.listItem}>
                    11.1.{index + 1} {formatValue(ref)}
                  </Text>
                ))}
              </View>
              <Text style={styles.content}>11.2 Complementar:</Text>
              <View style={styles.list}>
                {plano.bibliografia_complementar.map((ref, index) => (
                  <Text key={index} style={styles.listItem}>
                    11.2.{index + 1} {formatValue(ref)}
                  </Text>
                ))}
              </View>
            </View>
          </View>
        </Page>
      ))}
    </Document>
  );
}