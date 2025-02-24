import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { PlanoEnsino } from '../tipos';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: 'Helvetica',
    lineHeight: 1.5,
    color: '#333',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#34495e',
  },
  section: {
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#bdc3c7',
    paddingBottom: 5,
    color: '#2980b9',
  },
  content: {
    marginBottom: 10,
    textAlign: 'justify',
  },
  list: {
    marginLeft: 20,
  },
  listItem: {
    marginBottom: 5,
  },
  table: {
    display: 'flex',
    width: 'auto',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 5,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCell: {
    padding: 5,
    borderWidth: 1,
    borderColor: '#bdc3c7',
    flex: 1,
  },
  tableHeader: {
    backgroundColor: '#ecf0f1',
    fontWeight: 'bold',
  },
  pageBreak: {
    marginTop: 30,
    marginBottom: 30,
    borderTopWidth: 1,
    borderTopColor: '#bdc3c7',
  },
});

interface PlanoPDFProps {
  planos: PlanoEnsino[];
  curso: string;
  periodo: string;
}

export function PlanoPDF({ planos, curso, periodo }: PlanoPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Relatório de Planos de Ensino</Text>
        <Text style={styles.subtitle}>{curso} - {periodo}</Text>

        {planos.map((plano, index) => (
          <View key={plano.id}>
            {index > 0 && <View style={styles.pageBreak} />}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>1. Informações Gerais</Text>
              <Text style={styles.content}>1.1 Disciplina: {plano.disciplina}</Text>
              <Text style={styles.content}>1.2 Professor: {plano.professor_nome}</Text>
              <Text style={styles.content}>1.3 Curso: {curso}</Text>
              <Text style={styles.content}>1.4 Período: {periodo}º periodo</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2. Carga Horária</Text>
              <Text style={styles.content}>2.1 Total: {plano.carga_horaria_total} horas</Text>
              <Text style={styles.content}>2.2 Presencial: {plano.carga_horaria_presencial} horas ({plano.carga_horaria_presencial_percentual}%)</Text>
              <Text style={styles.content}>2.3 Teórica: {plano.carga_horaria_teorica} horas ({plano.carga_horaria_teorica_percentual}%)</Text>
              <Text style={styles.content}>2.4 Prática: {plano.carga_horaria_pratica} horas ({plano.carga_horaria_pratica_percentual}%)</Text>
              <Text style={styles.content}>2.5 Semanal: {plano.carga_horaria_semanal} horas</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>3. Ementa</Text>
              <Text style={styles.content}>3.1 {plano.ementa}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>4. Objetivos</Text>
              <Text style={styles.content}>4.1 Geral:</Text>
              <Text style={styles.content}>{plano.objetivo_geral}</Text>
              <Text style={styles.content}>4.2 Específicos:</Text>
              <View style={styles.list}>
                {plano.objetivos_especificos.map((conteudo, index) => (
                  <View key={index}>
                    <Text style={styles.listItem}>4.2.{index + 1} {conteudo.titulo}</Text>
                    {conteudo.subtopicos.map((sub, subIndex) => (
                      <Text key={subIndex} style={[styles.listItem, { marginLeft: 20 }]}>
                        4.2.{index + 1}.{subIndex + 1} {sub.titulo}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>5. Conteúdo Programático</Text>
              <View style={styles.list}>
                {plano.conteudo_programatico.map((conteudo, index) => (
                  <View key={index}>
                    <Text style={styles.listItem}>5.{index + 1} {conteudo.titulo}</Text>
                    {conteudo.subtopicos.map((sub, subIndex) => (
                      <Text key={subIndex} style={[styles.listItem, { marginLeft: 20 }]}>
                        5.{index + 1}.{subIndex + 1} {sub.titulo}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>6. Metodologia</Text>
              <Text style={styles.content}>{plano.metodologia}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>7. Critérios de Avaliação</Text>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={styles.tableCell}>Descrição</Text>
                  <Text style={styles.tableCell}>Peso (%)</Text>
                </View>
                {plano.criterios_avaliacao.map((criterio, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={styles.tableCell}>{criterio.descricao}</Text>
                    <Text style={styles.tableCell}>{criterio.peso}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>8. Bibliografia</Text>
              <Text style={styles.content}>8.1 Básica:</Text>
              <View style={styles.list}>
                {plano.bibliografia_basica.map((ref, index) => (
                  <Text key={index} style={styles.listItem}>
                    8.1.{index + 1} {ref}
                  </Text>
                ))}
              </View>
              <Text style={styles.content}>8.2 Complementar:</Text>
              <View style={styles.list}>
                {plano.bibliografia_complementar.map((ref, index) => (
                  <Text key={index} style={styles.listItem}>
                    8.2.{index + 1} {ref}
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