import React, { useState, useEffect } from "react";
import { 
  Settings, Save, Loader2, Link2, BellRing, Flag, Check, ShieldAlert,
  CalendarClock, Trash2, Calendar
} from "lucide-react";
import { toast } from "sonner";
import { settingsApi, broadcastsApi } from "../../services/api";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { useApp } from "../../context/AppContext";

export default function AdminSettings() {
  const { siteSettings: globalSettings, setSiteSettings } = useApp();
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  // Settings Form State
  const [settings, setSettings] = useState({
    registrationEnabled: true,
    announcementActive: false,
    announcementType: "INFO",
    announcementText: "",
    socialLinks: {
      linkedin: "",
      instagram: "",
      twitter: "",
      discord: "",
      email: ""
    }
  });

  // Broadcasts State
  const [broadcasts, setBroadcasts] = useState([]);
  const [broadcastForm, setBroadcastForm] = useState({
    title: "",
    message: "",
    type: "INFO",
    scheduledAt: ""
  });
  const [submittingBroadcast, setSubmittingBroadcast] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setFetching(true);
    try {
      const [settingsData, broadcastsData] = await Promise.all([
        settingsApi.get(),
        broadcastsApi.list()
      ]);
      setSettings(settingsData);
      setBroadcasts(broadcastsData);
    } catch (err) {
      toast.error("Failed to load settings data");
    } finally {
      setFetching(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await settingsApi.update(settings);
      setSiteSettings(settings); // update global context instantly
      toast.success("Site settings updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastForm.title || !broadcastForm.message || !broadcastForm.scheduledAt) {
      return toast.error("Please fill in all broadcast fields");
    }
    
    setSubmittingBroadcast(true);
    try {
      const newBroadcast = await broadcastsApi.schedule(broadcastForm);
      setBroadcasts([newBroadcast, ...broadcasts]);
      toast.success("Broadcast scheduled successfully");
      setBroadcastForm({ title: "", message: "", type: "INFO", scheduledAt: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to schedule broadcast");
    } finally {
      setSubmittingBroadcast(false);
    }
  };

  const handleDeleteBroadcast = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this scheduled broadcast?")) return;
    try {
      await broadcastsApi.delete(id);
      setBroadcasts(broadcasts.filter(b => b.id !== id));
      toast.success("Broadcast cancelled");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel broadcast");
    }
  };

  if (fetching) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-ink-3" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6 flex items-center justify-between border-b border-rule pb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Platform Settings</h1>
          <p className="text-sm text-ink-2">Manage global site configuration and broadcasts.</p>
        </div>
        <button 
          onClick={handleSaveSettings}
          disabled={loading}
          className="flex items-center gap-2 rounded-sm bg-accent px-4 py-2 text-sm font-semibold text-paper hover:bg-accent-hover disabled:opacity-50 transition-all btn-primary"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Settings
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration & General */}
        <div className="space-y-6">
          
          <div className="rounded-xl border border-rule bg-paper-2 p-6 shadow-sm">
            <h3 className="flex items-center gap-2 font-display text-lg font-bold text-ink mb-4">
              <ShieldAlert className="h-5 w-5 text-accent" /> Registration Control
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink">Allow New Registrations</p>
                <p className="text-xs text-ink-3">Enable or disable new users from signing up.</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={settings.registrationEnabled}
                  onChange={(e) => setSettings({ ...settings, registrationEnabled: e.target.checked })}
                />
                <div className="peer h-6 w-11 rounded-full bg-rule after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-accent peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:border-gray-600"></div>
              </label>
            </div>
          </div>

          <div className="rounded-xl border border-rule bg-paper-2 p-6 shadow-sm">
            <h3 className="flex items-center gap-2 font-display text-lg font-bold text-ink mb-4">
              <Flag className="h-5 w-5 text-accent" /> Homepage Announcement Banner
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-ink">Show Banner</span>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={settings.announcementActive}
                    onChange={(e) => setSettings({ ...settings, announcementActive: e.target.checked })}
                  />
                  <div className="peer h-6 w-11 rounded-full bg-rule after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-accent peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:border-gray-600"></div>
                </label>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-ink-3 font-mono">Banner Type</label>
                <Select 
                  value={settings.announcementType} 
                  onValueChange={(val) => setSettings({ ...settings, announcementType: val })}
                >
                  <SelectTrigger className="bg-paper border-rule focus:border-accent">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INFO">Info</SelectItem>
                    <SelectItem value="SUCCESS">Success</SelectItem>
                    <SelectItem value="WARNING">Warning</SelectItem>
                    <SelectItem value="ERROR">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-ink-3 font-mono">Banner Text</label>
                <Input 
                  value={settings.announcementText}
                  onChange={(e) => setSettings({ ...settings, announcementText: e.target.value })}
                  placeholder="e.g. Scheduled maintenance on Sunday"
                  className="bg-paper border-rule focus-visible:border-accent"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-rule bg-paper-2 p-6 shadow-sm">
            <h3 className="flex items-center gap-2 font-display text-lg font-bold text-ink mb-4">
              <Link2 className="h-5 w-5 text-accent" /> Social Links
            </h3>
            <div className="space-y-3">
              {Object.keys(settings.socialLinks).map((platform) => (
                <div key={platform} className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-ink-3 font-mono capitalize">{platform}</label>
                  <Input 
                    value={settings.socialLinks[platform]}
                    onChange={(e) => setSettings({ 
                      ...settings, 
                      socialLinks: { ...settings.socialLinks, [platform]: e.target.value } 
                    })}
                    placeholder={`Add ${platform} account`}
                    className="bg-paper border-rule h-9 text-sm focus-visible:border-accent"
                  />
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Broadcast System */}
        <div className="space-y-6">
          
          <div className="rounded-xl border border-rule bg-paper-2 p-6 shadow-sm">
            <h3 className="flex items-center gap-2 font-display text-lg font-bold text-ink mb-4">
              <BellRing className="h-5 w-5 text-accent" /> Schedule Broadcast
            </h3>
            <p className="text-xs text-ink-3 mb-4">
              Send an in-app notification to every active user at a specific time.
            </p>
            <form onSubmit={handleScheduleBroadcast} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-ink-3 font-mono">Title</label>
                <Input 
                  required
                  value={broadcastForm.title}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                  placeholder="Notification Title"
                  className="bg-paper border-rule"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-ink-3 font-mono">Message</label>
                <textarea 
                  required
                  rows={3}
                  value={broadcastForm.message}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                  placeholder="Detailed notification message..."
                  className="w-full flex rounded-sm border border-rule bg-paper px-3 py-2 text-sm focus-visible:outline-none focus-visible:border-accent/60 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-ink-3 font-mono">Type</label>
                  <Select 
                    value={broadcastForm.type} 
                    onValueChange={(val) => setBroadcastForm({ ...broadcastForm, type: val })}
                  >
                    <SelectTrigger className="bg-paper border-rule">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INFO">Info</SelectItem>
                      <SelectItem value="SUCCESS">Success</SelectItem>
                      <SelectItem value="WARNING">Warning</SelectItem>
                      <SelectItem value="SYSTEM">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-ink-3 font-mono">Time</label>
                  <Input 
                    required
                    type="datetime-local"
                    value={broadcastForm.scheduledAt}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, scheduledAt: e.target.value })}
                    className="bg-paper border-rule [color-scheme:light] dark:[color-scheme:dark]"
                  />
                </div>
              </div>
              <button 
                type="submit"
                disabled={submittingBroadcast}
                className="w-full flex items-center justify-center gap-2 rounded-sm bg-paper border border-rule px-4 py-2 text-sm font-semibold text-ink hover:bg-paper-2 hover:border-accent disabled:opacity-50 transition-all"
              >
                {submittingBroadcast ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarClock className="h-4 w-4" />}
                Schedule Broadcast
              </button>
            </form>
          </div>

          <div className="rounded-xl border border-rule bg-paper-2 p-6 shadow-sm h-[400px] flex flex-col">
            <h3 className="font-display text-lg font-bold text-ink mb-4 border-b border-rule pb-2">
              Broadcast Log
            </h3>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {broadcasts.length === 0 ? (
                <div className="text-center text-sm text-ink-3 py-8">
                  No broadcasts scheduled.
                </div>
              ) : broadcasts.map((b) => (
                <div key={b.id} className={`p-3 rounded-md border ${b.isSent ? 'bg-paper/50 border-rule/50' : 'bg-paper border-rule'} relative group`}>
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-sm text-ink">{b.title}</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-paper-2 border border-rule text-ink-2">
                      {b.type}
                    </span>
                  </div>
                  <p className="text-xs text-ink-2 line-clamp-2 mb-2">{b.message}</p>
                  <div className="flex items-center justify-between text-[10px] text-ink-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(b.scheduledAt).toLocaleString()}
                    </span>
                    {b.isSent ? (
                      <span className="flex items-center gap-1 text-green-500">
                        <Check className="h-3 w-3" /> Sent
                      </span>
                    ) : (
                      <span className="text-orange-500">Pending</span>
                    )}
                  </div>
                  {!b.isSent && (
                    <button 
                      onClick={() => handleDeleteBroadcast(b.id)}
                      className="absolute top-2 right-2 p-1.5 rounded-md bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                      title="Cancel Broadcast"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
