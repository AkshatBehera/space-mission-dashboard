import { useMemo } from 'react';

const socialLinks = [
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/akshat-behera',
    iconClass: 'fa-brands fa-linkedin-in',
    color: '#0A66C2',
  },
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/akshatbehera/',
    iconClass: 'fa-brands fa-instagram',
    color: '#E4405F',
  },
  {
    name: 'X',
    url: 'https://x.com/akshatbehera',
    iconClass: 'fa-brands fa-x-twitter',
    color: '#000',
  },
  {
    name: 'Portfolio',
    url: 'https://akshatbehera.github.io/akshatbeheraonline/',
    iconClass: 'fas fa-globe',
    color: '#4FC3F7',
  },
];

const spaceQuotes = [
  "That's one small step for man, one giant leap for mankind. — Neil Armstrong",
  "The Earth is the only world known so far to harbor life. — Carl Sagan",
  "Two things are infinite: the universe and human stupidity; and I'm not sure about the universe. — Albert Einstein",
  "The cosmos is within us. We are made of star-stuff. — Carl Sagan",
  "Ad Astra per Aspera — Through hardships to the stars",
  "The sky is not the limit, it's just the beginning.",
];

const Contact = () => {
  const randomQuote = useMemo(
    () => spaceQuotes[Math.floor(Math.random() * spaceQuotes.length)],
    []
  );

  return (
    <div className="container">
      <h1 className="page-title">Contact & Developer</h1>

      {/* Connect With Me */}
      <section className="card">
        <div className="card-header">
          <i className="fas fa-link"></i> Connect With Me
        </div>
        <div className="social-grid">
          {socialLinks.map(link => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="social-card"
            >
              <div className="social-icon-circle" style={{ background: link.color }}>
                <i className={link.iconClass}></i>
              </div>
              <span className="social-name">{link.name}</span>
            </a>
          ))}
        </div>
      </section>

      {/* Project Info */}
      <div className="grid-container grid-2">
        <section className="card">
          <div className="card-header">
            <i className="fas fa-code"></i> About This Project
          </div>
          <div className="info-text">
            <p>
              CosmicX Space Mission Dashboard was built using modern web technologies:
            </p>
            <ul className="tech-list">
              <li><span className="dot"></span>React with TypeScript</li>
              <li><span className="dot"></span>Vite for blazing-fast builds</li>
              <li><span className="dot"></span>Leaflet.js for interactive maps</li>
              <li><span className="dot"></span>NASA APIs for real-time data</li>
              <li><span className="dot"></span>Canvas API for simulations</li>
              <li><span className="dot"></span>Responsive Grid & Flexbox layouts</li>
            </ul>
            <p>
              The dashboard tracks the ISS in real-time, monitors near-Earth asteroids, 
              and visualizes solar system dynamics — all updated live.
            </p>
          </div>
        </section>

        <section className="card">
          <div className="card-header">
            <i className="fas fa-check-circle"></i> Technical Features
          </div>
          <div className="info-text">
            <ul className="feature-list">
              <li>Real-time ISS position tracking</li>
              <li>Live asteroid monitoring</li>
              <li>Earth–Sun & Solar System simulations</li>
              <li>Sunrise & sunset calculator</li>
              <li>Space trivia quiz</li>
              <li>Extreme mobile responsiveness</li>
              <li>Ambient space audio</li>
              <li>Scrolling space facts ticker</li>
              <li>24/7 ISS Live Camera Feed</li>
            </ul>
          </div>
        </section>
      </div>

      {/* Inspiration Quote */}
      <section className="card quote-card">
        <div className="card-header">
          <i className="fas fa-quote-left"></i> Inspiration
        </div>
        <blockquote className="inspiration-quote">
          "{randomQuote}"
        </blockquote>
        <p className="quote-sub">
          Inspired by humanity's endless curiosity about space and the incredible 
          work being done by NASA and international space agencies.
        </p>
      </section>
    </div>
  );
};

export default Contact;
