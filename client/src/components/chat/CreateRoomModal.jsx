import React, { useState } from "react";
import { X, Sparkles, Loader2 } from "lucide-react";
import api from "../../services/api";
import { toast } from "sonner";
import { socket } from "../../services/socket";

export default function CreateRoomModal({ isOpen, onClose, onRoomCreated }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const res = await api.post("/chat/rooms", {
        name,
        description,
        isPrivate,
      });
      const newRoom = res.data.data;
      
      toast.success(isPrivate ? "Private study room created!" : "Study room created!");
      
      // Tell other connected users about this room
      socket.emit("create_room_broadcast", newRoom);
      
      // Let parent component know to join it
      onRoomCreated(newRoom);
      
      // Reset form
      setName("");
      setDescription("");
      setIsPrivate(false);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md rounded-2xl border border-rule bg-paper p-6 shadow-2xl animate-in zoom-in-95 duration-200"
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-ink">
            <Sparkles className="text-accent" size={20} />
            <h2 className="font-semibold">Create Study Room</h2>
          </div>
          <button 
            onClick={onClose}
            className="rounded p-1 text-ink-3 transition-colors hover:bg-rule hover:text-ink"
          >
            <X size={20} />
          </button>
        </div>

        <p className="mb-6 text-sm text-ink-3">
          Ephemeral rooms are perfect for in-the-moment collaboration. They automatically disappear when everyone leaves!
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-2">Topic / Room Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Grinding Leetcode Trees"
              className="w-full rounded-lg border border-rule bg-paper-2 px-4 py-2.5 text-sm text-ink placeholder-ink-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              autoFocus
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-2">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What are you working on?"
              rows={2}
              className="w-full resize-none rounded-lg border border-rule bg-paper-2 px-4 py-2.5 text-sm text-ink placeholder-ink-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
              />
              <div className="h-5 w-9 rounded-full bg-rule peer-checked:bg-accent transition-colors"></div>
              <div className="absolute left-[2px] top-[2px] h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-full"></div>
            </div>
            <div>
              <p className="text-sm font-medium text-ink">Make Private</p>
              <p className="text-xs text-ink-3">Hide from global feed and require a code to join</p>
            </div>
          </label>

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
              disabled={loading || !name.trim()}
              className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              Create & Join
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
