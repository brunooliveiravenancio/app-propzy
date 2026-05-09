import { useState } from "react";
import { Save, RotateCcw, PhoneIncoming, PhoneOutgoing, Sparkles, CheckCircle2 } from "lucide-react";
import { mockPrompts } from "../data/mock";

type PromptType = "inbound" | "outbound";

export default function Prompts() {
  const [activeTab, setActiveTab] = useState<PromptType>("inbound");
  const [prompts, setPrompts] = useState(mockPrompts);
  const [saved, setSaved] = useState(false);

  const current = prompts[activeTab];

  const update = (field: "systemPrompt" | "greeting", value: string) => {
    setPrompts((p) => ({ ...p, [activeTab]: { ...p[activeTab], [field]: value } }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setPrompts(mockPrompts);
    setSaved(false);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Editor de Prompts</h1>
          <p className="text-slate-500 text-sm mt-1">Personalize o comportamento do agente de voz sem tocar no código</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleReset} className="flex items-center gap-1.5 text-sm text-slate-600 border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors">
            <RotateCcw size={14} />
            Repor original
          </button>
          <button onClick={handleSave} className={`flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg transition-colors ${saved ? "bg-emerald-500 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white"}`}>
            {saved ? <CheckCircle2 size={14} /> : <Save size={14} />}
            {saved ? "Guardado!" : "Guardar alterações"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(["inbound", "outbound"] as PromptType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tab ? "bg-indigo-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}
          >
            {tab === "inbound" ? <PhoneIncoming size={15} /> : <PhoneOutgoing size={15} />}
            {tab === "inbound" ? "Chamadas Recebidas" : "Chamadas Outbound"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Editor */}
        <div className="space-y-5">
          {/* Greeting */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-xs font-bold text-indigo-600">1</span>
              </div>
              <h3 className="font-semibold text-slate-900 text-sm">Saudação inicial</h3>
            </div>
            <p className="text-xs text-slate-500 mb-3">Primeira frase que o bot diz ao atender/ligar</p>
            <textarea
              value={current.greeting}
              onChange={(e) => update("greeting", e.target.value)}
              rows={3}
              className="w-full text-sm border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* System prompt */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-xs font-bold text-indigo-600">2</span>
              </div>
              <h3 className="font-semibold text-slate-900 text-sm">Prompt do sistema</h3>
            </div>
            <p className="text-xs text-slate-500 mb-3">Instruções completas de comportamento, tom e objetivo do agente</p>
            <textarea
              value={current.systemPrompt}
              onChange={(e) => update("systemPrompt", e.target.value)}
              rows={16}
              className="w-full text-sm border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono text-slate-700 leading-relaxed"
            />
          </div>
        </div>

        {/* Preview + Tips */}
        <div className="space-y-5">
          {/* Preview */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={15} className="text-indigo-500" />
              <h3 className="font-semibold text-slate-900 text-sm">Pré-visualização da conversa</h3>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 space-y-3 min-h-[180px]">
              {/* Bot message */}
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">A</div>
                <div className="bg-indigo-600 text-white text-sm rounded-2xl rounded-tl-sm px-3.5 py-2.5 max-w-[80%]">
                  {current.greeting || "Saudação em branco..."}
                </div>
              </div>
              {/* Client response example */}
              <div className="flex gap-2 flex-row-reverse">
                <div className="w-7 h-7 rounded-full bg-slate-300 flex items-center justify-center text-slate-600 text-xs font-bold shrink-0">C</div>
                <div className="bg-white border border-slate-200 text-slate-700 text-sm rounded-2xl rounded-tr-sm px-3.5 py-2.5 max-w-[80%]">
                  Sim, estou à procura de um apartamento para comprar em Lisboa.
                </div>
              </div>
              {/* Bot follow-up */}
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">A</div>
                <div className="bg-indigo-600 text-white text-sm rounded-2xl rounded-tl-sm px-3.5 py-2.5 max-w-[80%]">
                  Ótimo! Tem alguma zona específica em Lisboa em mente?
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3 text-center">Pré-visualização simulada com dados de exemplo</p>
          </div>

          {/* Tips */}
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
            <h3 className="font-semibold text-amber-900 text-sm mb-3">💡 Dicas de boas práticas</h3>
            <ul className="space-y-2 text-xs text-amber-800">
              <li>• Mantém as instruções em português de Portugal — o bot replica o tom</li>
              <li>• Limita respostas a 2-3 frases — chamada de voz, não chat</li>
              <li>• Define claramente o OBJETIVO e o FLUXO de qualificação</li>
              <li>• No outbound, instrui o bot a respeitar "não tenho interesse" imediatamente</li>
              <li>• Usa maiúsculas para secções (REGRAS, OBJETIVO) — facilita a leitura pelo modelo</li>
            </ul>
          </div>

          {/* Last updated */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
            <p className="text-xs text-slate-500">
              <span className="font-medium text-slate-700">Última atualização:</span>{" "}
              {new Date(current.updatedAt).toLocaleString("pt-PT")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
