import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MessageCircle, Reply, Trash2, Send, ChevronDown, ChevronUp } from "lucide-react";
import { commentsApi } from "../services/api";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { getAvatarFallback } from "../utils/fallbacks";
import { toast } from "sonner";

/**
 * Reusable threaded comment section.
 *
 * Props:
 *   targetType  - "resource" | "question" | "answer" | "blog"
 *   targetId    - integer ID of the target
 *   className   - extra wrapper class
 */
export default function CommentSection({ targetType, targetId, className = "" }) {
  const { currentUser } = useApp();
  const navigate = useNavigate();

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!targetType || !targetId) return;
    setLoading(true);
    commentsApi
      .list(targetType, targetId)
      .then(setComments)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [targetType, targetId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!currentUser) { navigate("/login"); return; }

    setSubmitting(true);
    try {
      const c = await commentsApi.add({
        targetType,
        targetId,
        body: newComment.trim(),
      });
      setComments((prev) => [...prev, c]);
      setNewComment("");
    } catch {}
    setSubmitting(false);
  };

  const handleReply = async (parentId, body) => {
    if (!currentUser) { navigate("/login"); return; }
    try {
      const c = await commentsApi.add({
        targetType,
        targetId,
        body,
        parentId,
      });
      // Insert reply under parent
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === parentId
            ? { ...comment, replies: [...(comment.replies || []), c] }
            : comment
        )
      );
      return c;
    } catch {}
  };

  const handleDelete = async (id, parentId) => {
    try {
      await commentsApi.delete(id);
      if (parentId) {
        // Remove from parent's replies
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === parentId
              ? { ...comment, replies: (comment.replies || []).filter((r) => r.id !== id) }
              : comment
          )
        );
      } else {
        setComments((prev) => prev.filter((c) => c.id !== id));
      }
    } catch {}
  };

  const commentCount = comments.reduce(
    (n, c) => n + 1 + (c.replies?.length || 0),
    0
  );

  return (
    <div className={className}>
      <h3 className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-ink-3">
        <MessageCircle className="h-3.5 w-3.5" />
        Comments ({commentCount})
      </h3>

      {/* New comment form */}
      {currentUser ? (
        <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment…"
            rows={2}
            className="w-full rounded-sm border border-rule bg-paper p-2.5 text-sm text-ink placeholder:text-ink-3 focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/30 resize-none"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!newComment.trim() || submitting}
              className="inline-flex items-center gap-1.5 rounded-sm bg-ink px-3 py-1.5 text-xs font-medium text-paper transition-colors hover:bg-ink/80 disabled:opacity-40"
            >
              <Send className="h-3 w-3" />
              {submitting ? "Posting…" : "Post"}
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-3 rounded-sm border border-rule bg-paper-2/40 p-3 text-center">
          <p className="text-xs text-ink-2">
            <Link to="/login" className="text-accent hover:underline">Log in</Link> to comment
          </p>
        </div>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="mt-4 space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="h-7 w-7 animate-pulse rounded-full bg-paper-2" />
              <div className="flex-1 space-y-2 rounded-sm bg-paper-2/40 p-3">
                <div className="h-3 w-24 animate-pulse rounded-sm bg-paper-2" />
                <div className="h-3 w-full animate-pulse rounded-sm bg-paper-2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUser={currentUser}
              onReply={handleReply}
              onDelete={handleDelete}
              depth={0}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Single comment (recursive for replies) ────────────────────────────────────
function CommentItem({ comment, currentUser, onReply, onDelete, depth = 0 }) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(true);

  const isOwner = currentUser?.id === comment.authorId;
  const hasReplies = comment.replies && comment.replies.length > 0;
  const maxDepth = 3; // limit nesting

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setReplying(true);
    await onReply(comment.id, replyText.trim());
    setReplyText("");
    setShowReply(false);
    setReplying(false);
  };

  const avatar = comment.author?.avatarUrl || getAvatarFallback(comment.author?.name, comment.author?.username || comment.authorId);

  return (
    <div className={depth > 0 ? "ml-8 border-l border-rule/50 pl-4" : ""}>
      <div className="flex gap-3">
        <img
          src={avatar}
          alt=""
          className="mt-0.5 h-7 w-7 shrink-0 rounded-full object-cover"
        />
        <div className="flex-1 rounded-sm border border-rule bg-paper-2/40 p-3">
          <div className="flex items-center gap-2">
            <Link
              to={`/pv/${comment.author?.username}`}
              className="text-xs font-medium text-ink hover:text-accent"
            >
              {comment.author?.name || comment.author?.username || "User"}
            </Link>
            <span className="font-mono text-[10px] text-ink-3">
              {new Date(comment.createdAt || comment.created_at).toLocaleDateString()}
            </span>
          </div>

          <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-ink-2">
            {comment.body || comment.text}
          </p>

          {/* Actions */}
          <div className="mt-2 flex items-center gap-3">
            {depth < maxDepth && currentUser && (
              <button
                onClick={() => setShowReply(!showReply)}
                className="flex items-center gap-1 text-[10px] font-mono text-ink-3 transition-colors hover:text-ink"
              >
                <Reply className="h-3 w-3" />
                Reply
              </button>
            )}

            {isOwner && (
              <button
                onClick={() => onDelete(comment.id, depth > 0 ? comment.parentId : null)}
                className="flex items-center gap-1 text-[10px] font-mono text-ink-3 transition-colors hover:text-red-400"
              >
                <Trash2 className="h-3 w-3" />
                Delete
              </button>
            )}

            {hasReplies && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="ml-auto flex items-center gap-1 text-[10px] font-mono text-ink-3 transition-colors hover:text-ink"
              >
                {showReplies ? (
                  <><ChevronUp className="h-3 w-3" /> Hide replies ({comment.replies.length})</>
                ) : (
                  <><ChevronDown className="h-3 w-3" /> Show replies ({comment.replies.length})</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reply form */}
      {showReply && (
        <form onSubmit={handleReplySubmit} className="ml-10 mt-2 flex gap-2">
          <input
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={`Reply to ${comment.author?.name || "user"}…`}
            className="h-8 flex-1 rounded-sm border border-rule bg-paper px-2.5 text-xs text-ink placeholder:text-ink-3 focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/30"
            autoFocus
          />
          <button
            type="submit"
            disabled={!replyText.trim() || replying}
            className="rounded-sm bg-ink px-2.5 py-1.5 text-xs font-medium text-paper hover:bg-ink/80 disabled:opacity-40"
          >
            {replying ? "…" : "Reply"}
          </button>
          <button
            type="button"
            onClick={() => { setShowReply(false); setReplyText(""); }}
            className="text-xs text-ink-3 hover:text-ink"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Nested replies */}
      {hasReplies && showReplies && (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUser={currentUser}
              onReply={onReply}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
