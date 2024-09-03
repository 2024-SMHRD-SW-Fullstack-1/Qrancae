import React from 'react';
import { Link, useLocation } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'; //useNavigate지정(선우)
import axios from 'axios';
import Cookies from 'js-cookie';//js-cookie지정(선우)


const Sidebar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const navigate = useNavigate();

  const handleLogout = () => {
    // 서버에 로그아웃 요청을 보내어 세션 무효화
    axios.post('http://localhost:8089/qrancae/api/logout', {}, { withCredentials: true })
      .then(response => {
        if (response.data === '로그아웃 성공') {
          // 클라이언트 측 쿠키 삭제
          Cookies.remove('userId');
          alert('로그아웃 성공');
          navigate('/login'); // 로그인 페이지로 이동
        } else {
          alert('로그아웃 실패');
        }
      })
      .catch(error => {
        console.error('로그아웃 요청 중 오류가 발생했습니다.', error);
        alert('로그아웃 실패');
      });
  };


  const menus = [
    { name: '메인', path: '/home', icon: 'fas fa-home' },
    { name: '점검 관리', path: '/repair', icon: 'fas fa-wrench' },
    { name: 'QR 코드', path: '/qr', icon: 'fas fa-qrcode' },
    { name: '로그 내역', path: '/log', icon: 'fas fa-clipboard-list' },
    { name: '유지보수 내역', path: '/maint', icon: 'fas fa-clipboard-check' },
    { name: '사용자 관리', path: '/user', icon: 'fas fa-user-cog' },
  ];

  const subMenus = [
    { name: '설정', path: '/setting', icon: 'fas fa-cog' },
    {
      name: '로그아웃',
      path: '#', // 로그아웃은 페이지 이동이 아닌 함수 호출이므로 #으로 설정
      icon: 'fas fa-sign-out-alt',
      action: handleLogout // 로그아웃 함수 호출
    },
  ];

  return (
    <div className="sidebar" data-background-color="dark">
      <div className="sidebar-logo">
        <div className="logo-header" data-background-color="dark">
          <Link to="/" className="logo">
            <img
              src="assets/img/kaiadmin/logo_light.svg"
              alt="navbar brand"
              className="navbar-brand"
              height="20"
            />
          </Link>
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
            {menus.map((menu) => {
              return (
                <li key={menu.path} className={`nav-item ${isActive(menu.path) ? 'active' : ''}`}>
                  <Link to={menu.path}>
                    <i className={menu.icon}></i>
                    <p>{menu.name}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
          <hr />
          <ul className="nav nav-secondary">
            {subMenus.map((menu) => (
              <li key={menu.name} className={`nav-item ${isActive(menu.path) ? 'active' : ''}`}>
                <a href={menu.path} onClick={menu.action ? menu.action : null}>
                  <i className={menu.icon}></i>
                  <p>{menu.name}</p>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;