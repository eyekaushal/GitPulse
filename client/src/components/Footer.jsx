import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <p>
        Built by{' '}
        <a
          href="https://github.com/eyekaushal"
          target="_blank"
          rel="noopener noreferrer"
        >
          Kaushal
        </a>{' '}
        &middot; Powered by the{' '}
        <a
          href="https://docs.github.com/en/rest"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub API
        </a>
      </p>
    </footer>
  );
};

export default Footer;