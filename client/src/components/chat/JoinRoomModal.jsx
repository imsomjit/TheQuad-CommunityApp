import React, { useState } from "react";
import { X, Key, Loader2 } from "lucide-react";
import api from "../../services/api";
import { toast } from "sonner";

export default function JoinRoomModal({ isOpen, onClose, onRoomJoined }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim() || code.length < 6) return;

    setLoading(true);
    try {
      const res = await api.post("/chat/rooms/join", {
        code: code.trim(),
      });
      const room = res.data.data;
      
      toast.success(`Joined ${room.name}!`);
      
      // Let parent component know to join it
      onRoomJoined(room);
      
      // Reset form
      setCode("");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Invalid or expired join code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-sm rounded-2xl border border-rule bg-paper p-6 shadow-2xl animate-in zoom-in-95 duration-200"
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-ink">
            <Key className="text-accent" size={20} />
            <h2 className="font-semibold">Join Private Room</h2>
          </div>
          <button 
            onClick={onClose}
            className="rounded p-1 text-ink-3 transition-colors hover:bg-rule hover:text-ink"
          >
            <X size={20} />
          </button>
        </div>

        <p className="mb-6 text-sm text-ink-3">
          Enter the 6-character secret code given by the room creator to join.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-2">Secret Code</label>
            <input
              type="text"
              required
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. AB9Z2X"
              className="w-full rounded-lg border border-rule bg-paper-2 px-4 py-2.5 text-center font-mono text-lg tracking-widest text-ink placeholder-ink-3/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              autoFocus
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-ink-2 transition-colors hover:bg-rule"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || code.trim().length < 6}
              className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : "Join Room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
