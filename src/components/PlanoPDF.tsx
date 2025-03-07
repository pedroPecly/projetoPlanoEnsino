import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import type { PlanoEnsino } from '../tipos';

// Registre a fonte Calibri localmente
Font.register({
  family: 'Calibri',
  src: '/src/assets/fonts/Calibri.ttf', // Atualize o caminho conforme necessário
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
    borderColor: '#333', // Tom cinza escuro
    borderStyle: 'solid',
    borderLeftWidth: 1,
    borderLeftColor: '#333',
    borderRightWidth: 1,
    borderRightColor: '#333',
    borderTopWidth: 1,
    borderTopColor: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: '#f0f0f0',
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#333', // Tom cinza escuro
    marginHorizontal: -10,
    marginTop: -10,
  },
  content: {
    marginBottom: 8,
    textAlign: 'justify',
    borderColor: '#333', // Tom cinza escuro
  },
  list: {
    marginLeft: 20,
    borderColor: '#333', // Tom cinza escuro
  },
  listItem: {
    marginBottom: 4,
    borderColor: '#333', // Tom cinza escuro
  },
  table: {
    display: 'flex',
    width: 'auto',
    marginBottom: 5,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCell: {
    padding: 5,
    flex: 1,
  },
  tableHeader: {
    fontWeight: 'bold',
  },
  pageBreak: {
    marginTop: 30,
    marginBottom: 30,
    borderTopWidth: 1,
    borderTopColor: '#333', // Tom cinza escuro
    borderBottomWidth: 1,
    borderBottomColor: '#333', // Tom cinza escuro
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    marginVertical: 0, // Remover qualquer espaço entre as linhas
    marginHorizontal: -10,
  },
  infoTable: {
    width: '100%',
    marginBottom: 0, // Remover margem inferior
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 0, // Remover margem inferior
    height: 24, // Definir uma altura fixa para garantir espaço suficiente
  },
  infoLabelCell: {
    padding: 2, // Reduzir o padding
    paddingLeft: 5,
    paddingRight: 5,
    width: '50%', // Aumentar a largura para dar mais espaço aos nomes dos elementos
    fontWeight: 'bold',
    borderRightWidth: 1, // Adiciona linha vertical
    borderRightColor: '#333', // Mesma cor das outras bordas
    display: 'flex',
    justifyContent: 'center', // Centraliza verticalmente
  },
  infoValueCell: {
    padding: 2, // Reduzir o padding
    paddingLeft: 5,
    width: '50%', // Ajustar a largura para manter a proporção
    display: 'flex',
    justifyContent: 'center', // Centraliza verticalmente
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
        <Text style={styles.subtitle}>{curso} - {periodo}</Text>

        {planos.map((plano, index) => (
          <View key={plano.id}>
            {index > 0 && <View style={styles.pageBreak} />}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>1) IDENTIFICAÇÃO DO COMPONENTE CURRICULAR</Text>
              
              <View style={styles.infoTable}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabelCell}>Componente Curricular:</Text>
                  <Text style={styles.infoValueCell}>{plano.disciplina}</Text>
                </View>
              </View>
              <View style={styles.divider} />
              
              <View style={styles.infoTable}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabelCell}>Carga horaria Total:</Text>
                  <Text style={styles.infoValueCell}>{plano.carga_horaria_total} horas</Text>
                </View>
              </View>
              <View style={styles.divider} />
              
              <View style={styles.infoTable}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabelCell}>Carga horária presencial:</Text>
                  <Text style={styles.infoValueCell}>{plano.carga_horaria_presencial} horas ({plano.carga_horaria_presencial_percentual}%)</Text>
                </View>
              </View>
              <View style={styles.divider} />
              
              <View style={styles.infoTable}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabelCell}>Carga horaria de atividades Teórica:</Text>
                  <Text style={styles.infoValueCell}>{plano.carga_horaria_teorica} horas ({plano.carga_horaria_teorica_percentual}%)</Text>
                </View>
              </View>
              <View style={styles.divider} />
              
              <View style={styles.infoTable}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabelCell}>Carga horaria de atividades Prática:</Text>
                  <Text style={styles.infoValueCell}>{plano.carga_horaria_pratica} horas ({plano.carga_horaria_pratica_percentual}%)</Text>
                </View>
              </View>
              <View style={styles.divider} />
              
              <View style={styles.infoTable}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabelCell}>Carga horária/Aula Semanal:</Text>
                  <Text style={styles.infoValueCell}>{plano.carga_horaria_semanal} horas</Text>
                </View>
              </View>
              <View style={styles.divider} />
              
              <View style={styles.infoTable}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabelCell}>Professor:</Text>
                  <Text style={styles.infoValueCell}>{plano.professor_nome}</Text>
                </View>
              </View>
              <View style={styles.divider} />
              
              <View style={styles.infoTable}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabelCell}>Matrícula SIAPE:</Text>
                  <Text style={styles.infoValueCell}>{plano.matricula_siape}</Text>
                </View>
              </View>
              <View style={styles.divider} />
              
              <View style={styles.infoTable}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabelCell}>Curso:</Text>
                  <Text style={styles.infoValueCell}>{curso}</Text>
                </View>
              </View>
              <View style={styles.divider} />
              
              <View style={styles.infoTable}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabelCell}>Período:</Text>
                  <Text style={styles.infoValueCell}>{periodo}º período</Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2) Ementa</Text>
              <Text style={styles.content}>2.1 {plano.ementa}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>3) Objetivos</Text>
              <Text style={styles.content}>3.1 Geral:</Text>
              <Text style={styles.content}>{plano.objetivo_geral}</Text>
              <Text style={styles.content}>3.2 Específicos:</Text>
              <View style={styles.list}>
                {plano.objetivos_especificos.map((conteudo, index) => (
                  <View key={index}>
                    <Text style={styles.listItem}>3.2.{index + 1} {conteudo.titulo}</Text>
                    {conteudo.subtopicos.map((sub, subIndex) => (
                      <Text key={subIndex} style={[styles.listItem, { marginLeft: 20 }]}>
                        3.2.{index + 1}.{subIndex + 1} {sub.titulo}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>4) Conteúdo Programático</Text>
              <View style={styles.list}>
                {plano.conteudo_programatico.map((conteudo, index) => (
                  <View key={index}>
                    <Text style={styles.listItem}>4.{index + 1} {conteudo.titulo}</Text>
                    {conteudo.subtopicos.map((sub, subIndex) => (
                      <Text key={subIndex} style={[styles.listItem, { marginLeft: 20 }]}>
                        4.{index + 1}.{subIndex + 1} {sub.titulo}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>5) Metodologia</Text>
              <Text style={styles.content}>{plano.metodologia}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>6) Critérios de Avaliação</Text>
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
              <Text style={styles.sectionTitle}>7) Bibliografia</Text>
              <Text style={styles.content}>7.1 Básica:</Text>
              <View style={styles.list}>
                {plano.bibliografia_basica.map((ref, index) => (
                  <Text key={index} style={styles.listItem}>
                    7.1.{index + 1} {ref}
                  </Text>
                ))}
              </View>
              <Text style={styles.content}>7.2 Complementar:</Text>
              <View style={styles.list}>
                {plano.bibliografia_complementar.map((ref, index) => (
                  <Text key={index} style={styles.listItem}>
                    7.2.{index + 1} {ref}
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