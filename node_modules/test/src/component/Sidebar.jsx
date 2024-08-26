import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const menus = [
    { name: '메인', path: '/', icon: 'fas fa-home' },
    { name: 'QR 코드', path: '/qr', icon: 'fas fa-qrcode' },
    { name: '로그 내역', path: '/log', icon: 'fas fa-clipboard-list' },
    { name: '유지보수 내역', path: '/maint', icon: 'fas fa-clipboard-check' },
    { name: '사용자 관리', path: '/user', icon: 'fas fa-user-cog' },
    { name: '차트', path: '/charts', icon: 'far fa-chart-bar' },
  ];

  const subMenus = [
    { name: '설정', path: '/setting', icon: 'fas fa-cog' },
    { name: '로그아웃', path: '/', icon: 'fas fa-sign-out-alt' },
  ];

  return (
    <div className="sidebar" data-background-color="dark">
      <div className="sidebar-logo">
        <div className="logo-header" data-background-color="dark">
          <NavLink to="/" className="logo">
            <img
              src="assets/img/kaiadmin/logo_light.svg"
              alt="navbar brand"
              className="navbar-brand"
              height="20"
            />
          </NavLink>
          <div className="nav-toggle">
            <button className="btn btn-toggle toggle-sidebar">
              <i className="gg-menu-right"></i>
            </button>
            <button className="btn btn-toggle sidenav-toggler">
              <i className="gg-menu-left"></i>
            </button>
          </div>
          <button className="topbar-toggler more">
            <i className="gg-more-vertical-alt"></i>
          </button>
        </div>
      </div>
      <div className="sidebar-wrapper scrollbar scrollbar-inner">
        <div className="sidebar-content">
          <ul className="nav nav-secondary">
            {menus.map((menu, index) => {
              return (
                <li className="nav-item">
                  <NavLink to={menu.path} key={index}>
                    <i className={menu.icon}></i>
                    <p>{menu.name}</p>
                  </NavLink>
                </li>
              );
            })}
          </ul>
          <hr />
          <ul className="nav nav-secondary">
            {subMenus.map((menu, index) => {
              return (
                <li className="nav-item">
                  <NavLink to={menu.path} key={index}>
                    <i className={menu.icon}></i>
                    <p>{menu.name}</p>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
