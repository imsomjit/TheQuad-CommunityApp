import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { X, AlertTriangle } from "lucide-react";
import api from "../services/api";

const REPORT_REASONS = [
  { id: "spam", label: "Spam", description: "Unsolicited content" },
  { id: "harassment", label: "Harassment", description: "Targeting others" },
  { id: "abusive", label: "Abusive", description: "Offensive language" },
  { id: "misleading", label: "Misleading", description: "Factually incorrect" },
  { id: "copyright", label: "Copyright", description: "Without permission" },
  { id: "inappropriate", label: "Inappropriate", description: "NSFW/disturbing" },
  { id: "duplicate", label: "Duplicate", description: "Already exists" },
  { id: "other", label: "Other", description: "Needs explanation" },
];

export default function ReportModal({ isOpen, onClose, targetType, targetId, targetTitle }) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) {
      toast.error("Please select a reason");
      return;
    }
    if (reason === "other" && description.trim().length < 10) {
      toast.error("Please provide a description (min 10 chars).");
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post("/reports", {
        targetType,
        targetId,
        reason,
        description,
      });
      toast.success("Report submitted successfully.");
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit report");
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md max-h-[90dvh] overflow-y-auto rounded-xl border border-rule bg-paper p-4 sm:p-5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 flex flex-col">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-md p-1.5 text-ink-3 transition-colors hover:bg-paper-2 hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10 text-red-500 shrink-0">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1 pr-6">
            <h2 className="text-base font-semibold text-ink leading-tight">Report Content</h2>
            <p className="text-xs text-ink-2 truncate">
              {targetTitle || "This item"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink">
              Reason for reporting
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-md border border-rule p-2 bg-paper-2/30">
              {REPORT_REASONS.map((r) => (
                <label
                  key={r.id}
                  className={`flex cursor-pointer items-start gap-2 rounded-md p-2 transition-colors hover:bg-paper-2 ${
                    reason === r.id ? "bg-accent/10 outline outline-1 outline-accent" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="report_reason"
                    value={r.id}
                    checked={reason === r.id}
                    onChange={() => setReason(r.id)}
                    className="mt-0.5 h-3.5 w-3.5 text-accent focus:ring-accent shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-ink leading-none">{r.label}</p>
                    <p className="text-[10px] text-ink-3 mt-1 leading-tight truncate">{r.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink">
              Additional details (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context..."
              className="w-full resize-none rounded-md border border-rule bg-paper-2 p-2.5 text-xs text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-ink-2 transition-colors hover:bg-paper-2 hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50 btn-primary"
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
