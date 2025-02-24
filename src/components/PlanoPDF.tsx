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
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCell: {
    padding: 5,
    borderWidth: 1,
    borderColor: '#bdc3c7',
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
              <Text style={styles.sectionTitle}>Informações Gerais</Text>
              <Text style={styles.content}>Disciplina: {plano.disciplina}</Text>
              <Text style={styles.content}>Status: {plano.status}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Carga Horária</Text>
              <Text style={styles.content}>Total: {plano.carga_horaria_total} horas</Text>
              <Text style={styles.content}>Presencial: {plano.carga_horaria_presencial} horas ({plano.carga_horaria_presencial_percentual}%)</Text>
              <Text style={styles.content}>Teórica: {plano.carga_horaria_teorica} horas ({plano.carga_horaria_teorica_percentual}%)</Text>
              <Text style={styles.content}>Prática: {plano.carga_horaria_pratica} horas ({plano.carga_horaria_pratica_percentual}%)</Text>
              <Text style={styles.content}>Semanal: {plano.carga_horaria_semanal} horas</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ementa</Text>
              <Text style={styles.content}>{plano.ementa}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Objetivos</Text>
              <Text style={styles.content}>Geral:</Text>
              <Text style={styles.content}>{plano.objetivo_geral}</Text>
              <Text style={styles.content}>Específicos:</Text>
              <View style={styles.list}>
                {plano.objetivos_especificos.map((objetivo, index) => (
                  <Text key={index} style={styles.listItem}>
                    • {objetivo}
                  </Text>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Conteúdo Programático</Text>
              <View style={styles.list}>
                {plano.conteudo_programatico.map((conteudo, index) => (
                  <View key={index}>
                    <Text style={styles.listItem}>• {conteudo.titulo}</Text>
                    {conteudo.subtopicos.map((sub, subIndex) => (
                      <Text key={subIndex} style={[styles.listItem, { marginLeft: 20 }]}>
                        - {sub.titulo}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Metodologia</Text>
              <Text style={styles.content}>{plano.metodologia}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bibliografia</Text>
              <Text style={styles.content}>Básica:</Text>
              <View style={styles.list}>
                {plano.bibliografia_basica.map((ref, index) => (
                  <Text key={index} style={styles.listItem}>
                    • {ref}
                  </Text>
                ))}
              </View>
              <Text style={styles.content}>Complementar:</Text>
              <View style={styles.list}>
                {plano.bibliografia_complementar.map((ref, index) => (
                  <Text key={index} style={styles.listItem}>
                    • {ref}
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