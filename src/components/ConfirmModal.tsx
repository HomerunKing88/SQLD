"use client";

interface Props {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "brand" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
}

/** 네이티브 confirm 대체 — 브랜드 일관 스타일의 바텀시트 확인창 */
export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "확인",
  cancelLabel = "취소",
  tone = "brand",
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/40"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="safe-bottom mx-auto w-full max-w-app rounded-t-2xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-base font-bold text-slate-900">{title}</p>
        {message && (
          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-500">
            {message}
          </p>
        )}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button className="btn-ghost" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            className={tone === "danger" ? "btn w-full bg-rose-500 text-white active:bg-rose-600" : "btn-primary"}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
