import { CallState, LeadData, QualificationStage } from "../types/index.js";

export function detectStageFromLead(lead: LeadData): QualificationStage {
  if (!lead.intencao) return "interest";
  if (!lead.tipoImovel) return "property_type";
  if (!lead.zona) return "location";
  if (!lead.orcamento) return "budget";
  if (!lead.prazo) return "timeline";
  if (!lead.nome) return "contact";
  return "closing";
}

export function isLeadQualified(lead: LeadData): boolean {
  return !!(lead.intencao && lead.tipoImovel && lead.zona && lead.orcamento);
}

export function buildContextSummary(state: CallState): string {
  const { lead, listingData } = state;
  const parts: string[] = [];

  if (listingData) {
    const listing = [listingData.tipologia, listingData.morada, listingData.preco]
      .filter(Boolean)
      .join(" | ");
    if (listing) parts.push(`Imóvel em apresentação: ${listing}`);
  }

  if (lead.nome) parts.push(`Nome: ${lead.nome}`);
  if (lead.intencao) parts.push(`Intenção: ${lead.intencao}`);
  if (lead.tipoImovel) parts.push(`Tipo de imóvel: ${lead.tipoImovel}`);
  if (lead.zona) parts.push(`Zona: ${lead.zona}`);
  if (lead.orcamento) parts.push(`Orçamento: ${lead.orcamento}`);
  if (lead.prazo) parts.push(`Prazo: ${lead.prazo}`);
  return parts.length > 0 ? `\n\n[Contexto: ${parts.join(" | ")}]` : "";
}

export function mergeLeadData(existing: LeadData, extracted: Partial<LeadData>): LeadData {
  return {
    ...existing,
    ...Object.fromEntries(
      Object.entries(extracted).filter(([, v]) => v != null && v !== "null")
    ),
  };
}
