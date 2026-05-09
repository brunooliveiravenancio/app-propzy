export const mockLeads = [
  { id: "1", nome: "João Silva", telefone: "+351912345678", email: "joao@email.pt", intencao: "compra", tipoImovel: "apartamento", zona: "Lisboa, Parque das Nações", orcamento: "320.000€", prazo: "6 meses", fonte: "chamada_inbound", createdAt: "2025-05-08T10:30:00Z" },
  { id: "2", nome: "Maria Santos", telefone: "+351961234567", email: "maria@email.pt", intencao: "arrendamento", tipoImovel: "apartamento", zona: "Porto, Bonfim", orcamento: "900€/mês", prazo: "1 mês", fonte: "chamada_outbound", createdAt: "2025-05-08T09:15:00Z" },
  { id: "3", nome: "Carlos Ferreira", telefone: "+351932345678", email: null, intencao: "compra", tipoImovel: "moradia", zona: "Cascais", orcamento: "650.000€", prazo: "1 ano", fonte: "chamada_inbound", createdAt: "2025-05-07T16:45:00Z" },
  { id: "4", nome: "Ana Rodrigues", telefone: "+351916543210", email: "ana.r@email.pt", intencao: "compra", tipoImovel: "apartamento", zona: "Braga", orcamento: "190.000€", prazo: "3 meses", fonte: "chamada_outbound", createdAt: "2025-05-07T14:20:00Z" },
  { id: "5", nome: "Pedro Alves", telefone: "+351925678901", email: null, intencao: "arrendamento", tipoImovel: "comercial", zona: "Lisboa, Marquês de Pombal", orcamento: "2.500€/mês", prazo: "imediato", fonte: "chamada_inbound", createdAt: "2025-05-06T11:00:00Z" },
  { id: "6", nome: "Sofia Mendes", telefone: "+351934567890", email: "sofia@email.pt", intencao: "compra", tipoImovel: "moradia", zona: "Sintra", orcamento: "420.000€", prazo: "6 meses", fonte: "chamada_outbound", createdAt: "2025-05-06T09:30:00Z" },
  { id: "7", nome: "Rui Costa", telefone: "+351963456789", email: "rui.costa@email.pt", intencao: "compra", tipoImovel: "apartamento", zona: "Setúbal", orcamento: "160.000€", prazo: "9 meses", fonte: "chamada_inbound", createdAt: "2025-05-05T15:10:00Z" },
  { id: "8", nome: "Inês Lopes", telefone: "+351912678901", email: null, intencao: "arrendamento", tipoImovel: "apartamento", zona: "Aveiro", orcamento: "750€/mês", prazo: "2 semanas", fonte: "chamada_outbound", createdAt: "2025-05-05T10:45:00Z" },
];

export const mockCalls = [
  { id: "1", callSid: "CA001", direction: "inbound", callerPhone: "+351912345678", leadNome: "João Silva", status: "completed", duration: 245, started_at: "2025-05-08T10:30:00Z", transcricao: "Agente: Olá, obrigado por contactar a Propzy! Sou a assistente virtual. Em que posso ajudá-lo hoje?\nCliente: Bom dia! Estou à procura de um apartamento para comprar em Lisboa.\nAgente: Ótimo! Tem alguma zona específica em Lisboa em mente?\nCliente: Sim, preferia o Parque das Nações ou Marvila.\nAgente: Perfeito. E tem uma ideia do orçamento que pretende investir?\nCliente: Até 320.000€.\nAgente: Entendido. Em termos de prazo, quando pretende fazer a aquisição?\nCliente: Nos próximos 6 meses, mais ou menos.\nAgente: Muito bem, João. Vou registar a sua preferência e um consultor da Propzy vai entrar em contacto em breve. Obrigado pela sua chamada!" },
  { id: "2", callSid: "CA002", direction: "outbound", callerPhone: "+351961234567", leadNome: "Maria Santos", status: "completed", duration: 178, started_at: "2025-05-08T09:15:00Z", transcricao: "Agente: Bom dia! Fala com a assistente da Propzy. Estou a ligar sobre um T2 em Porto, Bonfim, 900€/mês. Tem um momento?\nCliente: Sim, pode falar.\nAgente: Estamos com um apartamento T2 completamente remodelado no Bonfim, a 900€ por mês. Tem interesse em arrendamento?\nCliente: Sim, estou mesmo à procura de algo nessa zona.\nAgente: Que bom! Para quando precisaria?\nCliente: Para o próximo mês idealmente." },
  { id: "3", callSid: "CA003", direction: "inbound", callerPhone: "+351932345678", leadNome: "Carlos Ferreira", status: "completed", duration: 312, started_at: "2025-05-07T16:45:00Z", transcricao: "Agente: Olá, obrigado por contactar a Propzy! Em que posso ajudá-lo?\nCliente: Boa tarde. Estou à procura de uma moradia em Cascais para comprar.\nAgente: Ótimo! Que tipologia pretende?\nCliente: Uma T4 com jardim se possível.\nAgente: Compreendo. Qual é o seu orçamento?\nCliente: Podemos ir até 650.000€." },
  { id: "4", callSid: "CA004", direction: "outbound", callerPhone: "+351916543210", leadNome: "Ana Rodrigues", status: "no-answer", duration: 0, started_at: "2025-05-07T14:20:00Z", transcricao: null },
  { id: "5", callSid: "CA005", direction: "inbound", callerPhone: "+351925678901", leadNome: "Pedro Alves", status: "completed", duration: 198, started_at: "2025-05-06T11:00:00Z", transcricao: "Agente: Olá! Propzy, bom dia. Em que posso ajudar?\nCliente: Preciso de um espaço comercial para arrendar em Lisboa.\nAgente: Claro! Que zona prefere?\nCliente: Perto do Marquês de Pombal.\nAgente: E qual seria o orçamento mensal?\nCliente: Até 2.500€ por mês." },
  { id: "6", callSid: "CA006", direction: "outbound", callerPhone: "+351963456789", leadNome: "Rui Costa", status: "failed", duration: 0, started_at: "2025-05-05T15:10:00Z", transcricao: null },
];

