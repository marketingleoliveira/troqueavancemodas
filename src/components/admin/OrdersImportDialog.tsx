import { useState, useRef } from "react";
import Papa from "papaparse";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onImported?: () => void;
}

interface ParsedOrder {
  order_number: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  total: number;
  subtotal: number | null;
  shipping: number | null;
  financial_status: string | null;
  fulfillment_status: string | null;
  order_date: string | null;
  items: { product_name: string; product_sku: string | null; variant: string | null; quantity: number; price: number }[];
}

const num = (v: unknown): number => {
  if (v == null || v === "") return 0;
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

const str = (v: unknown): string | null => {
  if (v == null) return null;
  const s = String(v).trim();
  return s.length > 0 ? s : null;
};

const parseShopifyCSV = (rows: Record<string, string>[]): ParsedOrder[] => {
  const map = new Map<string, ParsedOrder>();
  for (const r of rows) {
    const orderNumber = str(r["Name"]);
    if (!orderNumber) continue;
    let order = map.get(orderNumber);
    if (!order) {
      order = {
        order_number: orderNumber,
        customer_name: str(r["Billing Name"]) ?? str(r["Shipping Name"]),
        customer_email: str(r["Email"]),
        customer_phone: str(r["Billing Phone"]) ?? str(r["Shipping Phone"]) ?? str(r["Phone"]),
        total: num(r["Total"]),
        subtotal: num(r["Subtotal"]) || null,
        shipping: num(r["Shipping"]) || null,
        financial_status: str(r["Financial Status"]),
        fulfillment_status: str(r["Fulfillment Status"]),
        order_date: str(r["Created at"]) ?? str(r["Paid at"]),
        items: [],
      };
      map.set(orderNumber, order);
    }
    // Some lines only have line items (continuation rows)
    if (!order.customer_name) order.customer_name = str(r["Billing Name"]) ?? str(r["Shipping Name"]);
    if (!order.customer_phone) order.customer_phone = str(r["Billing Phone"]) ?? str(r["Shipping Phone"]) ?? str(r["Phone"]);

    const itemName = str(r["Lineitem name"]);
    if (itemName) {
      const [base, variant] = itemName.split(" - ");
      order.items.push({
        product_name: base ?? itemName,
        product_sku: str(r["Lineitem sku"]),
        variant: variant ?? null,
        quantity: Math.max(1, Math.floor(num(r["Lineitem quantity"]) || 1)),
        price: num(r["Lineitem price"]),
      });
    }
  }
  return Array.from(map.values());
};

export const OrdersImportDialog = ({ open, onOpenChange, onImported }: Props) => {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ inserted: number; skipped: number; errors: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setFile(null);
    setProgress(0);
    setImporting(false);
    setResult(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleFile = (f: File | null) => {
    setResult(null);
    setFile(f);
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    setProgress(5);

    try {
      const text = await file.text();
      const parsed = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: true });
      if (parsed.errors.length > 0) {
        console.warn("CSV parse warnings", parsed.errors);
      }
      setProgress(25);

      const orders = parseShopifyCSV(parsed.data);
      if (orders.length === 0) {
        toast.error("Nenhum pedido válido encontrado no CSV.");
        setImporting(false);
        return;
      }

      let inserted = 0;
      let skipped = 0;
      let errors = 0;

      // Check existing
      const numbers = orders.map((o) => o.order_number);
      const { data: existing } = await supabase.from("orders").select("order_number").in("order_number", numbers);
      const existingSet = new Set((existing ?? []).map((e) => e.order_number));

      const toInsert = orders.filter((o) => !existingSet.has(o.order_number));
      skipped = orders.length - toInsert.length;
      setProgress(40);

      // Insert in batches
      const batchSize = 50;
      for (let i = 0; i < toInsert.length; i += batchSize) {
        const batch = toInsert.slice(i, i + batchSize);
        const { data: insertedRows, error } = await supabase
          .from("orders")
          .insert(
            batch.map((o) => ({
              order_number: o.order_number,
              customer_name: o.customer_name,
              customer_email: o.customer_email,
              customer_phone: o.customer_phone,
              total: o.total,
              subtotal: o.subtotal,
              shipping: o.shipping,
              financial_status: o.financial_status,
              fulfillment_status: o.fulfillment_status,
              order_date: o.order_date,
            })),
          )
          .select("id, order_number");

        if (error || !insertedRows) {
          console.error(error);
          errors += batch.length;
          continue;
        }
        inserted += insertedRows.length;

        // Insert items
        const itemsPayload = insertedRows.flatMap((row) => {
          const orig = batch.find((o) => o.order_number === row.order_number);
          return (orig?.items ?? []).map((it) => ({ ...it, order_id: row.id }));
        });
        if (itemsPayload.length > 0) {
          const { error: itErr } = await supabase.from("order_items").insert(itemsPayload);
          if (itErr) console.error("items error", itErr);
        }

        setProgress(40 + Math.floor(((i + batch.length) / toInsert.length) * 55));
      }

      setProgress(100);
      setResult({ inserted, skipped, errors });
      if (inserted > 0) toast.success(`${inserted} pedido(s) importado(s)!`);
      if (skipped > 0) toast.info(`${skipped} pedido(s) já existentes foram ignorados.`);
      onImported?.();
    } catch (e) {
      console.error(e);
      toast.error("Erro ao processar o CSV.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!importing) {
          if (!v) reset();
          onOpenChange(v);
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Importar Pedidos (CSV)</DialogTitle>
          <DialogDescription>
            Faça upload do export de pedidos do Shopify. Pedidos com número já cadastrado serão ignorados.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <label
            htmlFor="csv-input"
            className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg p-6 cursor-pointer hover:bg-muted/50 transition-colors"
          >
            {file ? (
              <>
                <FileSpreadsheet className="w-8 h-8 text-primary" />
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm font-medium">Clique para selecionar o CSV</p>
                <p className="text-xs text-muted-foreground">Formato Shopify export</p>
              </>
            )}
            <input
              id="csv-input"
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              disabled={importing}
            />
          </label>

          {importing && <Progress value={progress} className="h-2" />}

          {result && (
            <div className="rounded-lg border border-border p-3 space-y-1 text-sm">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="w-4 h-4" /> {result.inserted} importados
              </div>
              {result.skipped > 0 && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <AlertCircle className="w-4 h-4" /> {result.skipped} ignorados (já existentes)
                </div>
              )}
              {result.errors > 0 && (
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="w-4 h-4" /> {result.errors} com erro
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={importing}>
            {result ? "Fechar" : "Cancelar"}
          </Button>
          {!result && (
            <Button onClick={handleImport} disabled={!file || importing}>
              {importing ? "Importando..." : "Importar"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
