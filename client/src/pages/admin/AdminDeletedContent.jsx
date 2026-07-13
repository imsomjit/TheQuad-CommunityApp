import React, { useState, useEffect } from "react";
import { Trash2, RefreshCw, Eye } from "lucide-react";
import { adminApi } from "../../services/api";
import { toast } from "sonner";
import { TableSkeleton } from "../../components/Skeletons";

export default function AdminDeletedContent() {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeletedContent();
  }, []);

  const fetchDeletedContent = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getDeletedContent();
      setContent(data || []);
    } catch (err) {
      toast.error("Failed to fetch deleted content");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (type, id) => {
    if (!window.confirm("Are you sure you want to restore this content?")) return;

    try {
      await adminApi.restoreContent(type, id);
      toast.success("Content restored successfully");
      setContent((prev) => prev.filter((item) => !(item.type === type && item.id === id)));
    } catch (err) {
      toast.error("Failed to restore content");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-ink">Deleted Content</h1>
          <p className="text-ink-2 mt-1">Manage and restore soft-deleted items across the platform.</p>
        </div>
      </div>

      <div className="bg-paper border border-rule rounded-xl overflow-hidden">
        {loading ? (
          <TableSkeleton />
        ) : content.length === 0 ? (
          <div className="p-8 text-center text-ink-3">
            <Trash2 className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No deleted content found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-paper-2 border-b border-rule text-sm text-ink-2">
                  <th className="p-4 font-medium">Type</th>
                  <th className="p-4 font-medium w-1/2">Title/Body</th>
                  <th className="p-4 font-medium">Deleted By</th>
                  <th className="p-4 font-medium">Deleted At</th>
                  <th className="p-4 font-medium">Expires In</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule">
                {content.map((item, idx) => (
                  <tr key={`${item.type}-${item.id}-${idx}`} className="hover:bg-paper-2/50 transition-colors">
                    <td className="p-4 text-sm font-medium capitalize">{item.type}</td>
                    <td className="p-4 text-sm text-ink max-w-xs truncate">
                      {item.title || "No Title"}
                      <div className="text-xs text-ink-3 mt-1 font-mono">
                        ID: {item.publicId || item.id}
                      </div>
                    </td>
                    <td className="p-4 text-sm">
                      {item.deletedByRole === "admin" 
                        ? "admin user" 
                        : item.deletedBy 
                          ? `@${item.deletedBy}` 
                          : "system"}
                    </td>
                    <td className="p-4 text-sm text-ink-3">
                      {new Date(item.deletedAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-sm">
                      {(() => {
                        const daysLeft = 14 - Math.floor((new Date() - new Date(item.deletedAt)) / (1000 * 60 * 60 * 24));
                        if (daysLeft <= 0) return <span className="text-syntax-rose font-medium">Today</span>;
                        if (daysLeft <= 3) return <span className="text-syntax-rose font-medium">{daysLeft} days</span>;
                        return <span className="text-ink-2">{daysLeft} days</span>;
                      })()}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleRestore(item.type, item.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-paper bg-ink rounded-lg hover:bg-ink-2 transition-colors"
                      >
                        <RefreshCw className="h-3.5 w-3.5" /> Restore
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
