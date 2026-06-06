import React, { useState } from "react";
import { toast } from "sonner";
import { X, AlertTriangle } from "lucide-react";
import api from "../services/api"; // or reportsApi if exported

const REPORT_REASONS = [
  { id: "spam", label: "Spam", description: "Unsolicited or repetitive content" },
  { id: "harassment", label: "Harassment", description: "Targeting or abusing others" },
  { id: "abusive", label: "Abusive Language", description: "Offensive or harmful language" },
  { id: "misleading", label: "Misleading Information", description: "Factually incorrect or deceptive" },
  { id: "copyright", label: "Copyright Violation", description: "Using content without permission" },
  { id: "inappropriate", label: "Inappropriate Content", description: "NSFW or disturbing content" },
  { id: "duplicate", label: "Duplicate", description: "Content that already exists" },
  { id: "other", label: "Other", description: "Needs explanation below" },
];

export default function ReportModal({ isOpen, onClose, targetType, targetId, targetTitle }) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) {
      toast.error("Please select a reason for reporting");
      return;
    }
    if (reason === "other" && description.trim().length < 10) {
      toast.error("Please provide a description (min 10 chars) for 'Other' reason.");
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
      toast.success("Your report submitted successfully.");
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit report");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-sm p-4 sm:p-0">
      <div className="w-full max-w-md max-h-[95vh] overflow-y-auto rounded-xl border border-rule bg-paper p-5 sm:p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200 flex flex-col">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 sm:right-4 sm:top-4 rounded-md p-1 text-ink-3 transition-colors hover:bg-paper-2 hover:text-ink"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 text-red-500">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-ink">Report Content</h2>
            <p className="text-sm text-ink-2 truncate max-w-[250px]">
              {targetTitle || "This item"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-ink">
              Why are you reporting this?
            </label>
            <div className="max-h-[240px] overflow-y-auto space-y-2 rounded-md border border-rule p-2">
              {REPORT_REASONS.map((r) => (
                <label
                  key={r.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-md p-2 transition-colors hover:bg-paper-2 ${
                    reason === r.id ? "bg-accent/10 outline outline-1 outline-accent" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="report_reason"
                    value={r.id}
                    checked={reason === r.id}
                    onChange={() => setReason(r.id)}
                    className="mt-1 h-4 w-4 text-accent focus:ring-accent"
                  />
                  <div>
                    <p className="text-sm font-medium text-ink">{r.label}</p>
                    <p className="text-xs text-ink-3">{r.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-ink">
              Additional details (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide any additional context that might help us investigate..."
              className="w-full resize-none rounded-md border border-rule bg-paper-2 p-3 text-sm text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm font-medium text-ink-2 transition-colors hover:bg-paper-2 hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50 btn-primary"
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
