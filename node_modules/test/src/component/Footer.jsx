import React from 'react';
import Chatgpt from './Chatgpt';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container-fluid d-flex justify-content-between">
        <nav className="pull-left">
          <ul className="nav">
            <li className="nav-item">
              <a className="nav-link" href="http://www.themekita.com">
                ThemeKita
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">
                {' '}
                Help{' '}
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">
                {' '}
                Licenses{' '}
              </a>
            </li>
            <li>
              <Chatgpt/>
            </li>
          </ul>
        </nav>
        <div className="copyright">
          QR코드 기반 케이블 관리자 시스템<i className="fa fa-heart heart text-danger"></i> by
          <a href="http://www.themekita.com">ThemeKita</a>
        </div>
        <div>
          Distributed by
          <a
            target="_blank"
            href="https://themewagon.com/"
            rel="noopener noreferrer"
          >
            ThemeWagon
          </a>
          .
        </div>
      </div>
    </footer>
  );
};

export default Footer;
