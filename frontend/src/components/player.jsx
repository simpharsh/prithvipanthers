import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './player.css';
import { itemReveal, pageTransition, sectionStagger } from '../utils/pageMotion';

const roleTabs = ['All', 'Batters', 'All-Rounders', 'Bowlers', 'Wicket Keepers'];

const Player = () => {
  const [players, setPlayers] = useState([]);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    fetch('http://localhost:5000/api/players')
      .then(res => res.json())
      .then((data) => {
        // Accept both raw array and wrapped payloads from backend.
        const normalizedPlayers = Array.isArray(data)
          ? data
          : Array.isArray(data?.players)
            ? data.players
            : [];
        setPlayers(normalizedPlayers);
      })
      .catch(console.error);
    
    // View Tracker
    fetch('http://localhost:5000/api/track-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: 'player' })
    }).catch(() => {});
  }, []);

  const visiblePlayers = useMemo(() => {
    const normalizedPlayers = Array.isArray(players) ? players : [];
    return activeTab === 'All'
      ? normalizedPlayers
      : normalizedPlayers.filter((player) => player.role === activeTab);
  }, [activeTab, players]);

  const playersByRole = useMemo(() => {
    const normalizedVisiblePlayers = Array.isArray(visiblePlayers) ? visiblePlayers : [];
    const grouped = roleTabs.slice(1).map((role) => ({
      role,
      list: normalizedVisiblePlayers.filter((player) => player.role === role),
    }));
    return grouped.filter((group) => group.list.length > 0);
  }, [visiblePlayers]);

  return (
    <motion.div
      className="player-page"
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <section className="players-layout">
        <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          OUR TEAM
        </motion.h1>

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
            <motion.div
              className="players-grid"
              variants={sectionStagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
            >
              {group.list.map((player) => (
                <motion.article className="player-card" key={player.id} variants={itemReveal}>
                  <img className="card-image cover" src={`http://localhost:5000${player.cover_image_url}`} alt={`${player.name} cover`} />
                  <img className="card-image photo" src={`http://localhost:5000${player.photo_image_url}`} alt={player.name} />
                  <div className="player-name">{player.name}</div>
                </motion.article>
              ))}
            </motion.div>
          </section>
        ))}
      </section>
    </motion.div>
  );
};

export default Player;
