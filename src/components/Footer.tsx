import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>Built by <strong>Akshat Behera</strong></p>
        <p>&copy; {new Date().getFullYear()} CosmicX — All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
