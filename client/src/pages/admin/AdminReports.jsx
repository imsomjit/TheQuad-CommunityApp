import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import api from "../../services/api";
import { XCircle, AlertCircle, Eye, Trash2 } from "lucide-react";

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get("/moderation/reports", { params: { status: statusFilter } });
      setReports(res.data.data);
    } catch (err) {
      toast.error("Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      if (action === "remove_content") {
        const report = reports.find((r) => r.id === id);
        if (!report) return;
        const confirmStr = prompt(`Type "DELETE" to remove this ${report.targetType}`);
        if (confirmStr !== "DELETE") return;

        await api.delete(`/moderation/content/${report.targetType}/${report.targetId}`, {
          data: { reason: "Content violated guidelines" }
        });
        toast.success("Content removed successfully");
      } else {
        await api.patch(`/moderation/reports/${id}/${action}`, { action });
        toast.success(`Report marked as ${action === 'review' ? 'under review' : 'dismissed'}`);
      }
      fetchReports();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action} report`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-ink">Moderation Queue</h1>
          <p className="text-ink-2 mt-1">Review and manage user reports.</p>
        </div>
        <div className="flex gap-2">
          {["pending", "under_review", "resolved", "dismissed"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                statusFilter === status 
                  ? "bg-accent text-paper font-medium" 
                  : "bg-paper-2 text-ink-2 hover:bg-paper-3"
              }`}
            >
              {status.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-paper-2 rounded-xl border border-rule/50"></div>
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-rule rounded-xl bg-paper-2/30">
          <AlertCircle className="h-8 w-8 mx-auto text-ink-3 mb-3" />
          <p className="text-ink-2">No {statusFilter.replace("_", " ")} reports found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="border border-rule bg-paper rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-md bg-accent/10 text-accent">
                    {report.targetType}
                  </span>
                  <span className="text-sm font-medium text-red-600 bg-red-600/10 px-2.5 py-1 rounded-md">
                    Reason: {report.reason}
                  </span>
                  <span className="text-sm text-ink-3">
                    {format(new Date(report.createdAt), "MMM d, yyyy h:mm a")}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-medium text-ink mb-1">Reporter Comments:</h3>
                <p className="text-sm text-ink-2 bg-paper-2 p-3 rounded-md">
                  {report.description || "No additional details provided."}
                </p>
              </div>

              <div className="flex items-center justify-between text-sm text-ink-3 border-t border-rule pt-4">
                <div className="flex flex-wrap items-center gap-4 text-sm text-ink-3">
                  <span>Report ID: <span className="font-mono">{report.id}</span></span>
                  <span>Target ID: {" "}
                    {report.targetUrl ? (
                      <a href={report.targetUrl} target="_blank" rel="noreferrer" className="font-mono text-accent hover:underline">
                        {report.targetPublicId}
                      </a>
                    ) : (
                      <span className="font-mono">{report.targetPublicId}</span>
                    )}
                  </span>
                  <span>
                    Reported by:{" "}
                    <a href={`/u/${report.reporterUsername}`} className="text-accent hover:underline font-medium">
                      @{report.reporterUsername || 'unknown'}
                    </a>
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Status Actions */}
                  {report.status === "pending" && (
                    <button
                      onClick={() => handleAction(report.id, "review")}
                      className="text-xs px-2.5 py-1.5 bg-paper-2 hover:bg-paper-3 text-ink-2 font-medium rounded transition-colors"
                    >
                      Mark Under Review
                    </button>
                  )}
                  {(report.status === "pending" || report.status === "under_review") && (
                    <>
                      <button
                        onClick={() => handleAction(report.id, "resolve")}
                        className="text-xs px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 font-medium rounded transition-colors"
                      >
                        Resolve
                      </button>
                      <button
                        onClick={() => handleAction(report.id, "dismiss")}
                        className="text-xs px-2.5 py-1.5 bg-paper-2 hover:bg-paper-3 text-ink-2 font-medium rounded transition-colors"
                      >
                        Dismiss
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