export const mockCampaigns = [
  {
    id: "1",
    nome: "Listagem T2 Lisboa — Maio 2025",
    total: 25,
    queued: 0,
    completed: 18,
    failed: 3,
    noAnswer: 4,
    status: "completed",
    createdAt: "2025-05-07T08:00:00Z",
    entries: [
      { id: "e1", telefone: "+351912345678", nome: "João Silva", status: "completed", listingData: { tipologia: "T2", morada: "Lisboa", preco: "320.000€" } },
      { id: "e2", telefone: "+351961234567", nome: "Maria Santos", status: "completed", listingData: { tipologia: "T2", morada: "Lisboa", preco: "320.000€" } },
      { id: "e3", telefone: "+351932345678", nome: "Carlos Ferreira", status: "no-answer", listingData: { tipologia: "T2", morada: "Lisboa", preco: "320.000€" } },
      { id: "e4", telefone: "+351916543210", nome: "Ana Rodrigues", status: "failed", listingData: { tipologia: "T2", morada: "Lisboa", preco: "320.000€" } },
    ],
  },
  {
    id: "2",
    nome: "Moradias Cascais — Prospeção",
    total: 12,
    queued: 5,
    completed: 6,
    failed: 1,
    noAnswer: 0,
    status: "running",
    createdAt: "2025-05-08T07:30:00Z",
    entries: [
      { id: "e5", telefone: "+351925678901", nome: "Pedro Alves", status: "completed", listingData: { tipologia: "T4", morada: "Cascais", preco: "650.000€" } },
      { id: "e6", telefone: "+351934567890", nome: "Sofia Mendes", status: "pending", listingData: { tipologia: "T4", morada: "Cascais", preco: "650.000€" } },
    ],
  },
];

export const mockPrompts = {
  inbound: {
    tipo: "inbound",
    greeting: "Olá, obrigado por contactar a Propzy! Sou a assistente virtual. Em que posso ajudá-lo hoje?",
    systemPrompt: `És um assistente de atendimento telefónico da Propzy, uma agência imobiliária portuguesa.

REGRAS OBRIGATÓRIAS:
- Fala SEMPRE em Português de Portugal (usa "tu" informal ou "você" formal conforme o tom do cliente)
- Nunca uses expressões brasileiras
- Sê natural, simpático e profissional — não pareças um robot a ler um formulário
- Respostas curtas e diretas — estás numa chamada de voz (máximo 2-3 frases por resposta)
- Extrai informação de forma conversacional, nunca como um inquérito
- Se o cliente já deu uma informação, não voltes a perguntar

OBJETIVO:
Qualificar o lead imobiliário recolhendo:
1. Intenção (comprar ou arrendar)
2. Tipo de imóvel (apartamento, moradia, terreno, comercial)
3. Zona/localização pretendida
4. Orçamento
5. Prazo (quando precisam)
6. Nome e contacto`,
    updatedAt: "2025-05-06T10:00:00Z",
  },
  outbound: {
    tipo: "outbound",
    greeting: "Bom dia! Fala com a assistente da Propzy. Estou a ligar sobre um imóvel que pode ser do seu interesse. Tem um momento?",
    systemPrompt: `És um consultor de vendas da Propzy que está a fazer uma chamada de prospeção.

REGRAS OBRIGATÓRIAS:
- Fala SEMPRE em Português de Portugal
- Sê breve, natural e respeitoso — o cliente não estava à espera desta chamada
- Respostas curtas (máximo 2-3 frases)
- Se o cliente não tiver interesse, agradece e despede-te imediatamente sem insistir

OBJETIVO:
1. Apresentares-te e mencionares o imóvel
2. Verificar se o cliente tem interesse
3. Se houver interesse: qualificar (zona, orçamento, prazo)
4. Marcar uma visita ou informar que um consultor entrará em contacto`,
    updatedAt: "2025-05-07T14:30:00Z",
  },
};
