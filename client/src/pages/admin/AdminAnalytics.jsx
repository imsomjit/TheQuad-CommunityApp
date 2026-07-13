import React, { useEffect, useState } from "react";
import { adminApi } from "../../services/api";
import { Users, BookOpen, MessageSquare, FileText, AlertTriangle, UserMinus } from "lucide-react";
import { toast } from "sonner";

export default function AdminAnalytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await adminApi.getAnalytics();
        setStats(data);
      } catch (err) {
        toast.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);



  const statCards = [
    { label: "Total Users", value: stats?.totalUsers || 0, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Resources", value: stats?.totalResources || 0, icon: FileText, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Questions", value: stats?.totalQuestions || 0, icon: MessageSquare, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Blogs", value: stats?.totalBlogs || 0, icon: BookOpen, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { label: "Pending Reports", value: stats?.pendingReports || 0, icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-500/10" },
    { label: "Banned Users", value: stats?.bannedUsers || 0, icon: UserMinus, color: "text-red-500", bg: "bg-red-500/10" },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold font-display text-ink">System Statistics</h1>
        <p className="text-ink-2 mt-1">Overview of platform metrics and content volumes.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-paper border border-rule rounded-xl p-6 flex items-center gap-4 shadow-sm">
              <div className="h-16 w-16 shimmer rounded-full bg-paper-2"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 shimmer rounded bg-paper-2"></div>
                <div className="h-8 w-16 shimmer rounded bg-paper-2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div key={idx} className="bg-paper border border-rule rounded-xl p-6 flex items-center gap-4 shadow-sm">
                <div className={`p-4 rounded-full ${card.bg}`}>
                  <Icon className={`h-8 w-8 ${card.color}`} />
                </div>
                <div>
                  <p className="text-ink-2 text-sm font-medium">{card.label}</p>
                  <p className="text-3xl font-bold text-ink">{card.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
