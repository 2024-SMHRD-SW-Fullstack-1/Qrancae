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
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [advice, setAdvice] = useState('');
  const [countMsg, setCountMsg] = useState(0);
  const [repairCnt, setRepairCnt] = useState([]);// 알림 개수
  const [showAlert, setShowAlert] = useState(false); // 알림 표시 상태
  const [latestMaint, setLatestMaint] = useState(null); // 최신 알림 저장
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserId = Cookies.get('userId'); // userId를 쿠키에서 가져옴
    if (storedUserId) {
      // userId로 사용자 이름을 가져오는 API 호출
      axios.get(`http://localhost:8089/qrancae/api/users/${storedUserId}`)
        .then(response => {
          const userName = response.data.userName; // 서버에서 받은 사용자 이름
          setAdminName(userName); // 사용자 이름을 저장
        })
        .catch(error => {
          console.error('사용자 정보 가져오기 실패:', error);
          navigate('/login'); // 실패 시 로그인 페이지로 이동
        });
    } else {
      navigate('/login');
    }
  }, [navigate]);
  // 알림 내역 가져오기
  useEffect(() => {
    getTodayRepair();

    const socket = new SockJS('http://localhost:8089/qrancae/ws');
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
        console.log("메시지", notification);
        setLatestMaint(notification); // 최신 알림 상태 업데이트
        setCountMsg(prevCount => prevCount + 1); // 알림 개수 증가
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
    setIsOpen(prevOpen => {
      if (!prevOpen) {
        // 드롭다운이 닫혀있을 때 열리면 알림 개수를 0으로 설정
        setCountMsg(0);
      }
      return !prevOpen;
    });
  };

  const getTodayRepair = () => {
    axios({
      url: 'http://localhost:8089/qrancae/todayRepair',
      method: 'get',
    }).then((res) => {
      //console.log('오늘의 점검', res.data);
      setRepairCnt(res.data);
    });

  }

  const handleRepairClick = () => {
    navigate('/repair');
  }

  return (
    <div className="main-header">
      <div className="main-header-logo">
        <div className="logo-header" data-background-color="dark">
          {/* 로고 클릭 시 메인 화면 이동 */}
          <Link to='/home'>
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
      <nav className="navbar navbar-header navbar-header-transparent navbar-expand-lg border-bottom">
        <div className='today-repair' style={{ border: 'none', display: 'flex', alignItems: 'center', width: '70%' }}>
          <label className='btn btn-primary btn-border btn-round' onClick={handleRepairClick}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold' }}>
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
              >
                <i className="fa fa-bell"></i>{/* 알림 아이콘 */}
                {countMsg > 0 && <span className="notification">{countMsg}</span>}{/* 알림 개수 표시 */}
              </a>
              <ul
                className={`dropdown-menu notif-box animated fadeIn ${isOpen ? 'show' : ''}`}
                aria-labelledby="notifDropdown"
              >
                <li>
                  <div className="dropdown-title">
                    {countMsg > 0 ? `${countMsg}개의 알림` : `${adminName} 님 알림 내역`} {/* 알림 제목 */}
                  </div>
                </li>
                <li>
                  <div className="notif-scroll scrollbar-outer">
                    <div className="notif-center">
                      {latestMaint ? (
                        <a href="#">
                          <div className={`notif-icon notif-${latestMaint.user_name}`}>
                            <i className="fas fa-bell"></i>
                          </div>
                          <div className="notif-content">
                            <span className="block">{latestMaint.user_name}</span>
                            <span className="block">케이블 {latestMaint.cable_idx} 점검 요청</span>
                            <span className="time">{formatDate(latestMaint.maint_date)}</span>
                          </div>
                        </a>
                      ) : (
                        <p style={{ textAlign: 'center' }}>새로운 알림이 없습니다</p>
                      )}
                    </div>
                  </div>
                </li>
                {countMsg > 0 && ( // 알림이 있을 때만 자세히 보기 표시
                  <li>
                    <label onClick={handleRepairClick}>
                      <a className="see-all" href="javascript:void(0);">
                        자세히 보기
                      </a>
                    </label>
                  </li>
                )}
              </ul>
            </li>
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
      {showAlert && latestMaint && (
        <div
          className="col-10 col-xs-11 col-sm-4 alert alert-secondary animated fadeInUp"
          role="alert"
          style={{
            display: 'inline-block',
            margin: '0px auto',
            paddingLeft: '65px',
            position: 'fixed',
            transition: '0.5s ease-in-out',
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
          {showAlert && latestMaint && ( // 최신 알림이 있을 때만 표시
            <div className="alert alert-info">
              <div className="alert-header">
                <h6 className="alert-title">{latestMaint.user_name}</h6>
                <span className="alert-time">{formatDate(latestMaint.maint_date)}</span>
              </div>
              <div className="alert-body">
                {`케이블 ${latestMaint.cable_idx} 점검 요청`}
                <div>
                  {[
                    latestMaint.maint_qr === '불량' && 'QR 상태: 불량',
                    latestMaint.maint_cable === '불량' && '케이블 상태: 불량',
                    latestMaint.maint_power === '불량' && '전원 상태: 불량'
                  ]
                    .filter(Boolean) // '불량' 상태만 남기기
                    .join(', ')} {/* 쉼표로 구분하여 한 줄로 출력 */}
                </div>
              </div>
            </div>
          )}

          <a href="#" target="_blank" rel="noopener noreferrer"></a>
        </div>
      )}
    </div>
  );
};

export default Header;