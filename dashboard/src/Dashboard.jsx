import React, { useState, useEffect } from 'react';

const LOCALIZATION = {
  en: {
    title: "Central Triage Console",
    subtitle: "Manage company-wide internal system tickets",
    langBtn: "አማርኛ",
    filterAll: "All Systems",
    thId: "Ticket ID",
    thSystem: "Host App",
    thType: "Type",
    thTitle: "Issue Title",
    thStatus: "Status",
    thPriority: "Priority",
    thActions: "Actions",
    noTickets: "No tickets found. You're all caught up!",
    viewDetails: "View Timeline Details",
    statusNew: "New",
    statusProgress: "In Progress",
    statusDone: "Resolved"
  },
  am: {
    title: "ማዕከላዊ የቲኬት መቆጣጠሪያ ሰሌዳ",
    subtitle: "በድርጅቱ ውስጥ ካሉ መተግበሪያዎች የመጡ ቅሬታዎችን ያስተዳድሩ",
    langBtn: "English",
    filterAll: "ሁሉንም መተግበሪያዎች",
    thId: "የቲኬት መለያ",
    thSystem: "መተግበሪያ",
    thType: "ዓይነት",
    thTitle: "የችግሩ ርዕስ",
    thStatus: "ሁኔታ",
    thPriority: "ቅድሚያ የሚሰጠው",
    thActions: "ተግባራት",
    noTickets: "ምንም የተመዘገበ ቲኬት የለም። ስራዎች ተጠናቀዋል!",
    viewDetails: "የጊዜ መስመር ዝርዝር ይመልከቱ",
    statusNew: "አዲስ",
    statusProgress: "በመስራት ላይ",
    statusDone: "ተፈትቷል"
  }
};

export default function Dashboard() {
  const [lang, setLang] = useState('en');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [systemFilter, setSystemFilter] = useState('');
  const t = LOCALIZATION[lang];

  useEffect(() => {
    // Fetches real-time ticket arrays from your active Express API Backend
    fetch('http://localhost:5000/api/tickets')
      .then(res => res.json())
      .then(resData => {
        setTickets(resData.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed fetching triage data streams", err);
        setLoading(false);
      });
  }, []);

  const filteredTickets = systemFilter 
    ? tickets.filter(ticket => ticket.system_id === parseInt(systemFilter))
    : tickets;

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '24px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      {/* Top Navigation Bar Component Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #eaeaea', paddingBottom: '16px' }}>
        <div>
          <h1 style={{ margin: 0, color: '#111827', fontSize: '28px' }}>{t.title}</h1>
          <p style={{ margin: '4px 0 0 0', color: '#6b7280' }}>{t.subtitle}</p>
        </div>
        <button 
          onClick={() => setLang(lang === 'en' ? 'am' : 'en')}
          style={{ backgroundColor: '#ffffff', border: '1px solid #d1d5db', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
        >
          🌐 {t.langBtn}
        </button>
      </div>

      {/* Dynamic Operational Grid Control Filters Toolbar Container */}
      <div style={{ marginBottom: '20px' }}>
        <select 
          value={systemFilter} 
          onChange={(e) => setSystemFilter(e.target.value)}
          style={{ padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', width: '220px', backgroundColor: '#fff' }}
        >
          <option value="">{t.filterAll}</option>
          <option value="1">ERP Internal Core Portal</option>
          <option value="2">Customer Support Dashboard</option>
        </select>
      </div>

      {/* Main Structural Ticket Matrix Data Table Component */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', fontSize: '18px', color: '#4b5563' }}>Loading triage layout pipeline data entries...</div>
      ) : filteredTickets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', color: '#6b7280' }}>
          <h2>{t.noTickets}</h2>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>{t.thId}</th>
                <th style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>{t.thSystem}</th>
                <th style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>{t.thType}</th>
                <th style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>{t.thTitle}</th>
                <th style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>{t.thStatus}</th>
                <th style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>{t.thPriority}</th>
                <th style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>{t.thActions}</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} style={{ borderBottom: '1px solid #e5e7eb', transition: 'background-color 0.2s' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 'bold', color: '#4f46e5' }}>#{ticket.id}</td>
                  <td style={{ padding: '14px 16px', color: '#4b5563' }}>{ticket.system?.name || `App System ${ticket.system_id}`}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', backgroundColor: ticket.type === 'bug' ? '#fee2e2' : '#dbeafe', color: ticket.type === 'bug' ? '#991b1b' : '#1e40af' }}>
                      {ticket.type.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: '500', color: '#111827', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ticket.title}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', backgroundColor: '#e0f2fe', color: '#0369a1' }}>
                      {ticket.status === 'new' ? t.statusNew : ticket.status === 'in_progress' ? t.statusProgress : t.statusDone}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#ef4444', fontWeight: 'bold' }}>{ticket.priority || '—'}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <button style={{ background: '#4f46e5', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>
                      {t.viewDetails}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
