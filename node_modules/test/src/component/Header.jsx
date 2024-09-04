import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Timer from './Timer';
import AIButton from './AIButton';
import Modal from 'react-modal';
//import SockJS from 'sockjs-client';
//import { Client } from '@stomp/stompjs';

Modal.setAppElement('#root'); // Modal의 접근성 설정

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [advice, setAdvice] = useState('');
  //  const [notifications, setNotifications] = useState([]); // 알림을 저장할 상태
  const navigate = useNavigate();

  useEffect(() => {
    const storedAdminName = Cookies.get('userId');
    if (storedAdminName) {
      setAdminName(storedAdminName);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  /* useEffect(() => {
    const socket = new SockJS('http://localhost:8089/qrancae/ws');
    const stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        login: 'user',
        passcode: 'password',
      },
      debug: function (str) {
        console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        stompClient.subscribe('/topic/notifications', (message) => {
          const notification = JSON.parse(message.body);
          console.log("메시지", notification);
          setNotifications((prevNotifications) => [...prevNotifications, notification]);
        });
      },
    });

    stompClient.activate();

    return () => {
      if (stompClient) {
        stompClient.deactivate();
      }
    };
  }, []); */

  const handleAIButtonClick = (advice) => {
    setAdvice(advice);
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="main-header">
      <div className="main-header-logo">
        <div className="logo-header" data-background-color="dark">
          <a href="index.html" className="logo">
            <img
              src="assets/img/kaiadmin/logo_light.svg"
              alt="navbar brand"
              className="navbar-brand"
              height="20"
            />
          </a>
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
      <nav className="navbar navbar-header navbar-header-transparent navbar-expand-lg border-bottom">
        <div className="container-fluid">
          <ul className="navbar-nav topbar-nav align-items-center">
            {/* Timer 컴포넌트를 좌측에 배치 */}
            <li className="nav-item">
              <Timer />
            </li>
          </ul>
          <ul className="navbar-nav topbar-nav ms-md-auto align-items-center">
            <a href="#">
              <div className="notif-icon notif-primary">
                <i className="fa fa-user-plus"></i>
              </div>
              <div className="notif-content">
                <span className="block"></span>
                <span className="time">just now</span>
              </div>
            </a>
            <li className="nav-item">
              <AIButton onAIButtonClick={handleAIButtonClick} />
            </li>
            {/* 알림 드롭다운 메뉴 */}
            <li className="nav-item topbar-icon dropdown hidden-caret">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                id="notifDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded={isOpen}
                onClick={toggleDropdown}
              >
                <i className="fa fa-bell"></i>{/* 알림 아이콘 */}
                <span className="notification">3</span>{/* 알림 개수 표시 */}
              </a>
              <ul
                className={`dropdown-menu notif-box animated fadeIn ${isOpen ? 'show' : ''}`}
                aria-labelledby="notifDropdown"
              >
                <li>
                  <div className="dropdown-title">
                    You have 3 new notification{/* 알림 제목 */}
                  </div>
                </li>
                <li>
                  <div className="notif-scroll scrollbar-outer">
                    <div className="notif-center">
                      {/* 개별 알림 항목들 */}
                      <a href="#">
                        <div className="notif-icon notif-primary">
                          <i className="fa fa-user-plus"></i>
                        </div>
                        <div className="notif-content">
                          <span className="block"></span>
                          <span className="time">just now</span>
                        </div>
                      </a>
                    </div>
                  </div>
                </li>
                <li>
                  <a className="see-all" href="javascript:void(0);">
                    See all notifications<i className="fa fa-angle-right"></i>
                  </a>
                </li>
              </ul>
            </li>
            {/* 사용자 프로필 드롭다운 메뉴 */}
            <li className="nav-item topbar-user dropdown hidden-caret">
              <a
                className="dropdown-toggle profile-pic"
                data-bs-toggle="dropdown"
                href="#"
                aria-expanded="false"
              >
                <div className="avatar-sm">
                  <img
                    src="assets/img/profile.jpg"
                    alt="..."
                    className="avatar-img rounded-circle"
                  />
                </div>
                <span className="profile-username">
                  <span className="fw-bold">{adminName}</span>
                  <span className="op-7">님 환영합니다!</span>
                </span>
              </a>
              <ul className="dropdown-menu dropdown-user animated fadeIn">
                <div className="dropdown-user-scroll scrollbar-outer">
                  <li>
                    <div className="user-box">
                      <div className="avatar-lg">
                        <img
                          src="assets/img/profile.jpg"
                          alt="image profile"
                          className="avatar-img rounded"
                        />
                      </div>
                      <div className="u-text">
                        <h4>Hizrian</h4>{/* 사용자 이름 */}
                        <p className="text-muted">hello@example.com</p>{/* 사용자 이메일 */}
                        <a
                          href="profile.html"
                          className="btn btn-xs btn-secondary btn-sm"
                        >
                          View Profile{/* 프로필 보기 버튼 */}
                        </a>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="dropdown-divider"></div>
                    <a className="dropdown-item" href="#">
                      My Profile
                    </a>
                    <a className="dropdown-item" href="#">
                      My Balance
                    </a>
                    <a className="dropdown-item" href="#">
                      Inbox
                    </a>
                    <div className="dropdown-divider"></div>
                    <a className="dropdown-item" href="#">
                      Account Setting
                    </a>
                    <div className="dropdown-divider"></div>
                    <a className="dropdown-item" href="#">
                      Logout
                    </a>
                  </li>
                </div>
              </ul>
            </li>
          </ul>
        </div>
      </nav>
      {/* 팝업 창 */}
      {showPopup && (
        <Modal
          isOpen={showPopup}
          onRequestClose={handleClosePopup}
          contentLabel="점검 추천"
          className="popup-content"
          overlayClassName="popup-overlay"
        >
          <h2>점검 추천</h2>
          <p>{advice}</p>
          <button onClick={handleClosePopup} className="btn btn-secondary">
            닫기
          </button>
        </Modal>
      )}
    </div>
  );
};

export default Header;
