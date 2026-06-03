export type Drug = {
  id: string;
  innName: string;
  brandNames: string[];
  atcCode?: string;
  unitPriceVnd: number;
  stock: number;
  expiryDate?: string;
};

export type CartLine = {
  drug: Drug;
  qty: number;
  unitPriceVnd: number;
};

export type InteractionAlert = {
  drugA: string;
  drugB: string;
  severity: "low" | "moderate" | "high" | "contraindicated";
  mechanism: string;
  clinicalAdvice: string;
};

export type Patient = {
  id: string;
  fullName: string;
  vneIdMasked?: string;
  birthYear?: number;
  chronicConditions: string[];
};
