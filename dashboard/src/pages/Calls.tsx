import { useState } from "react";
import { PhoneIncoming, PhoneOutgoing, PhoneMissed, PhoneOff, ChevronDown, ChevronUp, Clock } from "lucide-react";
import { mockCalls } from "../data/mock";

const statusConfig: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  completed: { label: "Concluída", cls: "bg-emerald-100 text-emerald-700", icon: <span>✓</span> },
  "no-answer": { label: "Sem resposta", cls: "bg-amber-100 text-amber-700", icon: <PhoneMissed size={11} /> },
  failed: { label: "Falhou", cls: "bg-red-100 text-red-700", icon: <PhoneOff size={11} /> },
  in_progress: { label: "Em curso", cls: "bg-blue-100 text-blue-700", icon: <span className="animate-pulse">●</span> },
};

function formatDuration(seconds: number) {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function Calls() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filterDir, setFilterDir] = useState("todos");

  const filtered = mockCalls.filter((c) => filterDir === "todos" || c.direction === filterDir);

  const totalDuration = mockCalls.reduce((s, c) => s + c.duration, 0);
  const completed = mockCalls.filter((c) => c.status === "completed");

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Chamadas</h1>
        <p className="text-slate-500 text-sm mt-1">Histórico completo com transcrições</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <p className="text-sm text-slate-500 font-medium">Total chamadas</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{mockCalls.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <p className="text-sm text-slate-500 font-medium">Concluídas</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">{completed.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <p className="text-sm text-slate-500 font-medium">Duração média</p>
          <p className="text-3xl font-bold text-indigo-600 mt-1">{formatDuration(Math.round(totalDuration / (completed.length || 1)))}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <p className="text-sm text-slate-500 font-medium">Taxa de atendimento</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{Math.round((completed.length / mockCalls.length) * 100)}%</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 p-4 border-b border-slate-100">
          <span className="text-sm text-slate-500 font-medium">Direção:</span>
          {["todos", "inbound", "outbound"].map((d) => (
            <button
              key={d}
              onClick={() => setFilterDir(d)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterDir === d ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
            >
              {d === "todos" ? "Todas" : d === "inbound" ? "Inbound" : "Outbound"}
            </button>
          ))}
        </div>

        <div className="divide-y divide-slate-50">
          {filtered.map((call) => {
            const s = statusConfig[call.status] ?? statusConfig.completed;
            const isOpen = expanded === call.id;
            return (
              <div key={call.id}>
                <div
                  className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => setExpanded(isOpen ? null : call.id)}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${call.direction === "inbound" ? "bg-sky-100" : "bg-orange-100"}`}>
                    {call.direction === "inbound"
                      ? <PhoneIncoming size={16} className="text-sky-600" />
                      : <PhoneOutgoing size={16} className="text-orange-600" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900 text-sm">{call.leadNome ?? call.callerPhone}</p>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${s.cls}`}>
                        {s.icon} {s.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 font-mono">{call.callerPhone}</p>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-400 shrink-0">
                    <span className="flex items-center gap-1"><Clock size={11} /> {formatDuration(call.duration)}</span>
                    <span>{new Date(call.started_at).toLocaleDateString("pt-PT")} {new Date(call.started_at).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}</span>
                    {call.transcricao ? (isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <span className="w-3.5" />}
                  </div>
                </div>

                {isOpen && call.transcricao && (
                  <div className="px-5 pb-4">
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Transcrição</p>
                      <div className="space-y-2">
                        {call.transcricao.split("\n").map((line, i) => {
                          const isAgent = line.startsWith("Agente:");
                          return (
                            <div key={i} className={`flex gap-2 ${isAgent ? "flex-row" : "flex-row-reverse"}`}>
                              <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${isAgent ? "bg-indigo-100 text-indigo-600" : "bg-slate-200 text-slate-600"}`}>
                                {isAgent ? "A" : "C"}
                              </div>
                              <div className={`max-w-[75%] rounded-lg px-3 py-2 text-xs ${isAgent ? "bg-indigo-600 text-white" : "bg-white border border-slate-200 text-slate-700"}`}>
                                {line.replace(/^(Agente|Cliente): /, "")}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
