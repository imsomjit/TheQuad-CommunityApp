import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { adminApi, opportunitiesApi } from "../../services/api";
import { Briefcase, Plus, Trash2, Edit } from "lucide-react";
import { Input } from "../../components/ui/input";

export default function AdminOpportunities() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    organizer: "",
    type: "HACKATHON",
    url: "",
    location: "",
    startTime: "",
    deadline: ""
  });
  const [editingId, setEditingId] = useState(null);

  const fetchOpportunities = async (pageNumber = page) => {
    try {
      setLoading(true);
      const res = await opportunitiesApi.list({ page: pageNumber, limit });
      setOpportunities(res.data);
      if (res.pagination) {
        setTotalPages(res.pagination.totalPages);
      }
    } catch (err) {
      toast.error("Failed to load opportunities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities(page);
  }, [page]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        startTime: formData.startTime ? new Date(formData.startTime).toISOString() : null,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
      };

      if (editingId) {
        await adminApi.updateOpportunity(editingId, payload);
        toast.success("Opportunity updated");
      } else {
        await adminApi.createOpportunity(payload);
        toast.success("Opportunity created");
      }
      
      setShowForm(false);
      setEditingId(null);
      setFormData({ title: "", description: "", organizer: "", type: "HACKATHON", url: "", location: "", startTime: "", deadline: "" });
      fetchOpportunities();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save opportunity");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this opportunity?")) return;
    try {
      await adminApi.deleteOpportunity(id);
      toast.success("Opportunity deleted");
      fetchOpportunities();
    } catch (err) {
      toast.error("Failed to delete opportunity");
    }
  };

  const handleEdit = (opp) => {
    setFormData({
      title: opp.title,
      description: opp.description || "",
      organizer: opp.organizer,
      type: opp.type,
      url: opp.url,
      location: opp.location || "",
      startTime: opp.startTime ? new Date(opp.startTime).toISOString().slice(0, 16) : "",
      deadline: opp.deadline ? new Date(opp.deadline).toISOString().slice(0, 16) : ""
    });
    setEditingId(opp.id);
    setShowForm(true);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold font-display text-ink">Opportunities Management</h1>
          <p className="text-ink-2 mt-1">Create, update, and manage hackathons, internships, and events.</p>
        </div>
        <button 
          onClick={() => { setShowForm(!showForm); setEditingId(null); }}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-paper font-medium rounded-md hover:bg-accent-2"
        >
          <Plus className="h-4 w-4" /> Add Opportunity
        </button>
      </div>

      {showForm && (
        <div className="bg-paper border border-rule rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-4">{editingId ? "Edit Opportunity" : "Create New Opportunity"}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-ink-2">Title *</label>
              <Input placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-ink-2">Organizer *</label>
              <Input placeholder="Organizer" value={formData.organizer} onChange={e => setFormData({...formData, organizer: e.target.value})} required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-ink-2">Type *</label>
              <select 
                value={formData.type} 
                onChange={e => setFormData({...formData, type: e.target.value})}
                className="w-full h-11 px-3 rounded-md border border-rule bg-paper text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none"
              >
                <option value="HACKATHON">Hackathon</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="JOB">Job</option>
                <option value="EVENT">Event</option>
                <option value="SCHOLARSHIP">Scholarship</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-ink-2">URL *</label>
              <Input type="url" placeholder="https://..." value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} required />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-medium text-ink-2">Description</label>
              <textarea 
                placeholder="Details..." 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full rounded-md border border-rule bg-paper p-3 text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none min-h-[100px]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-ink-2">Location</label>
              <Input placeholder="Remote, City, etc." value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-ink-2">Start Time</label>
              <Input type="datetime-local" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-ink-2">Deadline</label>
              <Input type="datetime-local" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} />
            </div>
            
            <div className="md:col-span-2 flex justify-end gap-3 mt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-rule text-ink rounded-md hover:bg-paper-2">Cancel</button>
              <button type="submit" className="px-6 py-2 bg-accent text-paper rounded-md hover:bg-accent-2 font-medium">{editingId ? "Save Changes" : "Create"}</button>
            </div>
          </form>
        </div>
      )}

      <div className="border border-rule rounded-xl bg-paper overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-paper-2 text-ink border-b border-rule font-medium">
            <tr>
              <th className="px-4 py-3 w-16">S.No.</th>
              <th className="px-4 py-3">Opportunity</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Deadline</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {opportunities.map((opp, index) => (
              <tr key={opp.id} className="border-b border-rule last:border-0 hover:bg-paper-2">
                <td className="px-4 py-3 text-ink-3">
                  {(page - 1) * limit + index + 1}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-ink flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-ink-3" />
                    {opp.title}
                  </div>
                  <div className="text-xs text-ink-3 mt-0.5">{opp.organizer}</div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[10px] font-bold tracking-wider uppercase bg-paper-3 px-2 py-1 rounded-full">{opp.type}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium ${opp.status === 'OPEN' ? 'text-green-500' : 'text-orange-500'}`}>{opp.status}</span>
                </td>
                <td className="px-4 py-3 text-ink-2 text-xs">
                  {opp.deadline ? new Date(opp.deadline).toLocaleDateString() : 'None'}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleEdit(opp)} className="p-1.5 text-ink-3 hover:text-accent bg-paper-2 hover:bg-accent/10 rounded transition-colors" title="Edit">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(opp.id)} className="p-1.5 text-ink-3 hover:text-red-500 bg-paper-2 hover:bg-red-500/10 rounded transition-colors" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {opportunities.length === 0 && !loading && (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-ink-3">No opportunities found.</td>
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
    </div>
  );
}
