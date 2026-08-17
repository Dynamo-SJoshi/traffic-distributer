import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CampaignList from './components/CampaignList';
import CampaignDetail from './components/CampaignDetail';
import CreateCampaignModal from './components/CreateCampaignModal';

export default function App() {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = async () => {
    try {
      const res = await fetch('/api/campaigns');
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data);
      }
    } catch (err) {
      console.error('Failed to fetch campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleCreateCampaign = async (campaignData) => {
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData)
      });
      if (res.ok) {
        const created = await res.json();
        setShowCreateModal(false);
        await fetchCampaigns();
        setSelectedCampaignId(created.id);
      }
    } catch (err) {
      console.error('Failed to create campaign:', err);
    }
  };

  const handleDeleteCampaign = async (id) => {
    try {
      const res = await fetch(`/api/campaigns/${id}`, { method: 'DELETE' });
      if (res.ok) {
        if (selectedCampaignId === id) setSelectedCampaignId(null);
        fetchCampaigns();
      }
    } catch (err) {
      console.error('Failed to delete campaign:', err);
    }
  };

  const activeCampaign = campaigns.find((c) => c.id === selectedCampaignId);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      <Navbar
        campaigns={campaigns}
        onNewCampaign={() => setShowCreateModal(true)}
        activeCampaignId={selectedCampaignId}
        onSelectCampaign={setSelectedCampaignId}
      />

      <main style={{ maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '0 28px 60px', flex: 1 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            Loading rotator campaigns...
          </div>
        ) : activeCampaign ? (
          <CampaignDetail
            campaign={activeCampaign}
            onBack={() => setSelectedCampaignId(null)}
            onRefresh={fetchCampaigns}
          />
        ) : (
          <CampaignList
            campaigns={campaigns}
            onSelectCampaign={setSelectedCampaignId}
            onDeleteCampaign={handleDeleteCampaign}
            onNewCampaign={() => setShowCreateModal(true)}
          />
        )}
      </main>

      {showCreateModal && (
        <CreateCampaignModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateCampaign}
        />
      )}

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '20px 28px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
        QRoute Sequential QR Link Allocator & Rotator &bull; Engineered with Node.js & React
      </footer>

    </div>
  );
}
