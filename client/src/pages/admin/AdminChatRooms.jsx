import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { adminApi } from "../../services/api";
import { MessageSquare, Plus, Trash2, Users } from "lucide-react";
import { Input } from "../../components/ui/input";
import { useApp } from "../../context/AppContext";
import { socket } from "../../services/socket";
import useDocumentTitle from '../../hooks/useDocumentTitle';

export default function AdminChatRooms() {
  useDocumentTitle("[Admin] Global Lounges");
  const { currentUser } = useApp();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getGlobalRooms();
      setRooms(data);
    } catch (err) {
      toast.error("Failed to load global rooms");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    try {
      setCreating(true);
      const newRoom = await adminApi.createGlobalRoom(form);
      toast.success("Global room created successfully");
      
      // Update local state
      setRooms([newRoom, ...rooms]);
      
      // Broadcast to other users via socket
      socket.emit("create_room_broadcast", newRoom);
      
      // Reset form
      setForm({ name: "", description: "" });
      setShowCreateForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create room");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (roomId, roomName) => {
    if (!window.confirm(`Are you sure you want to permanently delete the "${roomName}" room?`)) {
      return;
    }

    try {
      await adminApi.deleteGlobalRoom(roomId);
      toast.success("Room deleted successfully");
      
      // Update local state
      setRooms(rooms.filter((r) => r.id !== roomId));
      
      // Broadcast deletion
      socket.emit("delete_room_broadcast", roomId);
    } catch (err) {
      toast.error("Failed to delete room");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold font-display text-ink flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-accent" />
            Global Lounges
          </h1>
          <p className="text-ink-2 mt-1">Manage permanent, subject-wise study rooms visible to all users.</p>
        </div>
        <button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-paper font-medium rounded-md hover:bg-accent-2 transition-colors"
        >
          <Plus className="h-4 w-4" /> Create Lounge
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-paper border border-rule rounded-xl p-6 shadow-sm animate-in slide-in-from-top-4">
          <h2 className="text-lg font-bold mb-4">Create New Global Lounge</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink-2 mb-1">Room Name</label>
              <Input 
                placeholder="e.g., Computer Science, Off-Topic" 
                value={form.name} 
                onChange={(e) => setForm({ ...form, name: e.target.value })} 
                required 
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-2 mb-1">Description (Optional)</label>
              <Input 
                placeholder="What is this lounge for?" 
                value={form.description} 
                onChange={(e) => setForm({ ...form, description: e.target.value })} 
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button 
                type="button" 
                onClick={() => setShowCreateForm(false)} 
                className="px-4 py-2 text-ink-2 hover:bg-paper-2 rounded-md font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={creating || !form.name.trim()}
                className="px-4 py-2 bg-ink text-paper rounded-md hover:bg-ink-2 font-medium disabled:opacity-50 transition-colors"
              >
                {creating ? "Creating..." : "Create Lounge"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent"></div>
        </div>
      ) : rooms.length === 0 ? (
        <div className="border border-rule border-dashed rounded-xl p-12 text-center">
          <MessageSquare className="h-12 w-12 text-ink-3 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-ink mb-1">No Global Lounges</h3>
          <p className="text-ink-2 mb-4">There are currently no permanent chat rooms.</p>
          <button 
            onClick={() => setShowCreateForm(true)}
            className="text-accent hover:underline font-medium"
          >
            Create the first lounge
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <div key={room.id} className="border border-rule bg-paper rounded-xl p-5 hover:border-accent/30 transition-colors group relative flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-lg leading-tight truncate pr-8">{room.name}</h3>
                <button 
                  onClick={() => handleDelete(room.id, room.name)}
                  className="absolute top-4 right-4 p-1.5 text-red-500 opacity-0 group-hover:opacity-100 bg-red-500/10 hover:bg-red-500/20 rounded-md transition-all"
                  title="Delete Room"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              
              <p className="text-sm text-ink-2 mb-4 flex-1">
                {room.description || "No description provided."}
              </p>
              
              <div className="flex items-center justify-between text-xs text-ink-3 border-t border-rule pt-3 mt-auto">
                <span>Created {new Date(room.createdAt).toLocaleDateString()}</span>
                <span className="flex items-center gap-1 font-medium bg-paper-2 px-2 py-1 rounded-full">
                  <Users className="h-3 w-3" /> Global
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
