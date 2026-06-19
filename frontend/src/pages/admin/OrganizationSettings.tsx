import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { apiClient } from '../../services/api';
import { Settings, Save } from 'lucide-react';

export default function OrganizationSettings() {
  const { activeOrganization, fetchOrganizations } = useAuthStore();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeOrganization) {
      setName(activeOrganization.name);
    }
  }, [activeOrganization]);

  const handleSave = async () => {
    try {
      setLoading(true);
      await apiClient.put(`/api/organizations/${activeOrganization.id}`, { name });
      await fetchOrganizations(); // Refresh the active organization
      alert("Settings saved successfully!");
    } catch (err) {
      console.error("Failed to update organization", err);
      alert("Failed to update organization settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Settings size={28} className="text-blue-500" />
        <h1 className="text-2xl font-bold">Organization Settings</h1>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">General Information</h2>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Organization Name
          </label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
          />
        </div>

        <button 
          onClick={handleSave}
          disabled={loading || !name.trim() || name === activeOrganization?.name}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
        >
          <Save size={18} />
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
