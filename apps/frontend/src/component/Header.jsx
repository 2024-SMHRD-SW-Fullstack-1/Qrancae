import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';
import AIButton from './AIButton';
import Modal from 'react-modal';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

Modal.setAppElement('#root'); // Modal의 접근성 설정

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const period = hours >= 12 ? '오후' : '오전'; // 오전/오후 결정
  const formattedHours = hours % 12 || 12; // 12시간제로 변환, 0은 12로 표시
  return `${period} ${formattedHours.toString().padStart(2, '0')}:${minutes}`;
};

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [advice, setAdvice] = useState('');
  const [countMsg, setCountMsg] = useState(0);
  const [repairCnt, setRepairCnt] = useState([]); // 알림 개수
  const [showAlert, setShowAlert] = useState(false); // 알림 표시 상태
  const [latestMaint, setLatestMaint] = useState(null); // 최신 알림 저장
  const [notifications, setNotifications] = useState([]); // 알림 리스트 상태
  const navigate = useNavigate();
  const [hover, setHover] = useState(false);

  useEffect(() => {
    const storedUserId = Cookies.get('userId'); // userId를 쿠키에서 가져옴
    if (storedUserId) {
      // userId로 사용자 이름을 가져오는 API 호출
      axios
        .get(`${process.env.REACT_APP_API_URL}/api/users/${storedUserId}`)
        .then((response) => {
          const userName = response.data.userName; // 서버에서 받은 사용자 이름
          setAdminName(userName); // 사용자 이름을 저장
        })
        .catch((error) => {
          console.error('사용자 정보 가져오기 실패:', error);
          navigate('/login'); // 실패 시 로그인 페이지로 이동
        });
    } else {
      navigate('/login');
    }
  }, [navigate]);
  // 알림 내역 가져오기
  useEffect(() => {
    const savedCountMsg = localStorage.getItem('countMsg');
    if (savedCountMsg) {
      setCountMsg(parseInt(savedCountMsg, 10));
    }
    getTodayRepair();

    const socket = new SockJS(`${process.env.REACT_APP_API_URL}/api/ws`);
    const stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        login: 'user',
        passcode: 'password',
      },
      debug: (str) => {
        console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    stompClient.onConnect = () => {
      stompClient.subscribe('/topic/notifications', (message) => {
        const notification = JSON.parse(message.body);
        console.log('메시지', notification);
        setLatestMaint(notification); // 최신 알림 상태 업데이트
        setCountMsg((prevCount) => {
          const newCount = prevCount + 1;
          localStorage.setItem('countMsg', newCount);
          return newCount;
        });
        setNotifications((prevNotifications) => {
          const updatedNotifications = [notification, ...prevNotifications];
          localStorage.setItem(
            'notifications',
            JSON.stringify(updatedNotifications)
          );
          return updatedNotifications;
        });
        setShowAlert(true); // 알림 표시 상태 업데이트
      });
    };
    stompClient.activate();

    return () => {
      if (stompClient) {
        stompClient.deactivate();
      }
    };
  }, []);

  // 알림div태그
  useEffect(() => {
    // 5초 후 알림 숨기기
    if (showAlert) {
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 9000); // 5초
      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  const handleAIButtonClick = (advice) => {
    setAdvice(advice);
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const toggleDropdown = () => {
    // 드롭다운 열기/닫기 상태 변경
    setIsOpen((prevOpen) => {
      const newOpen = !prevOpen;

      // 드롭다운이 열릴 때 알림 개수를 리셋
      if (newOpen && countMsg > 0) {
        setCountMsg(0);
        localStorage.setItem('countMsg', '0');
      }

      return newOpen;
    });
  };

  const getTodayRepair = () => {
    axios({
      url: `${process.env.REACT_APP_API_URL}/api/todayRepair`,
      method: 'get',
    }).then((res) => {
      //console.log('오늘의 점검', res.data);
      setRepairCnt(res.data);
    });
  };

  const handleRepairClick = () => {
    navigate('/repair');
  };

  return (
    <div className="main-header">
      <div className="main-header-logo">
        <div className="logo-header" data-background-color="dark">
          {/* 로고 클릭 시 메인 화면 이동 */}
          <Link to="/home">
            <img
              src="assets/img/logo_white.png"
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
            <Link to="/repair">
              <i className="gg-more-vertical-alt"></i>
            </Link>
          </button>
        </div>
      </div>
      <nav className="navbar navbar-header navbar-header-transparent navbar-expand-lg border-bottom">
        <div
          className="today-repair"
          style={{
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            width: '70%',
          }}
        >
          <label
            className="btn btn-primary btn-border btn-round"
            onClick={handleRepairClick}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontWeight: 'bold',
              }}
            >
              <div>오늘의 점검</div>
              <div>|</div>
              <div style={{ color: '#0DB624' }}>신규 접수</div>
              <div>{repairCnt.cntNewRepair}건</div>
              <div style={{ color: '#939393' }}>진행 중</div>
              <div>{repairCnt.cntInProgressRepair}건</div>
              <div style={{ color: '#EE38AE' }}>보수 완료</div>
              <div>{repairCnt.cntCompleteRepair}건</div>
            </div>
          </label>
        </div>
        <div className="container-fluid">
          <ul className="navbar-nav topbar-nav align-items-center">
            {/* Timer 컴포넌트를 좌측에 배치 */}
            <li className="nav-item"></li>
          </ul>
          <ul className="navbar-nav topbar-nav ms-md-auto align-items-center">
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
                onMouseOver={() => setHover(true)}
                onMouseOut={() => setHover(false)}
                style={{
                  backgroundColor: hover ? 'transparent' : 'transparent', // hover 시 배경색 유지
                  color: hover ? '#4574C4' : '#8a95a0', // hover 시 아이콘 색상 변경
                  textDecoration: 'none', // 링크 장식 제거
                }}
              >
                <i className="fa fa-bell"></i>
                {/* 알림 아이콘 */}
                {countMsg > 0 && (
                  <span className="notification">{countMsg}</span>
                )}
                {/* 알림 개수 표시 */}
              </a>
              <ul
                className={`dropdown-menu notif-box animated fadeIn ${isOpen ? 'show' : ''}`}
                aria-labelledby="notifDropdown"
              >
                <li>
                  <div className="dropdown-title">
                    {countMsg > 0 ? (
                      `${countMsg}개의 알림`
                    ) : (
                      <>
                        <span style={{ color: '#4574C4' }}>{adminName}</span> 님
                        알림 내역
                      </>
                    )}
                  </div>
                </li>
                <li>
                  <div className="notif-scroll scrollbar-outer">
                    <div className="notif-center">
                      {notifications.length > 0 ? (
                        notifications.map((notification, index) => (
                          <Link
                            to="/repair"
                            key={index}
                            style={{ textDecoration: 'none' }}
                          >
                            <div
                              className={`notif-icon notif-${notification.user_name}`}
                            >
                              <i
                                className="fas fa-bell"
                                style={{ color: '#ffad46' }}
                              ></i>
                            </div>
                            <div className="notif-content">
                              <span className="block">
                                {notification.user_name}
                              </span>
                              <span className="block">
                                케이블 {notification.cable_idx} 점검 요청
                              </span>
                              <span className="time">
                                {formatDate(notification.maint_date)}
                              </span>
                            </div>
                          </Link>
                        ))
                      ) : (
                        <p style={{ textAlign: 'center', margin: '20px' }}>
                          새로운 알림이 없습니다
                        </p>
                      )}
                    </div>
                  </div>
                </li>
                <li>
                  {countMsg > 0 ? (
                    <label onClick={handleRepairClick}>
                      <a className="see-all" href="javascript:void(0);">
                        자세히 보기
                        <i
                          className="fas fa-chevron-right"
                          style={{ marginLeft: '8px' }}
                        ></i>
                      </a>
                    </label>
                  ) : (
                    <a className="see-all" href="/repair">
                      점검 관리로 이동
                      <i
                        className="fas fa-chevron-right"
                        style={{ marginLeft: '8px' }}
                      ></i>
                    </a>
                  )}
                </li>
              </ul>
            </li>
            <li
              className="nav-item topbar-user dropdown hidden-caret"
              style={{ marginRight: '2rem' }}
            >
              <a
                className="dropdown-toggle profile-pic"
                data-bs-toggle="dropdown"
                href="#"
                aria-expanded="false"
                style={{ pointerEvents: 'none' }} // 클릭 불가능하게 설정
              >
                {/* <div className="avatar-sm">
                  <img
                    src="assets/img/profile.jpg"
                    alt="..."
                    className="avatar-img rounded-circle"
                  />
                </div> */}
                <span className="profile-username">
                  <span className="fw-bold">{adminName}</span>
                  <span className="op-7"> 님 환영합니다!</span>
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
                        <h4>Hizrian</h4>
                        {/* 사용자 이름 */}
                        <p className="text-muted">hello@example.com</p>
                        {/* 사용자 이메일 */}
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
      {showAlert && latestMaint && (
        <div
          className="col-10 col-xs-11 col-sm-4 alert alert-secondary animated fadeInUp"
          role="alert"
          style={{
            display: 'inline-block',
            width: '350px', // 가로 길이 조정
            margin: '0px auto',
            paddingLeft: '30px', // 패딩 조정
            position: 'fixed',
            transition: '0.8s ease-in-out', // 사라지는 시간
            zIndex: 1031,
            bottom: '20px',
            right: '20px',
          }}
        >
          <button
            type="button"
            aria-hidden="true"
            className="close"
            style={{
              position: 'absolute',
              right: '10px',
              top: '5px',
              zIndex: 1033,
            }}
            onClick={() => setShowAlert(false)}
          >
            &times;
          </button>
          <div className="alert-header">
            <h6 className="alert-title">
              <span style={{ fontWeight: 'bold' }}>
                {latestMaint.user_name}
              </span>{' '}
              ({formatDate(latestMaint.maint_date)})
            </h6>
          </div>
          <div className="alert-body">
            <div>
              <span>
                케이블 <strong>{latestMaint.cable_idx}</strong> 점검 요청
              </span>
            </div>
            <div>
              {[
                latestMaint.maint_qr === '불량' && 'QR 상태: 불량',
                latestMaint.maint_cable === '불량' && '케이블 상태: 불량',
                latestMaint.maint_power === '불량' && '전원 상태: 불량',
              ]
                .filter(Boolean) // '불량' 상태만 남기기
                .map((status, index, array) => {
                  // 각 상태 메시지에서 '불량'만 빨간색으로 변경
                  const parts = status.split('불량');
                  return (
                    <span key={index}>
                      {parts[0]}
                      <span style={{ color: 'red' }}>불량</span>
                      {parts[1]}
                      {index < array.length - 1 && ', '}{' '}
                      {/* 마지막 항목에는 쉼표를 추가하지 않음 */}
                    </span>
                  );
                })}
            </div>
          </div>
          <a href="#" target="_blank" rel="noopener noreferrer"></a>
        </div>
      )}
    </div>
  );
};

export default Header;
