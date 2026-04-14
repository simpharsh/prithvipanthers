import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './player.css';
import { itemReveal, pageTransition, sectionStagger } from '../utils/pageMotion';
import { supabase } from '../utils/supabaseClient';

const roleTabs = ['All', 'Batters', 'All-Rounders', 'Bowlers', 'Wicket Keepers'];

const Player = () => {
  const [players, setPlayers] = useState([]);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    let isMounted = true;

    const loadPlayers = async () => {
      try {
        const response = await fetch('/api/players');
        if (!response.ok) throw new Error('Players API request failed');

        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          throw new Error('Players API returned non-JSON response');
        }

        const data = await response.json();
        const normalizedPlayers = Array.isArray(data)
          ? data
          : Array.isArray(data?.players)
            ? data.players
            : [];

        if (isMounted) setPlayers(normalizedPlayers);
        return;
      } catch (error) {
        console.warn('Players API unavailable, falling back to Supabase:', error.message);
      }

      if (!supabase) return;

      const { data, error } = await supabase
        .from('players')
        .select('id, name, role, cover_image_url, photo_image_url')
        .order('id', { ascending: true });

      if (!error && isMounted) {
        setPlayers(Array.isArray(data) ? data : []);
      }
    };

    loadPlayers();
    
    // View Tracker
    fetch('/api/track-view', {
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
                  <img className="card-image cover" src={player.cover_image_url} alt={`${player.name} cover`} />
                  <img className="card-image photo" src={player.photo_image_url} alt={player.name} />
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
