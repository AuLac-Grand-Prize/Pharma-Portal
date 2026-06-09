"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Banknote,
  Barcode,
  Check,
  CreditCard,
  Loader2,
  Minus,
  Phone,
  Plus,
  Printer,
  Receipt as ReceiptIcon,
  ScanLine,
  Search,
  ShoppingCart,
  Smartphone,
  Trash2,
  User,
  X,
} from "lucide-react";
import {
  AlertDialog,
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  Input,
  Modal,
  SeverityPill,
  useToast,
} from "@/components/ui";
import { Receipt } from "@/components/Receipt";
import { formatVND, cn } from "@/lib/utils";
import type { CartLine, Drug, InteractionAlert, Patient } from "@/types/domain";

const CATALOG: Drug[] = [
  {
    id: "d1",
    innName: "Paracetamol 500mg",
    brandNames: ["Panadol"],
    unitPriceVnd: 2500,
    stock: 320,
  },
  {
    id: "d2",
    innName: "Amoxicillin 500mg",
    brandNames: ["Augmentin"],
    unitPriceVnd: 8500,
    stock: 60,
  },
  { id: "d3", innName: "Loratadin 10mg", brandNames: ["Clarityne"], unitPriceVnd: 4500, stock: 90 },
  { id: "d4", innName: "Aspirin 81mg", brandNames: ["Aspegic"], unitPriceVnd: 1200, stock: 200 },
  {
    id: "d5",
    innName: "Metformin 850mg",
    brandNames: ["Glucophage"],
    unitPriceVnd: 3200,
    stock: 280,
  },
  { id: "d6", innName: "Amlodipin 5mg", brandNames: ["Norvasc"], unitPriceVnd: 4100, stock: 92 },
];

const BARCODE_MAP: Record<string, string> = {
  "8934567000123": "d1",
  "8934567000124": "d2",
  "8934567000125": "d3",
  "8934567000126": "d4",
  "8934567000127": "d5",
};

const PATIENTS: Patient[] = [
  {
    id: "c1",
    fullName: "Nguyễn Thị Hoa",
    vneIdMasked: "0903***892",
    birthYear: 1962,
    chronicConditions: ["Tăng huyết áp", "Đái tháo đường"],
  },
  {
    id: "c2",
    fullName: "Trần Văn An",
    vneIdMasked: "0982***441",
    birthYear: 1955,
    chronicConditions: ["Tim mạch"],
  },
  {
    id: "c3",
    fullName: "Lê Thị Mai",
    vneIdMasked: "0917***035",
    birthYear: 1988,
    chronicConditions: ["Dị ứng"],
  },
  {
    id: "c4",
    fullName: "Phạm Quang Huy",
    vneIdMasked: "0345***712",
    birthYear: 1979,
    chronicConditions: ["Hen phế quản"],
  },
];

const INTERACTIONS: InteractionAlert[] = [
  {
    drugA: "Aspirin",
    drugB: "Warfarin",
    severity: "high",
    mechanism: "Tăng nguy cơ chảy máu",
    clinicalAdvice: "Theo dõi INR, hạn chế phối hợp",
  },
];

type PaymentMethod = "cash" | "card" | "qr";

