import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="sidebar" data-background-color="dark">
      <div className="sidebar-logo">
        <div className="logo-header" data-background-color="dark">
          <a href="index.html" className="logo">
            <img
              src="assets/img/kaiadmin/logo_light.svg"
              alt="navbar brand"
              className="navbar-brand"
              height="20"
            />
          </a>
        </div>
      </div>
      <div className="sidebar-wrapper scrollbar scrollbar-inner">
        <div className="sidebar-content">
          <ul className="nav nav-secondary">
            <li className="nav-item">
              <Link to="/">메인</Link>
            </li>
            <li className="nav-item">
              <Link to="/qr">QR 코드</Link>
            </li>
            <li className="nav-item">
              <Link to="/log">로그 내역</Link>
            </li>
            <li className="nav-item">
              <Link to="/maint">유지보수 내역</Link>
            </li>
            <li className="nav-item">
              <Link to="/user">사용자 관리</Link>
            </li>
            <li className="nav-item">
              <Link to="/chart">차트</Link>
            </li>
            <hr />
            <li className="nav-item">
              <Link to="/form">설정</Link>
            </li>
            <li className="nav-item">
              <Link to="/logout">로그아웃</Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
