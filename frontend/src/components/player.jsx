import React, { useMemo, useState, useEffect } from 'react';
import './player.css';

const roleTabs = ['All', 'Batters', 'All-Rounders', 'Bowlers', 'Wicket Keepers'];

const Player = () => {
  const [players, setPlayers] = useState([]);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    fetch('http://localhost:5000/api/players')
      .then(res => res.json())
      .then(data => setPlayers(data))
      .catch(console.error);
    
    // View Tracker
    fetch('http://localhost:5000/api/track-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: 'player' })
    }).catch(() => {});
  }, []);

  const visiblePlayers = useMemo(
    () => (activeTab === 'All' ? players : players.filter((player) => player.role === activeTab)),
    [activeTab, players]
  );

  const playersByRole = useMemo(() => {
    const grouped = roleTabs.slice(1).map((role) => ({
      role,
      list: visiblePlayers.filter((player) => player.role === role),
    }));
    return grouped.filter((group) => group.list.length > 0);
  }, [visiblePlayers]);

  return (
    <div className="player-page">
      <section className="players-layout">
        <h1>OUR TEAM</h1>

        <div className="player-filters" role="tablist" aria-label="Player role filters">
          {roleTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              className={`filter-chip ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {playersByRole.map((group) => (
          <section key={group.role} className="role-section">
            <h2>{group.role}</h2>
            <div className="players-grid">
              {group.list.map((player) => (
                <article className="player-card" key={player.id}>
                  <img className="card-image cover" src={`http://localhost:5000${player.cover_image_url}`} alt={`${player.name} cover`} />
                  <img className="card-image photo" src={`http://localhost:5000${player.photo_image_url}`} alt={player.name} />
                  <div className="player-name">{player.name}</div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </section>
    </div>
  );
};

export default Player;
