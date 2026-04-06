import React, { useMemo, useState } from 'react';
import './player.css';

const imageContext = require.context('../assets/players', false, /\.(png|jpe?g)$/);

const players = [
  { name: 'Abhishek Patel', role: 'Bowlers', cover: 'abhishek-cover.jpeg', photo: 'abhishek.jpeg' },
  { name: 'Amsh Prajapati', role: 'All-Rounders', cover: 'amsh-cover.jpeg', photo: 'ansh.jpeg' },
  { name: 'Arjun Solanki', role: 'Batters', cover: 'arjun-cover.jpeg', photo: 'arjun.jpeg' },
  { name: 'Ashutosh Rana', role: 'Bowlers', cover: 'ashutosh-cover.jpeg', photo: 'ashutosh.jpeg' },
  { name: 'Ayush Thakor', role: 'Batters', cover: 'ayush-cover.jpeg', photo: 'ayush.jpeg' },
  { name: 'Bhargav Desai', role: 'Bowlers', cover: 'bhargav-cover.jpeg', photo: 'bhargav.jpeg' },
  { name: 'Chirag Parmar', role: 'All-Rounders', cover: 'chirag-cover.jpeg', photo: 'chirag.jpeg' },
  { name: 'Dhairya Shah', role: 'Wicket Keepers', cover: 'dhairya-cover.jpeg', photo: 'dhairya.jpeg' },
  { name: 'Dhruv Barot', role: 'Bowlers', cover: 'dhruv-b-cover.jpeg', photo: 'dhruv-b.jpeg' },
  { name: 'Dhruv Gajjar', role: 'Wicket Keepers', cover: 'dhruv-g-cover.jpeg', photo: 'dhruv-g.jpeg' },
  { name: 'Jay Chauhan', role: 'All-Rounders', cover: 'jay-cover.jpeg', photo: 'jay.jpeg' },
  { name: 'Lakshyajit Singh', role: 'Batters', cover: 'lakshyajit-cover.jpeg', photo: 'lakshyajit.jpeg' },
  { name: 'Mohit Parmar', role: 'All-Rounders', cover: 'mohit-cover.jpeg', photo: 'mohit.jpeg' },
  { name: 'Pradip Rana', role: 'All-Rounders', cover: 'pradip-cover.jpeg', photo: 'pradip.jpeg' },
  { name: 'Priyanshu Solanki', role: 'Batters', cover: 'priyanshu-cover.jpeg', photo: 'priyanshu.jpeg' },
  { name: 'Raj Patel', role: 'Bowlers', cover: 'raj-cover.jpg', photo: 'raj.jpeg' },
  { name: 'Rajvir Singh', role: 'Batters', cover: 'rajvir-cover.jpeg', photo: 'rajvir.jpeg' },
  { name: 'Shehbaj Khan', role: 'Batters', cover: 'shehbaj-cover.jpeg', photo: 'shehbaj.jpeg' },
  { name: 'Shivendra Singh', role: 'Bowlers', cover: 'shivendra-cover.jpeg', photo: 'shivendra.jpeg' },
  { name: 'Utsavraj Jadeja', role: 'All-Rounders', cover: 'utsavraj-cover.jpeg', photo: 'utsavraj.jpeg' },
  { name: 'Vishv Patel', role: 'Wicket Keepers', cover: 'vishv-cover.jpeg', photo: 'vishv.jpeg' },
  { name: 'Vishvas Trivedi', role: 'Batters', cover: 'vishvas-cover.jpeg', photo: 'vishvas.jpeg' },
  { name: 'Vivaan Shah', role: 'All-Rounders', cover: 'vivaan-cover.jpeg', photo: 'vivaan.jpeg' },
  { name: 'Yugandra Singh', role: 'Bowlers', cover: 'yugandra-cover.jpeg', photo: 'yugandra.jpeg' }
];

const getImg = (fileName) => imageContext(`./${fileName}`);
const roleTabs = ['All', 'Batters', 'All-Rounders', 'Bowlers', 'Wicket Keepers'];

const Player = () => {
  const [activeTab, setActiveTab] = useState('All');

  const visiblePlayers = useMemo(
    () => (activeTab === 'All' ? players : players.filter((player) => player.role === activeTab)),
    [activeTab]
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
                <article className="player-card" key={player.name}>
                  <img className="card-image cover" src={getImg(player.cover)} alt={`${player.name} cover`} />
                  <img className="card-image photo" src={getImg(player.photo)} alt={player.name} />
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
