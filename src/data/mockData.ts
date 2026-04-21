export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  size?: string;
  color?: string;
  sku: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerCpf: string;
  date: string;
  products: Product[];
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  date: string;
  status: "pending" | "awaiting_shipment" | "received" | "completed" | "rejected";
  type: "exchange" | "return";
  resolution: "refund" | "voucher" | "exchange";
  products: (Product & { reason: string; notes?: string })[];
  trackingCode?: string;
}

export const mockOrders: Order[] = [
  {
    id: "AVN-20241201",
    customerName: "Maria Silva",
    customerEmail: "maria@email.com",
    customerCpf: "123.456.789-00",
    date: "2024-12-01",
    products: [
      { id: "p1", name: "Legging Fitness Premium", price: 129.90, image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=200&h=200&fit=crop", size: "M", color: "Preto", sku: "LEG-001" },
      { id: "p2", name: "Top Esportivo Dry Fit", price: 79.90, image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop", size: "P", color: "Rosa", sku: "TOP-002" },
      { id: "p3", name: "Shorts Running Ultralight", price: 89.90, image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&h=200&fit=crop", size: "G", color: "Azul", sku: "SHT-003" },
    ],
  },
  {
    id: "AVN-20241205",
    customerName: "João Santos",
    customerEmail: "joao@email.com",
    customerCpf: "987.654.321-00",
    date: "2024-12-05",
    products: [
      { id: "p4", name: "Conjunto Yoga Flow", price: 199.90, image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=200&h=200&fit=crop", size: "M", color: "Cinza", sku: "CYF-004" },
      { id: "p5", name: "Jaqueta Corta-Vento", price: 249.90, image: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=200&h=200&fit=crop", size: "G", color: "Preto", sku: "JCV-005" },
    ],
  },
];

export const mockReturnRequests: ReturnRequest[] = [
  {
    id: "TRK-001",
    orderId: "AVN-20241201",
    customerName: "Maria Silva",
    customerEmail: "maria@email.com",
    date: "2024-12-10",
    status: "pending",
    type: "exchange",
    resolution: "exchange",
    products: [
      { id: "p1", name: "Legging Fitness Premium", price: 129.90, image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=200&h=200&fit=crop", size: "M", color: "Preto", sku: "LEG-001", reason: "wrong_size", notes: "Preciso de um tamanho G" },
    ],
    trackingCode: "BR123456789BR",
  },
  {
    id: "TRK-002",
    orderId: "AVN-20241205",
    customerName: "João Santos",
    customerEmail: "joao@email.com",
    date: "2024-12-12",
    status: "awaiting_shipment",
    type: "return",
    resolution: "refund",
    products: [
      { id: "p5", name: "Jaqueta Corta-Vento", price: 249.90, image: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=200&h=200&fit=crop", size: "G", color: "Preto", sku: "JCV-005", reason: "defect", notes: "Zíper com defeito" },
    ],
    trackingCode: "BR987654321BR",
  },
  {
    id: "TRK-003",
    orderId: "AVN-20241201",
    customerName: "Maria Silva",
    customerEmail: "maria@email.com",
    date: "2024-12-14",
    status: "received",
    type: "return",
    resolution: "voucher",
    products: [
      { id: "p2", name: "Top Esportivo Dry Fit", price: 79.90, image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop", size: "P", color: "Rosa", sku: "TOP-002", reason: "regret" },
    ],
  },
  {
    id: "TRK-004",
    orderId: "AVN-20241205",
    customerName: "João Santos",
    customerEmail: "joao@email.com",
    date: "2024-12-15",
    status: "completed",
    type: "exchange",
    resolution: "exchange",
    products: [
      { id: "p4", name: "Conjunto Yoga Flow", price: 199.90, image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=200&h=200&fit=crop", size: "M", color: "Cinza", sku: "CYF-004", reason: "wrong_size", notes: "Quero tamanho P" },
    ],
    trackingCode: "BR111222333BR",
  },
  {
    id: "TRK-005",
    orderId: "AVN-20241201",
    customerName: "Ana Costa",
    customerEmail: "ana@email.com",
    date: "2024-12-18",
    status: "pending",
    type: "return",
    resolution: "refund",
    products: [
      { id: "p3", name: "Shorts Running Ultralight", price: 89.90, image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&h=200&fit=crop", size: "G", color: "Azul", sku: "SHT-003", reason: "other", notes: "Não era o que eu esperava" },
    ],
  },
];

export const returnReasons = [
  { value: "defect", label: "Defeito no produto" },
  { value: "wrong_size", label: "Tamanho errado" },
  { value: "regret", label: "Arrependimento" },
  { value: "other", label: "Outro" },
];

export const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendente", color: "bg-warning/10 text-warning" },
  awaiting_shipment: { label: "Aguardando Postagem", color: "bg-info/10 text-info" },
  received: { label: "Recebido no CD", color: "bg-primary/10 text-primary" },
  completed: { label: "Concluído", color: "bg-success/10 text-success" },
  rejected: { label: "Rejeitado", color: "bg-destructive/10 text-destructive" },
};

// Labels exibidos no painel do cliente — mais explícitos sobre o fluxo de análise
export const customerStatusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: "Em análise", color: "bg-warning/10 text-warning" },
  awaiting_shipment: { label: "Aguardando Postagem", color: "bg-info/10 text-info" },
  received: { label: "Procedente — chat liberado", color: "bg-success/10 text-success" },
  completed: { label: "Concluído", color: "bg-success/10 text-success" },
  rejected: { label: "Improcedente — cancelada", color: "bg-destructive/10 text-destructive" },
};

export const resolutionLabels: Record<string, string> = {
  refund: "Reembolso",
  voucher: "Vale-compras",
  exchange: "Troca",
};
