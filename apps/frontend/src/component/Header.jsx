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
  const navigate = useNavigate();
  const [maints, setMaints] = useState([]);
  const [showAlert, setShowAlert] = useState(true); // 알림 표시 상태

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

  useEffect(() => {
    getTodayRepair();
    getMaintMsg(); // 데이터를 가져오는 함수 호출

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
        setCountMsg((prevCount) => prevCount + 1); // 알림 개수 증가
      });
    };
    stompClient.activate();

    return () => {
      if (stompClient) {
        stompClient.deactivate();
      }
    };
  }, []);

  useEffect(() => {
    // repairCnt가 업데이트될 때 countMsg를 업데이트
    setCountMsg(repairCnt.cntNewRepair || 0);
  }, [repairCnt]);

  // 알림div태그
  useEffect(() => {
    // 5초 후 알림 숨기기
    if (showAlert) {
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 5000); // 5초
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
    setIsOpen(!isOpen);
    if (isOpen) {
      setCountMsg(0); // 드롭다운 열 때 알림 개수 초기화
    }
  };

  const getTodayRepair = () => {
    axios({
      url: 'http://localhost:8089/qrancae/todayRepair',
      method: 'get',
    }).then((res) => {
      //console.log('오늘의 점검', res.data);
      setRepairCnt(res.data);
      setCountMsg(res.data.cntNewRepair || 0); // 알림 개수를 신규 접수 건수로 설정
    });

  }
  // 알림 내역가져오기
  const getMaintMsg = () => {
    axios.get('http://localhost:8089/qrancae/maint/msg')
      .then((res) => {
        console.log('신규알림내역', res.data)
        setMaints(res.data)
      })
      .catch((err) => {
        console.log('헤더maintData error:', err);
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
                    {countMsg > 0 ? `${countMsg}개의 알림` : `${adminName}님 알림이 없습니다`} {/* 알림 제목 */}
                  </div>
                </li>
                <li>
                  <div className="notif-scroll scrollbar-outer">
                    <div className="notif-center">
                      {maints.length > 0 ? (
                        maints.map((maint, index) => (
                          <a href="#" key={index}>
                            <div className={`notif-icon notif-${maint.user.user_name}`}>
                              <i className="fas fa-bell"></i>
                            </div>
                            <div className="notif-content">
                              <span className="block">{maint.user.user_name}</span>
                              <span className="block">케이블 {maint.cable.cable_idx} 점검 요청</span>
                              <span className="time">{formatDate(maint.maint_date)}</span>
                            </div>
                          </a>
                        ))
                      ) : (
                        <p style={{ textAlign: 'center' }}>새로운 알림이 없습니다</p>
                      )}
                    </div>
                  </div>
                </li>
                <li>
                  <label onClick={handleRepairClick}>
                    <a className="see-all" href="javascript:void(0);">
                      자세히 보기
                    </a>
                  </label>
                </li>
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
      {showAlert && (
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
          {maints.length > 0 ? (
            <div>
              {(() => {
                const latestMaint = maints[maints.length - 1]; // 최신 항목 가져오기
                let errorMessages = [];

                if (latestMaint.maint_qr === '불량') {
                  errorMessages.push(`QR 상태: <span style="color:red">${latestMaint.maint_qr}</span>`);
                }
                if (latestMaint.maint_cable === '불량') {
                  errorMessages.push(`케이블 상태: <span style="color:red">${latestMaint.maint_cable}</span>`);
                }
                if (latestMaint.maint_power === '불량') {
                  errorMessages.push(`전원 공급 상태: <span style="color:red">${latestMaint.maint_power}</span>`);
                }
                if (latestMaint.maint_msg) {
                  errorMessages.push(`(${latestMaint.maint_msg})`);
                }

                return (
                  <div>
                    <span className="icon-bell"></span>
                    <span className="title">{latestMaint.user?.user_name || '알림 없음'}</span>
                    <span className="message">
                      {formatDate(latestMaint.maint_date || new Date())} - 케이블 {latestMaint.cable?.cable_idx || '없음'} 점검 요청
                      <div dangerouslySetInnerHTML={{ __html: errorMessages.join('<br />') }} />
                    </span>
                  </div>
                );
              })()}
            </div>
          ) : (
            <span className="message">새로운 알림이 없습니다</span>
          )}

          <a href="#" target="_blank" rel="noopener noreferrer"></a>
        </div>
      )}
    </div>
  );
};

export default Header;