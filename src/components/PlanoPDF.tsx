import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import type { PlanoEnsino } from '../tipos';

Font.register({
  family: 'Calibri',
  src: '/src/assets/fonts/Calibri.ttf',
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: 'Calibri',
    lineHeight: 1.5,
    color: '#000',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: '#333',
    borderStyle: 'solid',
  },
  sectionTitle: {
    fontSize: 16,
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
  table: {
    width: '100%',
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#333',
    borderStyle: 'solid',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    minHeight: 25,
    alignItems: 'stretch',
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
  },
  tableCell: {
    padding: 5,
    textAlign: 'left',
    borderRightWidth: 1,
    borderRightColor: '#333',
  },
  tableCellLast: {
    padding: 5,
    textAlign: 'left',
    borderRightWidth: 0,
  },
  dataCellSmall: {
    width: '15%',
  },
  cargaHorariaCellSmall: {
    width: '15%',
  },
  conteudoCell: {
    width: '70%',
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
  },
  infoTable: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 0,
  },
  infoRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    minHeight: 24,
  },
  infoLabelCell: {
    padding: 5,
    width: '50%',
    fontWeight: 'bold',
    borderRightWidth: 1,
    borderRightColor: '#333',
    display: 'flex',
    justifyContent: 'center',
  },
  infoValueCell: {
    padding: 5,
    width: '50%',
    display: 'flex',
    justifyContent: 'center',
  },
  lastInfoRow: {
    flexDirection: 'row',
    minHeight: 24,
    borderBottomWidth: 0,
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

function formatComplexValue(...values: any[]): string {
  return values.some(value => !value) ? 'N/A' : values.join(' ');
}

export function PlanoPDF({ planos, curso, periodo }: PlanoPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.subtitle}>{curso} - {periodo}</Text>

        {planos.map((plano, index) => (
          <View key={plano.id}>
            {index > 0 && <View style={styles.pageBreak} />}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>1) IDENTIFICAÇÃO DO COMPONENTE CURRICULAR</Text>
              
              <View style={styles.infoTable}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabelCell}>Componente Curricular:</Text>
                  <Text style={styles.infoValueCell}>{formatValue(plano.disciplina)}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabelCell}>Carga horaria Total:</Text>
                  <Text style={styles.infoValueCell}>{formatComplexValue(plano.carga_horaria_total, 'h/a 100%')}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabelCell}>Carga horária presencial:</Text>
                  <Text style={styles.infoValueCell}>{formatComplexValue(plano.carga_horaria_presencial, 'h/a', plano.carga_horaria_presencial_percentual + '%')}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabelCell}>Carga horária a distancia:</Text>
                  <Text style={styles.infoValueCell}>{formatComplexValue(plano.carga_horaria_distancia, 'h/a', plano.carga_horaria_distancia_percentual + '%')}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabelCell}>Carga horaria de atividades Teórica:</Text>
                  <Text style={styles.infoValueCell}>{formatComplexValue(plano.carga_horaria_teorica, 'h/a', plano.carga_horaria_teorica_percentual + '%')}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabelCell}>Carga horaria de atividades Prática:</Text>
                  <Text style={styles.infoValueCell}>{formatComplexValue(plano.carga_horaria_pratica, 'h/a', plano.carga_horaria_pratica_percentual + '%')}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabelCell}>Carga horária/Aula Semanal:</Text>
                  <Text style={styles.infoValueCell}>{formatComplexValue(plano.carga_horaria_semanal, 'h/a')}</Text>
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

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2) Ementa</Text>
              <Text style={styles.content}>2.1 {formatValue(plano.ementa)}</Text>
            </View>

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

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>4) Conteúdo Programático</Text>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={[styles.tableCell, styles.dataCellSmall]}>Data Prevista</Text>
                  <Text style={[styles.tableCell, styles.cargaHorariaCellSmall]}>Carga Horária</Text>
                  <Text style={[styles.tableCellLast, styles.conteudoCell]}>Conteúdo</Text>
                </View>
                {plano.conteudo_programatico.map((conteudo, index) => (
                  <View key={index} style={[
                    styles.tableRow,
                    index === plano.conteudo_programatico.length - 1 ? { borderBottomWidth: 0 } : {}
                  ]}>
                    <Text style={[styles.tableCell, styles.dataCellSmall]}>
                      {formatDate(conteudo.data_prevista)}
                    </Text>
                    <Text style={[styles.tableCell, styles.cargaHorariaCellSmall]}>
                      {formatValue(conteudo.carga_horaria)}
                    </Text>
                    <View style={[styles.tableCellLast, styles.conteudoCell]}>
                      <Text>{formatValue(conteudo.titulo)}</Text>
                      {conteudo.subtopicos.map((sub, subIndex) => (
                        <Text key={subIndex} style={styles.subtopico}>
                          - {formatValue(sub.titulo)}
                        </Text>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>5) Metodologia</Text>
              <Text style={styles.content}>{formatValue(plano.metodologia)}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>6) Bibliografia</Text>
              <Text style={styles.content}>6.1 Básica:</Text>
              <View style={styles.list}>
                {plano.bibliografia_basica.map((ref, index) => (
                  <Text key={index} style={styles.listItem}>
                    6.1.{index + 1} {formatValue(ref)}
                  </Text>
                ))}
              </View>
              <Text style={styles.content}>6.2 Complementar:</Text>
              <View style={styles.list}>
                {plano.bibliografia_complementar.map((ref, index) => (
                  <Text key={index} style={styles.listItem}>
                    6.2.{index + 1} {formatValue(ref)}
                  </Text>
                ))}
              </View>
            </View>
          </View>
        ))}
      </Page>
    </Document>
  );
}