import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CampaignList from './components/CampaignList';
import CampaignDetail from './components/CampaignDetail';
import CreateCampaignModal from './components/CreateCampaignModal';
import PasscodeGate from './components/PasscodeGate';

export default function App() {
  const [passcode, setPasscode] = useState(() => localStorage.getItem('qroute_passcode') || '');
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchCampaigns = async (pCode = passcode) => {
    if (!pCode) return;
    setLoading(true);
    try {
      const res = await fetch('/api/campaigns', {
        headers: { 'X-Passcode': pCode }
      });
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
    if (passcode) {
      fetchCampaigns(passcode);
    }
  }, [passcode]);

  const handleLoginSuccess = (validPasscode) => {
    localStorage.setItem('qroute_passcode', validPasscode);
    setPasscode(validPasscode);
  };

  const handleLogout = () => {
    localStorage.removeItem('qroute_passcode');
    setPasscode('');
    setCampaigns([]);
    setSelectedCampaignId(null);
  };

  const handleCreateCampaign = async (campaignData) => {
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Passcode': passcode
        },
        body: JSON.stringify(campaignData)
      });
      if (res.ok) {
        const created = await res.json();
        setShowCreateModal(false);
        await fetchCampaigns(passcode);
        setSelectedCampaignId(created.id);
      }
    } catch (err) {
      console.error('Failed to create campaign:', err);
    }
  };

  const handleDeleteCampaign = async (id) => {
    try {
      const res = await fetch(`/api/campaigns/${id}`, {
        method: 'DELETE',
        headers: { 'X-Passcode': passcode }
      });
      if (res.ok) {
        if (selectedCampaignId === id) setSelectedCampaignId(null);
        fetchCampaigns(passcode);
      }
    } catch (err) {
      console.error('Failed to delete campaign:', err);
    }
  };

  const activeCampaign = campaigns.find((c) => c.id === selectedCampaignId);

  // If user is not authenticated with a 6-character passcode, show PasscodeGate screen
  if (!passcode) {
    return <PasscodeGate onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      <Navbar
        campaigns={campaigns}
        onNewCampaign={() => setShowCreateModal(true)}
        activeCampaignId={selectedCampaignId}
        onSelectCampaign={setSelectedCampaignId}
        passcode={passcode}
        onLogout={handleLogout}
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
            onRefresh={() => fetchCampaigns(passcode)}
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

    </div>
  );
}
