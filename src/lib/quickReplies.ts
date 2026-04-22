export interface QuickReply {
  id: string;
  label: string;
  text: string;
  /** Tecla única (a-z, 0-9) para o atalho Alt+<tecla>. Vazio = sem atalho. */
  shortcut: string;
}

const STORAGE_KEY = "avance:quick-replies:v1";

export const DEFAULT_QUICK_REPLIES: QuickReply[] = [
  { id: "qr-1", label: "👋 Saudação", text: "Olá! Sou da equipe Avance Modas. Estou à disposição para ajudar com sua devolução.", shortcut: "1" },
  { id: "qr-2", label: "📦 Solicitar postagem", text: "Para darmos sequência, por favor poste o produto nos Correios e nos envie o código de rastreio aqui no chat.", shortcut: "2" },
  { id: "qr-3", label: "🔍 Recebido — em análise", text: "Recebemos seu produto no nosso CD e ele já está em análise pela equipe de qualidade. Em breve retornamos.", shortcut: "3" },
  { id: "qr-4", label: "✅ Aprovado — vale-compras", text: "Sua devolução foi aprovada! Em até 2 dias úteis enviaremos um vale-compras no valor integral por e-mail.", shortcut: "4" },
  { id: "qr-5", label: "💳 Aprovado — reembolso", text: "Sua devolução foi aprovada! O estorno será feito no mesmo cartão/Pix em até 7 dias úteis.", shortcut: "5" },
  { id: "qr-6", label: "🔁 Aprovado — troca", text: "Sua troca foi aprovada! Já estamos separando o novo produto e enviaremos o código de rastreio em breve.", shortcut: "6" },
  { id: "qr-7", label: "❓ Pedir mais fotos", text: "Para avançarmos, poderia nos enviar fotos adicionais do produto, mostrando a etiqueta e o ponto do problema?", shortcut: "7" },
  { id: "qr-8", label: "🙏 Encerramento", text: "Caso surja qualquer dúvida, estamos aqui. Obrigado pela paciência e pela confiança na Avance Modas!", shortcut: "8" },
];

export const loadQuickReplies = (): QuickReply[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_QUICK_REPLIES;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_QUICK_REPLIES;
    return parsed.filter((q) => q && typeof q.text === "string");
  } catch {
    return DEFAULT_QUICK_REPLIES;
  }
};

export const saveQuickReplies = (list: QuickReply[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent("quick-replies:changed"));
};

export const normalizeShortcut = (key: string) => key.trim().slice(0, 1).toLowerCase();
