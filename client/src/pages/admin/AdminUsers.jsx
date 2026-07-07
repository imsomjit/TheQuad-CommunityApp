import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { adminApi } from "../../services/api";
import { Search, ShieldAlert, Ban, UserCog, History, UserPlus } from "lucide-react";
import { Input } from "../../components/ui/input";
import { useApp } from "../../context/AppContext";
import { TableSkeleton } from "../../components/Skeletons";

export default function AdminUsers() {
  const { currentUser } = useApp();
  const isAdmin = currentUser?.role === "admin";
  
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionReason, setActionReason] = useState("");
  const [durationDays, setDurationDays] = useState(7);
  const [contentUrl, setContentUrl] = useState("");
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // New Moderator Form
  const [showModForm, setShowModForm] = useState(false);
  const [modForm, setModForm] = useState({ name: "", username: "", email: "", password: "" });

  const fetchUsers = async (query = search, pageNumber = page) => {
    try {
      setLoading(true);
      const res = await adminApi.listUsers({ search: query, page: pageNumber, limit });
      setUsers(res.data);
      if (res.pagination) {
        setTotalPages(res.pagination.totalPages);
      }
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(search, page);
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers(search, 1);
  };

  const loadHistory = async (userId) => {
    try {
      const data = await adminApi.getUserHistory(userId);
      setHistory(data);
      setShowHistory(true);
    } catch (err) {
      toast.error("Failed to load user history");
    }
  };

  const handleAction = async (action) => {
    if (!selectedUser) return;
    if (!actionReason) {
      toast.error("Please provide a reason.");
      return;
    }

    try {
      if (action === "warn") {
        await adminApi.warnUser(selectedUser.id, { reason: actionReason, contentUrl });
        toast.success(`User ${selectedUser.username} warned.`);
      } else if (action === "suspend") {
        await adminApi.suspendUser(selectedUser.id, { reason: actionReason, durationDays: parseInt(durationDays) });
        toast.success(`User suspended for ${durationDays} days.`);
      } else if (action === "ban") {
        await adminApi.banUser(selectedUser.id, { reason: actionReason });
        toast.success(`User banned permanently.`);
      }
      
      setActionReason("");
      setContentUrl("");
      fetchUsers(search); // Refresh list
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action} user`);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminApi.updateUserRole(userId, newRole);
      toast.success("User role updated");
      fetchUsers(search);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update role");
    }
  };

  const handleCreateMod = async (e) => {
    e.preventDefault();
    try {
      await adminApi.createModerator(modForm);
      toast.success("Moderator account created successfully");
      setShowModForm(false);
      setModForm({ name: "", username: "", email: "", password: "" });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create moderator");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold font-display text-ink">User Management</h1>
          <p className="text-ink-2 mt-1">Manage users, view history, and issue warnings or bans.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setShowModForm(!showModForm)}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-paper font-medium rounded-md hover:bg-accent-2"
          >
            <UserPlus className="h-4 w-4" /> Add Moderator
          </button>
        )}
      </div>

      {showModForm && isAdmin && (
        <div className="bg-paper border border-rule rounded-xl p-6">
          <h2 className="text-lg font-bold mb-4">Create New Moderator Account</h2>
          <form onSubmit={handleCreateMod} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input placeholder="Full Name" value={modForm.name} onChange={e => setModForm({...modForm, name: e.target.value})} required />
            <Input placeholder="Username" value={modForm.username} onChange={e => setModForm({...modForm, username: e.target.value})} required />
            <Input type="email" placeholder="Email" value={modForm.email} onChange={e => setModForm({...modForm, email: e.target.value})} required />
            <Input type="text" placeholder="Password" value={modForm.password} onChange={e => setModForm({...modForm, password: e.target.value})} required />
            <button type="submit" className="md:col-span-2 py-2 bg-ink text-paper rounded-md hover:bg-ink-2 font-medium">Create Moderator</button>
          </form>
        </div>
      )}

      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-3" />
          <Input 
            placeholder="Search name, username, or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-11 border-rule focus-visible:ring-accent"
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="h-11 px-6 bg-paper-2 border border-rule text-ink font-medium rounded-md hover:bg-paper-3 transition-colors disabled:opacity-50"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User List */}
        {loading && users.length === 0 ? (
          <div className="lg:col-span-2">
            <TableSkeleton />
          </div>
        ) : (
          <div className="lg:col-span-2 border border-rule rounded-xl bg-paper overflow-hidden">
            <table className="w-full text-sm text-left">
            <thead className="bg-paper-2 text-ink border-b border-rule font-medium">
              <tr>
                <th className="px-4 py-3 w-16">S.No.</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, index) => (
                <tr key={u.id} className={`border-b border-rule last:border-0 hover:bg-paper-2 cursor-pointer ${selectedUser?.id === u.id ? 'bg-accent/5' : ''}`} onClick={() => setSelectedUser(u)}>
                  <td className="px-4 py-3 text-ink-3">
                    {(page - 1) * limit + index + 1}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-ink">{u.name}</div>
                    <div className="text-xs text-ink-3">@{u.username} • {u.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    {isAdmin && u.role !== 'admin' ? (
                      <select 
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="text-xs p-1 rounded border border-rule bg-paper"
                        onClick={e => e.stopPropagation()}
                      >
                        <option value="student">Student</option>
                        <option value="moderator">Moderator</option>
                      </select>
                    ) : (
                      <span className={`text-xs px-2 py-1 rounded-full ${u.role === 'admin' ? 'bg-purple-500/10 text-purple-600' : u.role === 'moderator' ? 'bg-accent/10 text-accent' : 'bg-paper-3 text-ink-2'}`}>
                        {u.role}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {u.isBanned ? (
                      <span className="text-xs text-red-500 font-medium">Banned</span>
                    ) : u.suspensionExpiresAt && new Date(u.suspensionExpiresAt) > new Date() ? (
                      <span className="text-xs text-orange-500 font-medium">Suspended</span>
                    ) : (
                      <span className="text-xs text-green-500 font-medium">Active</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink-2 text-xs">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button 
                      onClick={(e) => { e.stopPropagation(); loadHistory(u.id); }}
                      className="p-1.5 text-ink-3 hover:text-accent hover:bg-accent/10 rounded-md transition-colors"
                      title="View History"
                    >
                      <History className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && !loading && (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-ink-3">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="flex justify-between items-center px-4 py-3 border-t border-rule bg-paper-2/50">
            <button 
              disabled={page === 1} 
              onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 bg-paper border border-rule text-ink text-xs rounded hover:bg-paper-3 transition-colors disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-xs text-ink-2">Page {page} of {totalPages || 1}</span>
            <button 
              disabled={page >= totalPages} 
              onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 bg-paper border border-rule text-ink text-xs rounded hover:bg-paper-3 transition-colors disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
        )}

        {/* Action Panel */}
        <div className="lg:col-span-1">
          {selectedUser ? (
            <div className="border border-rule rounded-xl bg-paper/80 backdrop-blur-xl p-5 sticky top-24">
              <h3 className="font-bold text-lg mb-1">{selectedUser.name}</h3>
              <p className="text-sm text-ink-2 mb-6">@{selectedUser.username}</p>

              {selectedUser.role === 'admin' ? (
                <p className="text-sm text-ink-3 italic">Cannot perform moderation actions on an admin.</p>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-ink mb-1">Reason for Action</label>
                    <textarea 
                      value={actionReason}
                      onChange={(e) => setActionReason(e.target.value)}
                      placeholder="Required. User will be notified."
                      className="w-full resize-none rounded-md border border-rule bg-paper-2 p-2 text-sm text-ink focus:border-accent focus:outline-none"
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-ink mb-1">Source Content URL (Optional)</label>
                    <input 
                      type="url"
                      value={contentUrl}
                      onChange={(e) => setContentUrl(e.target.value)}
                      placeholder="e.g. https://thequad.web.app/resources/..."
                      className="w-full rounded-md border border-rule bg-paper-2 p-2 text-sm text-ink focus:border-accent focus:outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <button onClick={() => handleAction("warn")} className="w-full flex items-center justify-center gap-2 py-2 bg-yellow-600/10 text-yellow-600 rounded-md font-medium hover:bg-yellow-600/20 transition-colors text-sm">
                      <ShieldAlert className="h-4 w-4" /> Warn User
                    </button>

                    <div className="flex gap-2">
                      <select 
                        value={durationDays}
                        onChange={(e) => setDurationDays(e.target.value)}
                        className="rounded-md border border-rule bg-paper px-2 text-sm text-ink focus:border-accent focus:outline-none"
                      >
                        <option value={1}>1d</option>
                        <option value={3}>3d</option>
                        <option value={7}>7d</option>
                        <option value={30}>30d</option>
                      </select>
                      <button onClick={() => handleAction("suspend")} className="flex-1 flex items-center justify-center gap-2 py-2 bg-orange-600/10 text-orange-600 rounded-md font-medium hover:bg-orange-600/20 transition-colors text-sm">
                        <UserCog className="h-4 w-4" /> Suspend
                      </button>
                    </div>

                    {isAdmin && (
                      <button onClick={() => handleAction("ban")} className="w-full flex items-center justify-center gap-2 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors text-sm mt-2">
                        <Ban className="h-4 w-4" /> Ban Permanently
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="border border-rule border-dashed rounded-xl p-8 text-center text-ink-3">
              Select a user to take action.
            </div>
          )}
        </div>
      </div>

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent p-4">
          <div className="bg-paper w-full max-w-lg rounded-xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-rule bg-paper-2">
              <h3 className="font-bold">Moderation History</h3>
              <button onClick={() => setShowHistory(false)} className="text-ink-3 hover:text-ink">&times;</button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto space-y-3">
              {history.length > 0 ? history.map(h => (
                <div key={h.id} className="border border-rule rounded-lg p-3 text-sm">
                  <div className="flex justify-between items-start mb-1">
                    <span className={`font-semibold capitalize ${h.actionType === 'ban' ? 'text-red-500' : h.actionType === 'suspend' ? 'text-orange-500' : 'text-yellow-600'}`}>
                      {h.actionType} {h.durationDays ? `(${h.durationDays}d)` : ''}
                    </span>
                    <span className="text-xs text-ink-3">{new Date(h.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-ink-2 mb-2">{h.reason}</p>
                  <p className="text-xs text-ink-3 text-right">Issued by: {h.issuedByName}</p>
                </div>
              )) : (
                <p className="text-center py-4 text-ink-3">No moderation history found.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
