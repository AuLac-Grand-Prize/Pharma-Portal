"use client";

import type { CartLine, Patient } from "@/types/domain";
import { formatVND } from "@/lib/utils";

interface ReceiptProps {
  invoiceId: string;
  cart: CartLine[];
  customer: Patient | null;
  subtotal: number;
  vat: number;
  total: number;
  paymentMethod: string;
  pharmacyName?: string;
  pharmacyAddress?: string;
  cashier?: string;
  issuedAt?: Date;
}

export function Receipt({
  invoiceId,
  cart,
  customer,
  subtotal,
  vat,
  total,
  paymentMethod,
  pharmacyName = "Nhà thuốc Demo",
  pharmacyAddress = "12 Trần Duy Hưng, Cầu Giấy, Hà Nội",
  cashier = "DS. Nguyễn Văn A",
  issuedAt = new Date(),
}: ReceiptProps) {
  return (
    <div className="receipt-print font-mono text-[12px] text-black" id="receipt-print-region">
      <header className="mb-2 text-center">
        <div className="text-base font-bold">{pharmacyName}</div>
        <div className="text-[11px]">{pharmacyAddress}</div>
        <div className="mt-1 text-[11px]">Hotline: 1900 6868</div>
      </header>

      <div className="my-2 border-t border-dashed border-black" />

      <div className="text-center text-[13px] font-bold uppercase">Hóa đơn bán lẻ</div>
      <div className="mt-1 flex justify-between text-[11px]">
        <span>Số: {invoiceId}</span>
        <span>{issuedAt.toLocaleString("vi-VN")}</span>
      </div>
      {customer && (
        <div className="mt-1 text-[11px]">
          KH: {customer.fullName} · {customer.vneIdMasked}
        </div>
      )}
      <div className="text-[11px]">Thu ngân: {cashier}</div>

      <div className="my-2 border-t border-dashed border-black" />

      <table className="w-full">
        <thead>
          <tr className="text-left text-[11px]">
            <th className="py-1">Mặt hàng</th>
            <th className="py-1 text-right">SL</th>
            <th className="py-1 text-right">Đ.giá</th>
            <th className="py-1 text-right">T.tiền</th>
          </tr>
        </thead>
        <tbody>
          {cart.map((l) => (
            <tr key={l.drug.id} className="align-top">
              <td className="py-0.5 pr-1">{l.drug.innName}</td>
              <td className="py-0.5 text-right">{l.qty}</td>
              <td className="py-0.5 text-right">{formatVND(l.unitPriceVnd)}</td>
              <td className="py-0.5 text-right">{formatVND(l.qty * l.unitPriceVnd)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="my-2 border-t border-dashed border-black" />

      <div className="space-y-0.5 text-[12px]">
        <Row label="Tạm tính" value={formatVND(subtotal)} />
        <Row label="VAT (5%)" value={formatVND(vat)} />
        <Row label="TỔNG CỘNG" value={formatVND(total)} bold />
        <Row label="Phương thức" value={paymentMethod} />
      </div>

      <div className="my-2 border-t border-dashed border-black" />

      <p className="text-center text-[11px]">
        Cảm ơn quý khách. Đây là hóa đơn bán lẻ — VietDrug AI đã kiểm tra tương tác.
      </p>
      <p className="mt-1 text-center text-[10px]">PharmLink AI · Make in Vietnam</p>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={"flex justify-between" + (bold ? " text-[13px] font-bold" : "")}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
