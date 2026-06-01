import React, { useState, useEffect } from "react";
import { adminApi } from "../../services/api";
import { Star, FileText, MessageSquare, BookOpen, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export default function AdminFeatured() {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeatured = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getFeaturedContent();
      setContent(data);
    } catch (err) {
      toast.error("Failed to load featured content");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatured();
  }, []);

  const handleUnfeature = async (type, id) => {
    try {
      await adminApi.toggleFeatureContent(type, id);
      toast.success("Content unfeatured successfully");
      fetchFeatured();
    } catch (err) {
      toast.error("Failed to unfeature content");
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'resource': return <FileText className="h-5 w-5 text-emerald-500" />;
      case 'question': return <MessageSquare className="h-5 w-5 text-purple-500" />;
      case 'blog': return <BookOpen className="h-5 w-5 text-indigo-500" />;
      default: return <Star className="h-5 w-5 text-accent" />;
    }
  };

  const getLink = (type, id) => {
    switch (type) {
      case 'resource': return `/resources/${id}`;
      case 'question': return `/questions/${id}`;
      case 'blog': return `/posts/id/${id}`; // Adjust if slug is needed, typically admin links to ID
      default: return "#";
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold font-display text-ink flex items-center gap-2">
          <Star className="h-6 w-6 text-accent fill-accent" /> Featured Content
        </h1>
        <p className="text-ink-2 mt-1">Manage content that is highlighted across the platform.</p>
      </div>

      <div className="border border-rule rounded-xl bg-paper overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-paper-2 text-ink border-b border-rule font-medium">
            <tr>
              <th className="px-4 py-3 w-16">S.No.</th>
              <th className="px-4 py-3">Content</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {content.map((item, index) => (
              <tr key={`${item.type}-${item.id}`} className="border-b border-rule last:border-0 hover:bg-paper-2">
                <td className="px-4 py-3 text-ink-3">
                  {index + 1}
                </td>
                <td className="px-4 py-3">
                  <Link to={getLink(item.type, item.id)} className="font-medium text-ink hover:text-accent flex items-center gap-2" target="_blank">
                    {getTypeIcon(item.type)}
                    <span className="line-clamp-1">{item.title}</span>
                  </Link>
                </td>
                <td className="px-4 py-3 capitalize text-ink-2">
                  {item.type}
                </td>
                <td className="px-4 py-3 text-right">
                  <button 
                    onClick={() => handleUnfeature(item.type, item.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 ml-auto text-xs font-medium text-ink-2 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Unfeature
                  </button>
                </td>
              </tr>
            ))}
            {content.length === 0 && !loading && (
              <tr>
                <td colSpan="4" className="px-4 py-12 text-center text-ink-3">
                  <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No featured content yet.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
