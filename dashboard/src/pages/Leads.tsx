import { useState } from "react";
import { Search, Download, Filter, TrendingUp, Users, PhoneIncoming, PhoneOutgoing } from "lucide-react";
import { mockLeads } from "../data/mock";

const intentBadge: Record<string, string> = {
  compra: "bg-emerald-100 text-emerald-700",
  arrendamento: "bg-blue-100 text-blue-700",
  ambos: "bg-purple-100 text-purple-700",
};

const fonteBadge: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  chamada_inbound: { label: "Inbound", cls: "bg-sky-100 text-sky-700", icon: <PhoneIncoming size={11} /> },
  chamada_outbound: { label: "Outbound", cls: "bg-orange-100 text-orange-700", icon: <PhoneOutgoing size={11} /> },
};

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
      <p className="text-sm text-slate-500 font-medium">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function Leads() {
  const [search, setSearch] = useState("");
  const [filterIntencao, setFilterIntencao] = useState("todos");
  const [filterFonte, setFilterFonte] = useState("todos");

  const filtered = mockLeads.filter((l) => {
    const q = search.toLowerCase();
    const matchSearch = !q || l.nome.toLowerCase().includes(q) || l.telefone.includes(q) || l.zona.toLowerCase().includes(q);
    const matchIntencao = filterIntencao === "todos" || l.intencao === filterIntencao;
    const matchFonte = filterFonte === "todos" || l.fonte === filterFonte;
    return matchSearch && matchIntencao && matchFonte;
  });

  const qualificados = mockLeads.filter((l) => l.intencao && l.tipoImovel && l.zona && l.orcamento).length;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Leads</h1>
        <p className="text-slate-500 text-sm mt-1">Gestão de contactos qualificados pelo agente de voz</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Total de leads" value={mockLeads.length} sub="todos os registos" color="text-slate-900" />
        <StatCard label="Qualificados" value={qualificados} sub={`${Math.round((qualificados / mockLeads.length) * 100)}% de conversão`} color="text-emerald-600" />
        <StatCard label="Inbound" value={mockLeads.filter((l) => l.fonte === "chamada_inbound").length} sub="chamadas recebidas" color="text-sky-600" />
        <StatCard label="Outbound" value={mockLeads.filter((l) => l.fonte === "chamada_outbound").length} sub="prospeção ativa" color="text-orange-600" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 p-4 border-b border-slate-100">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar por nome, telefone ou zona..."
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />
            <select value={filterIntencao} onChange={(e) => setFilterIntencao(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="todos">Todas as intenções</option>
              <option value="compra">Compra</option>
              <option value="arrendamento">Arrendamento</option>
            </select>
            <select value={filterFonte} onChange={(e) => setFilterFonte(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="todos">Todas as fontes</option>
              <option value="chamada_inbound">Inbound</option>
              <option value="chamada_outbound">Outbound</option>
            </select>
          </div>

          <button className="flex items-center gap-1.5 text-sm text-slate-600 border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors ml-auto">
            <Download size={14} />
            Exportar CSV
          </button>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-500 font-medium uppercase tracking-wider border-b border-slate-100">
              <th className="text-left px-5 py-3">Nome</th>
              <th className="text-left px-5 py-3">Telefone</th>
              <th className="text-left px-5 py-3">Intenção</th>
              <th className="text-left px-5 py-3">Imóvel</th>
              <th className="text-left px-5 py-3">Zona</th>
              <th className="text-left px-5 py-3">Orçamento</th>
              <th className="text-left px-5 py-3">Fonte</th>
              <th className="text-left px-5 py-3">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map((lead) => {
              const f = fonteBadge[lead.fonte];
              return (
                <tr key={lead.id} className="hover:bg-slate-50 transition-colors cursor-pointer">
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="font-medium text-slate-900">{lead.nome}</p>
                      {lead.email && <p className="text-xs text-slate-400">{lead.email}</p>}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 font-mono text-xs">{lead.telefone}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${intentBadge[lead.intencao] ?? ""}`}>
                      {lead.intencao}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 capitalize">{lead.tipoImovel}</td>
                  <td className="px-5 py-3.5 text-slate-600">{lead.zona}</td>
                  <td className="px-5 py-3.5 font-medium text-slate-800">{lead.orcamento}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${f.cls}`}>
                      {f.icon} {f.label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 text-xs">
                    {new Date(lead.createdAt).toLocaleDateString("pt-PT")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400">
          {filtered.length} de {mockLeads.length} leads
        </div>
      </div>
    </div>
  );
}
