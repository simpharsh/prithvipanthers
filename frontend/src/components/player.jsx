import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './player.css';
import { itemReveal, pageTransition, sectionStagger } from '../utils/pageMotion';
import { fetchWithFallback } from '../utils/fetchWithFallback';

const roleTabs = ['All', 'Batters', 'All-Rounders', 'Bowlers', 'Wicket Keepers'];

const Player = () => {
  const [players, setPlayers] = useState([]);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    let isMounted = true;

    const loadPlayers = async () => {
      try {
        const response = await fetchWithFallback('/api/players');
        const data = await response.json();
        const normalizedPlayers = Array.isArray(data)
          ? data.filter((player) => player?.is_active !== false)
          : Array.isArray(data?.players)
            ? data.players.filter((player) => player?.is_active !== false)
            : [];

        if (isMounted) setPlayers(normalizedPlayers);
      } catch (error) {
        console.error('Failed to load players:', error.message);
      }
    };

    loadPlayers();
    
    // View Tracker
    fetchWithFallback('/api/track-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: 'player' })
    }).catch(() => {});

    return () => {
      isMounted = false;
    };
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
        <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
          OUR TEAM
        </motion.h1>

        <motion.div
          className="player-filters"
          role="tablist"
          aria-label="Player role filters"
          variants={sectionStagger}
          initial="hidden"
          animate="visible"
        >
          {roleTabs.map((tab) => (
            <motion.button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              className={`filter-chip ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
              variants={itemReveal}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {tab}
            </motion.button>
          ))}
        </motion.div>

        {playersByRole.map((group) => (
          <motion.section
            key={group.role}
            className="role-section"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.h2 initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>{group.role}</motion.h2>
            <motion.div
              className="players-grid"
              variants={sectionStagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
            >
              {group.list.map((player) => (
                <motion.article className="player-card" key={player.id} variants={itemReveal} whileHover={{ y: -4 }} transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}>
                  {player.player_image_url ? (
                    <img className="card-image player-thumbnail" src={player.player_image_url} alt={`${player.name} profile`} />
                  ) : null}
                  <img className="card-image cover" src={player.cover_image_url} alt={`${player.name} cover`} />
                  <img className="card-image photo" src={player.photo_image_url} alt={player.name} />
                  <div className="player-name">{player.name}</div>
                </motion.article>
              ))}
            </motion.div>
          </motion.section>
        ))}
      </section>
    </motion.div>
  );
};

export default Player;