export default function POSPage() {
  const router = useRouter();
  const { success, info, error } = useToast();
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [cart, setCart] = useState<CartLine[]>(() => {
    const seed = CATALOG.slice(0, 2);
    return seed.map((drug, i) => ({
      drug,
      qty: i === 0 ? 2 : 1,
      unitPriceVnd: drug.unitPriceVnd,
    }));
  });
  const [customer, setCustomer] = useState<Patient | null>(null);

  const [barcodeOpen, setBarcodeOpen] = useState(false);
  const [customerOpen, setCustomerOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [receipt, setReceipt] = useState<{
    invoiceId: string;
    cart: CartLine[];
    customer: Patient | null;
    subtotal: number;
    vat: number;
    total: number;
    paymentMethod: string;
  } | null>(null);

  const filtered = useMemo(
    () =>
      CATALOG.filter(
        (d) =>
          d.innName.toLowerCase().includes(query.toLowerCase()) ||
          d.brandNames.some((b) => b.toLowerCase().includes(query.toLowerCase())),
      ),
    [query],
  );

  useEffect(() => setActiveIndex(0), [query]);

  // Keyboard shortcut: "/" focuses search, ESC closes modals
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function addToCart(drug: Drug) {
    setCart((prev) => {
      const existing = prev.find((l) => l.drug.id === drug.id);
      if (existing) return prev.map((l) => (l.drug.id === drug.id ? { ...l, qty: l.qty + 1 } : l));
      return [...prev, { drug, qty: 1, unitPriceVnd: drug.unitPriceVnd }];
    });
    success(`Đã thêm ${drug.innName}`);
  }
  function adjust(id: string, delta: number) {
    setCart((prev) =>
      prev
        .map((l) => (l.drug.id === id ? { ...l, qty: Math.max(0, l.qty + delta) } : l))
        .filter((l) => l.qty > 0),
    );
  }
  function remove(id: string) {
    setCart((prev) => prev.filter((l) => l.drug.id !== id));
  }
  function clearCart() {
    setCart([]);
    setCustomer(null);
    info("Đã xóa giỏ hàng");
  }

  function onSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const drug = filtered[activeIndex];
      if (drug) {
        addToCart(drug);
        setQuery("");
      }
    } else if (e.key === "Escape") {
      setQuery("");
    }
  }

  function onBarcodeSubmit(code: string) {
    const drugId = BARCODE_MAP[code.trim()];
    const drug = CATALOG.find((d) => d.id === drugId);
    if (!drug) {
      error("Không tìm thấy mã vạch", `Mã ${code} không có trong danh mục.`);
      return;
    }
    addToCart(drug);
    setBarcodeOpen(false);
  }

  const subtotal = cart.reduce((s, l) => s + l.qty * l.unitPriceVnd, 0);
  const vat = Math.round(subtotal * 0.05);
  const total = subtotal + vat;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-ink">
            <ShoppingCart className="h-6 w-6 text-brand" />
            POS — Bán hàng
          </h1>
          <p className="text-sm text-ink-muted">
            Quét barcode hoặc tìm thuốc · VietDrug AI tự kiểm tra tương tác
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={() => setBarcodeOpen(true)}>
            <Barcode className="h-4 w-4" /> Quét mã vạch
          </Button>
          <Button variant="secondary" onClick={() => router.push("/engines/prescription-vision")}>
            <ScanLine className="h-4 w-4" /> Scan đơn thuốc
          </Button>
          <Button variant="secondary" onClick={() => setCustomerOpen(true)}>
            <User className="h-4 w-4" />
            {customer ? customer.fullName.split(" ").slice(-2).join(" ") : "Chọn khách hàng"}
          </Button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <Input
            ref={searchInputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onSearchKeyDown}
            placeholder='Tìm thuốc hoặc nhập mã vạch... (phím "/" để focus)'
            leftIcon={<Search className="h-4 w-4" />}
            rightSlot={
              query ? (
                <button
                  aria-label="Xóa tìm kiếm"
                  onClick={() => setQuery("")}
                  className="grid h-7 w-7 place-items-center rounded text-ink-subtle hover:bg-surface"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : (
                <kbd className="hidden rounded border border-line bg-surface px-1.5 py-0.5 text-[10px] text-ink-muted md:inline">
                  ↵
                </kbd>
              )
            }
          />

          {filtered.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                title="Không tìm thấy thuốc"
                description={`Không có sản phẩm nào khớp với "${query}". Thử tên thương mại hoặc INN.`}
              />
            </div>
          ) : (
            <ul className="mt-4 space-y-2" role="listbox" aria-label="Kết quả tìm thuốc">
              {filtered.map((d, i) => {
                const lowStock = d.stock <= 20;
                const active = i === activeIndex;
                return (
                  <li
                    key={d.id}
                    role="option"
                    aria-selected={active}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={cn(
                      "flex items-center justify-between rounded-lg border bg-white px-4 py-3 transition-colors",
                      active
                        ? "border-brand ring-2 ring-brand-100"
                        : "border-line hover:border-brand/60",
                    )}
                  >
                    <div>
                      <div className="font-medium text-ink">{d.innName}</div>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-ink-muted">
                        <span>{d.brandNames.join(", ")}</span>
                        {lowStock ? (
                          <Badge tone="warn">Sắp hết · {d.stock}</Badge>
                        ) : (
                          <span>Tồn {d.stock}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-ink">
                        {formatVND(d.unitPriceVnd)}
                      </span>
                      <Button size="sm" onClick={() => addToCart(d)}>
                        <Plus className="h-3.5 w-3.5" /> Thêm
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card padded={false}>
          <div className="border-b border-line p-5">
            <CardHeader
              title="Giỏ hàng"
              subtitle={`${cart.length} thuốc · ${cart.reduce((s, l) => s + l.qty, 0)} đơn vị`}
              action={
                <Badge tone="info">
                  <ReceiptIcon className="mr-1 h-3 w-3" /> Đơn DEMO-2811
                </Badge>
              }
            />
          </div>

          {customer ? (
            <div className="flex items-center gap-3 border-b border-line bg-brand-50/40 px-5 py-3">
              <div className="grid h-9 w-9 place-items-center rounded-pill bg-brand-100 text-sm font-semibold text-brand">
                {customer.fullName
                  .split(" ")
                  .slice(-2)
                  .map((s) => s[0])
                  .join("")}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-ink">{customer.fullName}</div>
                <div className="text-xs text-ink-muted">
                  {customer.vneIdMasked} · Sinh {customer.birthYear}
                </div>
              </div>
              <button
                aria-label="Bỏ chọn khách"
                onClick={() => setCustomer(null)}
                className="rounded p-1 text-ink-subtle hover:bg-white hover:text-danger"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : null}

          <ul className="divide-y divide-line">
            {cart.map((line) => (
              <li key={line.drug.id} className="flex items-center justify-between p-4">
                <div className="flex-1">
                  <div className="font-medium text-ink">{line.drug.innName}</div>
                  <div className="text-xs text-ink-muted">
                    {line.drug.brandNames.join(", ")} · {formatVND(line.unitPriceVnd)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => adjust(line.drug.id, -1)}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-line hover:bg-surface"
                    aria-label="Giảm"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-7 text-center text-sm font-medium">{line.qty}</span>
                  <button
                    onClick={() => adjust(line.drug.id, 1)}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-line hover:bg-surface"
                    aria-label="Tăng"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => remove(line.drug.id)}
                    className="grid h-8 w-8 place-items-center rounded-lg text-ink-subtle hover:bg-red-50 hover:text-danger"
                    aria-label="Xóa"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </li>
            ))}
            {cart.length === 0 && (
              <li className="px-6 py-12 text-center text-sm text-ink-muted">
                Chưa có thuốc · Thêm từ ô tìm bên trái.
              </li>
            )}
          </ul>

          <InteractionPanel alerts={INTERACTIONS} />

          <div className="border-t border-line p-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-muted">Tạm tính</span>
              <span className="text-ink">{formatVND(subtotal)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-sm">
              <span className="text-ink-muted">VAT (5%)</span>
              <span className="text-ink">{formatVND(vat)}</span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
              <span className="text-base font-semibold text-ink">Tổng cộng</span>
              <span className="text-xl font-bold text-brand">{formatVND(total)}</span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                onClick={() => setConfirmClearOpen(true)}
                disabled={cart.length === 0}
              >
                <Trash2 className="h-4 w-4" /> Xóa giỏ
              </Button>
              <Button onClick={() => setCheckoutOpen(true)} disabled={cart.length === 0}>
                <CreditCard className="h-4 w-4" /> Thanh toán
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <BarcodeDialog
        open={barcodeOpen}
        onClose={() => setBarcodeOpen(false)}
        onSubmit={onBarcodeSubmit}
      />
      <CustomerDialog
        open={customerOpen}
        onClose={() => setCustomerOpen(false)}
        onSelect={(p) => {
          setCustomer(p);
          setCustomerOpen(false);
          success(`Đã chọn ${p.fullName}`);
        }}
        selected={customer?.id}
      />
      <CheckoutDialog
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        cart={cart}
        customer={customer}
        subtotal={subtotal}
        vat={vat}
        total={total}
        onConfirm={(method) => {
          setCheckoutOpen(false);
          const label = method === "cash" ? "Tiền mặt" : method === "card" ? "Thẻ" : "QR Code";
          setReceipt({
            invoiceId: `HD-${Date.now().toString().slice(-8)}`,
            cart,
            customer,
            subtotal,
            vat,
            total,
            paymentMethod: label,
          });
          success(`Thanh toán thành công · ${formatVND(total)}`, `Phương thức: ${label}`);
          setCart([]);
          setCustomer(null);
        }}
      />

      <AlertDialog
        open={confirmClearOpen}
        onOpenChange={setConfirmClearOpen}
        tone="danger"
        icon={Trash2}
        title="Xóa toàn bộ giỏ hàng?"
        description="Tất cả thuốc và khách hàng đã chọn sẽ bị xóa khỏi đơn hiện tại."
        confirmLabel="Xóa hết"
        destructive
        onConfirm={clearCart}
      />

      <ReceiptDialog
        receipt={receipt}
        onClose={() => setReceipt(null)}
        onPrint={() => {
          if (typeof window !== "undefined") window.print();
        }}
      />
    </div>
  );
}

interface ReceiptDialogProps {
  receipt: {
    invoiceId: string;
    cart: CartLine[];
    customer: Patient | null;
    subtotal: number;
    vat: number;
    total: number;
    paymentMethod: string;
  } | null;
  onClose: () => void;
  onPrint: () => void;
}

function ReceiptDialog({ receipt, onClose, onPrint }: ReceiptDialogProps) {
  return (
    <Modal
      open={receipt !== null}
      onOpenChange={(o) => (!o ? onClose() : null)}
      title="Hóa đơn"
      description={receipt ? `${receipt.invoiceId} · ${formatVND(receipt.total)}` : ""}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Đóng
          </Button>
          <Button onClick={onPrint}>
            <Printer className="h-4 w-4" /> In hóa đơn
          </Button>
        </>
      }
    >
      {receipt && (
        <div className="rounded-xl border border-line bg-white p-4">
          <Receipt
            invoiceId={receipt.invoiceId}
            cart={receipt.cart}
            customer={receipt.customer}
            subtotal={receipt.subtotal}
            vat={receipt.vat}
            total={receipt.total}
            paymentMethod={receipt.paymentMethod}
          />
        </div>
      )}
    </Modal>
  );
}

function InteractionPanel({ alerts }: { alerts: InteractionAlert[] }) {
  if (alerts.length === 0) return null;
  return (
    <div className="border-t border-line bg-amber-50/40 p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-amber-800">
        <AlertTriangle className="h-4 w-4" />
        VietDrug AI · Cảnh báo tương tác
      </div>
      <ul className="mt-2 space-y-2">
        {alerts.map((a, i) => (
          <li key={i} className="rounded-lg border border-amber-200 bg-white p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium text-ink">
                {a.drugA} × {a.drugB}
              </span>
              <SeverityPill severity={a.severity} />
            </div>
            <p className="mt-1 text-xs text-ink-muted">{a.clinicalAdvice}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface BarcodeDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (code: string) => void;
}

function BarcodeDialog({ open, onClose, onSubmit }: BarcodeDialogProps) {
  const [code, setCode] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setCode("");
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  return (
    <Modal
      open={open}
      onOpenChange={(o) => (!o ? onClose() : null)}
      title="Quét mã vạch"
      description="Quét bằng đầu đọc barcode hoặc nhập mã thủ công"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={() => onSubmit(code)} disabled={!code.trim()}>
            <Check className="h-4 w-4" /> Xác nhận
          </Button>
        </>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (code.trim()) onSubmit(code);
        }}
        className="space-y-3"
      >
        <Input
          ref={inputRef}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="VD: 8934567000123"
          leftIcon={<Barcode className="h-4 w-4" />}
        />
        <p className="text-xs text-ink-muted">
          Đầu đọc barcode sẽ tự động gửi sau khi quét. Mã có sẵn trong demo:{" "}
          <code className="text-brand">8934567000123–127</code>
        </p>
      </form>
    </Modal>
  );
}

interface CustomerDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (p: Patient) => void;
  selected?: string;
}

function CustomerDialog({ open, onClose, onSelect, selected }: CustomerDialogProps) {
  const [q, setQ] = useState("");
  const filtered = PATIENTS.filter(
    (p) => p.fullName.toLowerCase().includes(q.toLowerCase()) || (p.vneIdMasked ?? "").includes(q),
  );

  return (
    <Modal
      open={open}
      onOpenChange={(o) => (!o ? onClose() : null)}
      title="Chọn khách hàng"
      description="Liên kết hóa đơn với hồ sơ bệnh nhân để theo dõi tuân thủ điều trị"
    >
      <Input
        autoFocus
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Tìm theo tên, SĐT..."
        leftIcon={<Search className="h-4 w-4" />}
      />
      <ul className="mt-3 space-y-2">
        {filtered.map((p) => {
          const isSelected = p.id === selected;
          return (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => onSelect(p)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg border bg-white px-4 py-3 text-left transition-colors",
                  isSelected
                    ? "border-brand bg-brand-50"
                    : "border-line hover:border-brand/60 hover:bg-surface",
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-pill bg-brand-50 text-sm font-semibold text-brand">
                    {p.fullName
                      .split(" ")
                      .slice(-2)
                      .map((s) => s[0])
                      .join("")}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-ink">{p.fullName}</div>
                    <div className="text-xs text-ink-muted">
                      {p.vneIdMasked} · Sinh {p.birthYear}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {p.chronicConditions.map((c) => (
                        <Badge key={c} tone="info">
                          {c}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                {isSelected && <Check className="h-4 w-4 text-brand" />}
              </button>
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className="rounded-lg border border-dashed border-line p-6 text-center text-sm text-ink-muted">
            Không tìm thấy khách hàng. Thử SĐT hoặc tạo mới.
          </li>
        )}
      </ul>
    </Modal>
  );
}

interface CheckoutDialogProps {
  open: boolean;
  onClose: () => void;
  cart: CartLine[];
  customer: Patient | null;
  subtotal: number;
  vat: number;
  total: number;
  onConfirm: (method: PaymentMethod) => void;
}

function CheckoutDialog({
  open,
  onClose,
  cart,
  customer,
  subtotal,
  vat,
  total,
  onConfirm,
}: CheckoutDialogProps) {
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [processing, setProcessing] = useState(false);

  async function confirm() {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 700));
    setProcessing(false);
    onConfirm(method);
  }

  return (
    <Modal
      open={open}
      onOpenChange={(o) => (!o ? onClose() : null)}
      title="Xác nhận thanh toán"
      description={`${cart.length} thuốc · ${formatVND(total)}`}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={processing}>
            Hủy
          </Button>
          <Button onClick={confirm} disabled={processing}>
            {processing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Xác nhận thanh toán
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {customer ? (
          <div className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm">
            <User className="h-4 w-4 text-brand" />
            <span className="font-medium text-ink">{customer.fullName}</span>
            <span className="text-ink-muted">·</span>
            <Phone className="h-3 w-3 text-ink-muted" />
            <span className="text-ink-muted">{customer.vneIdMasked}</span>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-line bg-surface px-3 py-2 text-xs text-ink-muted">
            Bán không gắn khách hàng — không theo dõi được tuân thủ điều trị.
          </div>
        )}

        <div>
          <div className="mb-2 text-sm font-medium text-ink">Phương thức</div>
          <div className="grid grid-cols-3 gap-2">
            <PaymentOption
              icon={Banknote}
              label="Tiền mặt"
              active={method === "cash"}
              onClick={() => setMethod("cash")}
            />
            <PaymentOption
              icon={CreditCard}
              label="Thẻ"
              active={method === "card"}
              onClick={() => setMethod("card")}
            />
            <PaymentOption
              icon={Smartphone}
              label="QR Code"
              active={method === "qr"}
              onClick={() => setMethod("qr")}
            />
          </div>
        </div>

        <div className="rounded-xl border border-line bg-white">
          <ul className="divide-y divide-line">
            {cart.map((l) => (
              <li key={l.drug.id} className="flex items-center justify-between px-4 py-2 text-sm">
                <span className="flex-1 truncate text-ink">{l.drug.innName}</span>
                <span className="w-12 text-center text-ink-muted">×{l.qty}</span>
                <span className="w-24 text-right font-medium text-ink">
                  {formatVND(l.qty * l.unitPriceVnd)}
                </span>
              </li>
            ))}
          </ul>
          <div className="space-y-1 border-t border-line bg-surface px-4 py-3 text-sm">
            <Row label="Tạm tính" value={formatVND(subtotal)} />
            <Row label="VAT (5%)" value={formatVND(vat)} />
            <Row label="Tổng" value={formatVND(total)} bold />
          </div>
        </div>
      </div>
    </Modal>
  );
}

function PaymentOption({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: typeof Banknote;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 rounded-xl border bg-white px-3 py-4 text-sm transition-colors",
        active
          ? "border-brand bg-brand-50 text-brand"
          : "border-line text-ink-muted hover:border-brand/60",
      )}
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={cn("text-ink-muted", bold && "font-semibold text-ink")}>{label}</span>
      <span className={cn("text-ink", bold && "text-base font-bold text-brand")}>{value}</span>
    </div>
  );
}
