import { useState } from "react";
import { Upload, ChevronDown, ChevronUp, CheckCircle2, XCircle, AlertCircle, Clock, Play } from "lucide-react";
import { mockCampaigns } from "../data/mock";

const statusEntry: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  completed: { label: "Concluída", cls: "text-emerald-600", icon: <CheckCircle2 size={14} className="text-emerald-500" /> },
  "no-answer": { label: "Sem resposta", cls: "text-amber-600", icon: <AlertCircle size={14} className="text-amber-500" /> },
  failed: { label: "Falhou", cls: "text-red-600", icon: <XCircle size={14} className="text-red-500" /> },
  pending: { label: "Pendente", cls: "text-slate-500", icon: <Clock size={14} className="text-slate-400" /> },
  ringing: { label: "A tocar", cls: "text-blue-600", icon: <Play size={14} className="text-blue-500" /> },
};

function ProgressBar({ value, total, color }: { value: number; total: number; color: string }) {
  return (
    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${total ? (value / total) * 100 : 0}%` }} />
    </div>
  );
}

export default function Campaigns() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Campanhas</h1>
          <p className="text-slate-500 text-sm mt-1">Gestão de chamadas outbound em massa</p>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          <Upload size={15} />
          Nova campanha
        </button>
      </div>

      {/* Upload panel */}
      {showUpload && (
        <div className="bg-white rounded-xl border border-indigo-100 shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-slate-900 mb-4">Nova campanha via CSV</h3>
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-indigo-300 transition-colors cursor-pointer">
            <Upload size={28} className="text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600 font-medium">Arrasta o ficheiro CSV ou clica para selecionar</p>
            <p className="text-xs text-slate-400 mt-1">Formato: <code className="bg-slate-100 px-1 rounded">telefone,morada,preco,tipologia</code></p>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <input
              placeholder="Nome da campanha (ex: T2 Lisboa — Junho 2025)"
              className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button className="bg-indigo-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors">
              Lançar campanha
            </button>
          </div>
        </div>
      )}

      {/* Campaign list */}
      <div className="space-y-4">
        {mockCampaigns.map((campaign) => {
          const isOpen = expanded === campaign.id;
          const taxaAtendimento = campaign.total ? Math.round((campaign.completed / campaign.total) * 100) : 0;

          return (
            <div key={campaign.id} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
              <div
                className="flex items-center gap-5 p-5 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setExpanded(isOpen ? null : campaign.id)}
              >
                <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${campaign.status === "running" ? "bg-emerald-400 animate-pulse" : "bg-slate-300"}`} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-slate-900">{campaign.nome}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${campaign.status === "running" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      {campaign.status === "running" ? "Em curso" : "Concluída"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>{campaign.total} contactos</span>
                    <span className="text-emerald-600 font-medium">{campaign.completed} concluídas</span>
                    <span className="text-amber-600">{campaign.noAnswer} sem resposta</span>
                    <span className="text-red-500">{campaign.failed} falhadas</span>
                    {campaign.queued > 0 && <span className="text-blue-600">{campaign.queued} pendentes</span>}
                  </div>
                </div>

                <div className="w-32 shrink-0">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Atendimento</span>
                    <span className="font-semibold text-slate-900">{taxaAtendimento}%</span>
                  </div>
                  <ProgressBar value={campaign.completed} total={campaign.total} color="bg-emerald-500" />
                </div>

                <div className="text-xs text-slate-400 shrink-0">
                  {new Date(campaign.createdAt).toLocaleDateString("pt-PT")}
                </div>

                {isOpen ? <ChevronUp size={16} className="text-slate-400 shrink-0" /> : <ChevronDown size={16} className="text-slate-400 shrink-0" />}
              </div>

              {isOpen && (
                <div className="border-t border-slate-100">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-slate-500 uppercase tracking-wider bg-slate-50">
                        <th className="text-left px-5 py-2.5">Contacto</th>
                        <th className="text-left px-5 py-2.5">Imóvel</th>
                        <th className="text-left px-5 py-2.5">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {campaign.entries.map((entry) => {
                        const s = statusEntry[entry.status] ?? statusEntry.pending;
                        return (
                          <tr key={entry.id} className="hover:bg-slate-50">
                            <td className="px-5 py-3">
                              <p className="font-medium text-slate-800">{entry.nome}</p>
                              <p className="text-xs text-slate-400 font-mono">{entry.telefone}</p>
                            </td>
                            <td className="px-5 py-3 text-slate-600 text-xs">
                              {[entry.listingData.tipologia, entry.listingData.morada, entry.listingData.preco].filter(Boolean).join(" · ")}
                            </td>
                            <td className="px-5 py-3">
                              <span className={`flex items-center gap-1.5 text-xs font-medium ${s.cls}`}>
                                {s.icon} {s.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
