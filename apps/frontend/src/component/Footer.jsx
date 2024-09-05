import React from 'react';
import Chatgpt from './Chatgpt';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container-fluid d-flex justify-content-between align-items-center">
        <nav className="d-flex">
          <ul className="nav d-flex">
            <li className="nav-item">
              <a className="nav-link project-team" href="https://github.com/hyoj1201">
                곽효정
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link project-team" href="https://github.com/kimkeonlee">
                김건이
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link project-team" href="https://github.com/LeeSeungJi27">
                이승지
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link project-team" href="https://github.com/17season">
                박선우
              </a>
            </li>
            <li>
              <Chatgpt />
            </li>
          </ul>
        </nav>
        <div className="copyright text-center flex-grow-1">
          QR코드 기반 케이블 관리자 프로그램
        </div>
        <div className="text-end">
          큐랑께
          <a
            target="_blank"
            href="https://github.com/2024-SMHRD-SW-Fullstack-1/Qrancae"
            rel="noopener noreferrer"
            className='project-team'
            style={{ marginLeft: '.5rem', fontWeight: 'bold' }}
          >
            GIT HUB
          </a>
          .
        </div>
      </div>
    </footer >
  );
};

export default Footer;
