import type { QuizQuestion } from '../types'

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'body-frame',
    category: 'Seu corpo',
    prompt: 'Ao longo da vida, como seu corpo tende a responder às mudanças?',
    options: [
      { id: 'body-frame-v', label: 'Muda rápido, inclusive de peso e disposição.', dosha: 'vata' },
      { id: 'body-frame-k', label: 'Mantém um ritmo estável e muda aos poucos.', dosha: 'kapha' },
      { id: 'body-frame-p', label: 'Responde com intensidade e sinais bem claros.', dosha: 'pitta' },
    ],
  },
  {
    id: 'skin',
    category: 'Seu corpo',
    prompt: 'Como sua pele costuma se apresentar na maior parte do tempo?',
    options: [
      { id: 'skin-p', label: 'Sensível, quente ou propensa a vermelhidão.', dosha: 'pitta' },
      { id: 'skin-v', label: 'Mais seca, fina ou com sensação de repuxar.', dosha: 'vata' },
      { id: 'skin-k', label: 'Macia, hidratada e de aparência uniforme.', dosha: 'kapha' },
    ],
  },
  {
    id: 'temperature',
    category: 'Seu corpo',
    prompt: 'Em relação à temperatura, qual frase combina mais com você?',
    options: [
      { id: 'temperature-k', label: 'Prefiro calor e posso sentir umidade ou peso.', dosha: 'kapha' },
      { id: 'temperature-p', label: 'Sinto calor com facilidade e busco lugares frescos.', dosha: 'pitta' },
      { id: 'temperature-v', label: 'Mãos e pés frios são comuns para mim.', dosha: 'vata' },
    ],
  },
  {
    id: 'appetite',
    category: 'Sua digestão',
    prompt: 'Como costuma ser a sua fome?',
    options: [
      { id: 'appetite-v', label: 'Irregular: às vezes forte, às vezes quase some.', dosha: 'vata' },
      { id: 'appetite-p', label: 'Forte e pontual; atrasar uma refeição me afeta.', dosha: 'pitta' },
      { id: 'appetite-k', label: 'Estável e tranquila; consigo esperar sem pressa.', dosha: 'kapha' },
    ],
  },
  {
    id: 'digestion',
    category: 'Sua digestão',
    prompt: 'Depois de comer, o que aparece com mais frequência?',
    options: [
      { id: 'digestion-p', label: 'Calor, acidez ou digestão muito rápida.', dosha: 'pitta' },
      { id: 'digestion-k', label: 'Sensação de peso e digestão mais lenta.', dosha: 'kapha' },
      { id: 'digestion-v', label: 'Gases, estufamento ou resposta imprevisível.', dosha: 'vata' },
    ],
  },
  {
    id: 'intense-day',
    category: 'Sua energia',
    prompt: 'Quando o dia fica mais intenso, o que costuma acontecer com você?',
    options: [
      { id: 'intense-day-v', label: 'Minha mente acelera e eu me disperso.', dosha: 'vata' },
      { id: 'intense-day-p', label: 'Fico impaciente e quero resolver tudo.', dosha: 'pitta' },
      { id: 'intense-day-k', label: 'Eu diminuo o ritmo e demoro a reagir.', dosha: 'kapha' },
    ],
  },
  {
    id: 'energy',
    category: 'Sua energia',
    prompt: 'Como sua energia se distribui durante um dia comum?',
    options: [
      { id: 'energy-k', label: 'Começa devagar, mas ganha constância e resistência.', dosha: 'kapha' },
      { id: 'energy-v', label: 'Vem em picos, com alternância entre ânimo e cansaço.', dosha: 'vata' },
      { id: 'energy-p', label: 'É intensa e focada até eu ultrapassar meu limite.', dosha: 'pitta' },
    ],
  },
  {
    id: 'movement',
    category: 'Sua energia',
    prompt: 'Qual é o seu ritmo natural ao caminhar, falar ou executar tarefas?',
    options: [
      { id: 'movement-p', label: 'Objetivo, decidido e eficiente.', dosha: 'pitta' },
      { id: 'movement-v', label: 'Rápido, leve e por vezes inquieto.', dosha: 'vata' },
      { id: 'movement-k', label: 'Calmo, constante e sem muita pressa.', dosha: 'kapha' },
    ],
  },
  {
    id: 'learning',
    category: 'Sua mente',
    prompt: 'Como você costuma aprender e lembrar das coisas?',
    options: [
      { id: 'learning-v', label: 'Aprendo rápido e também posso esquecer rápido.', dosha: 'vata' },
      { id: 'learning-k', label: 'Levo mais tempo, mas guardo por muito tempo.', dosha: 'kapha' },
      { id: 'learning-p', label: 'Entendo pela lógica e gosto de dominar o assunto.', dosha: 'pitta' },
    ],
  },
  {
    id: 'decisions',
    category: 'Sua mente',
    prompt: 'Diante de uma decisão importante, qual tendência aparece?',
    options: [
      { id: 'decisions-k', label: 'Pondero com calma e posso adiar a mudança.', dosha: 'kapha' },
      { id: 'decisions-p', label: 'Analiso, escolho e sigo com convicção.', dosha: 'pitta' },
      { id: 'decisions-v', label: 'Vejo muitas possibilidades e posso mudar de ideia.', dosha: 'vata' },
    ],
  },
  {
    id: 'pressure',
    category: 'Sua mente',
    prompt: 'Sob pressão, qual reação é mais familiar?',
    options: [
      { id: 'pressure-p', label: 'Crítica, irritação ou necessidade de controle.', dosha: 'pitta' },
      { id: 'pressure-v', label: 'Preocupação, agitação ou dificuldade de organizar.', dosha: 'vata' },
      { id: 'pressure-k', label: 'Recolhimento, resistência ou vontade de não mexer.', dosha: 'kapha' },
    ],
  },
  {
    id: 'sleep',
    category: 'Seu descanso',
    prompt: 'Como é o seu sono na maior parte das fases da vida?',
    options: [
      { id: 'sleep-k', label: 'Profundo, longo e difícil de interromper.', dosha: 'kapha' },
      { id: 'sleep-v', label: 'Leve, irregular e sensível a sons ou pensamentos.', dosha: 'vata' },
      { id: 'sleep-p', label: 'Regular, mas pode ser interrompido por calor ou tarefas.', dosha: 'pitta' },
    ],
  },
  {
    id: 'routine',
    category: 'Sua rotina',
    prompt: 'Como você se relaciona com uma rotina definida?',
    options: [
      { id: 'routine-v', label: 'Gosto da ideia, mas variar e improvisar é mais natural.', dosha: 'vata' },
      { id: 'routine-p', label: 'Gosto de planejar, medir e cumprir o que foi definido.', dosha: 'pitta' },
      { id: 'routine-k', label: 'A constância me faz bem, mesmo que mudar seja difícil.', dosha: 'kapha' },
    ],
  },
  {
    id: 'social',
    category: 'Suas relações',
    prompt: 'Em um grupo novo, como você tende a chegar?',
    options: [
      { id: 'social-p', label: 'Assumo direção e vou logo ao ponto.', dosha: 'pitta' },
      { id: 'social-k', label: 'Observo, acolho e crio vínculos aos poucos.', dosha: 'kapha' },
      { id: 'social-v', label: 'Converso, conecto ideias e circulo com facilidade.', dosha: 'vata' },
    ],
  },
  {
    id: 'change',
    category: 'Sua rotina',
    prompt: 'Quando uma mudança inesperada acontece, o que vem primeiro?',
    options: [
      { id: 'change-k', label: 'Preciso de tempo para soltar o conhecido.', dosha: 'kapha' },
      { id: 'change-v', label: 'Fico curiosa, mas posso me sentir sem chão.', dosha: 'vata' },
      { id: 'change-p', label: 'Reorganizo o plano e parto para a solução.', dosha: 'pitta' },
    ],
  },
]

export const questionById = new Map(quizQuestions.map((question) => [question.id, question]))
