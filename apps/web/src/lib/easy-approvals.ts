export type EasyApprovalDecision = "approve" | "send_back" | "reject";

export type EasyApprovalRecord = {
  decision: EasyApprovalDecision;
  comment: string;
  savedAt: string;
};

const STORAGE_KEY = "ot-erp-easy-approvals";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function loadEasyApprovalRecords(): Record<string, EasyApprovalRecord> {
  if (!isBrowser()) return {};

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, EasyApprovalRecord>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function getEasyApprovalRecord(saleId: number): EasyApprovalRecord | null {
  const all = loadEasyApprovalRecords();
  return all[String(saleId)] ?? null;
}

export function saveEasyApprovalRecord(
  saleId: number,
  record: EasyApprovalRecord
): Record<string, EasyApprovalRecord> {
  const all = loadEasyApprovalRecords();
  const next = {
    ...all,
    [String(saleId)]: record,
  };

  if (isBrowser()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  return next;
}
