import { LeadData } from "../types/index.js";

export interface CrmLead {
  id?: string;
  telefone: string;
  nome?: string;
  email?: string;
  intencao?: string;
  tipoImovel?: string;
  zona?: string;
  orcamento?: string;
  prazo?: string;
  observacoes?: string;
  fonte: "chamada_inbound" | "chamada_outbound";
  dataContacto: string;
  transcricao?: string;
}

export async function createLead(lead: LeadData, telefone: string, transcricao?: string): Promise<string | null> {
  const crmUrl = process.env.CRM_API_URL;
  const crmKey = process.env.CRM_API_KEY;

  if (!crmUrl || !crmKey) {
    console.warn("[CRM] Variáveis de ambiente não configuradas. Lead não enviado.");
    console.log("[CRM] Lead data:", { ...lead, telefone });
    return null;
  }

  const payload: CrmLead = {
    telefone,
    nome: lead.nome,
    email: lead.email,
    intencao: lead.intencao,
    tipoImovel: lead.tipoImovel,
    zona: lead.zona,
    orcamento: lead.orcamento,
    prazo: lead.prazo,
    observacoes: lead.observacoes,
    fonte: "chamada_inbound",
    dataContacto: new Date().toISOString(),
    transcricao,
  };

  try {
    const res = await fetch(`${crmUrl}/leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${crmKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error("[CRM] Erro ao criar lead:", res.status, await res.text());
      return null;
    }

    const data = (await res.json()) as { id: string };
    console.log("[CRM] Lead criado com ID:", data.id);
    return data.id;
  } catch (err) {
    console.error("[CRM] Falha na ligação ao CRM:", err);
    return null;
  }
}
