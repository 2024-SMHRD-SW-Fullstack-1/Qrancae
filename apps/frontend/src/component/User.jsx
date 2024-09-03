import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import { useNavigate } from 'react-router-dom';
import styles from './User.module.css'; // 모듈 CSS를 불러옵니다.

const User = () => {
  const [users, setUsers] = useState([]);

  const navigate = useNavigate();

  // "작업자 등록" 버튼 클릭 시 Register.jsx로 이동
  const handleRegisterClick = () => {
    navigate('/register');
  };

  useEffect(() => {
    axios.get('http://localhost:8089/qrancae/api/users')
      .then(response => {
        setUsers(response.data);
      })
      .catch(error => {
        console.error('유저 정보 가져오기 실패!', error);
      });
  }, []);

  return (
    <div className="wrapper">
      <Sidebar />

      <div className="main-panel">
        <Header />

        <div className="container">
          <div className={styles.pageInner}>
            <div className={styles.pageHeader}>
              <h3 className="fw-bold mb-3">사용자 관리</h3>
              {/* 작업자 등록 버튼을 오른쪽 상단으로 이동 */}
              <label
                className={`btn btn-label-primary btn-round ${styles.btnRegister}`}
                onClick={handleRegisterClick}>
                작업자 등록
              </label>
            </div>

            <div className="row">
              {users.map((user, index) => (
                <div className="col-md-3" key={index}>
                  <div className="card card-profile">
                    <div className="card-body user-card-body">
                      <div className="user-profile text-center">
                        <div className="name">{user.userName}</div>
                        <div className="job">{user.userId}</div>
                        <div className="desc">{user.joinedAt}</div>
                        <div className="view-profile">
                          {/* <a
                            href="#"
                            className="btn btn-primary btn-border btn-round"
                          > */}
                          <div className="view-profile">
                            <label
                              className="btn btn-primary btn-border btn-round"
                              onClick={() => navigate(`/user/${user.userId}`)}
                              style={{ marginTop: '30px' }}
                            >
                              작업자 정보 수정
                            </label>
                          </div>
                          {/* </a> */}
                        </div>
                      </div>
                    </div>
                    <div className="card-footer">
                      <div className="row user-stats text-center">
                        <div className="col">
                          <div className="number">온라인 여부</div>
                          <div className="title">🟢</div>
                        </div>
                        <div className="col">
                          <div className="number">로그 내역</div>
                          <div className="title">12</div>
                        </div>
                        <div className="col">
                          <div className="number">수리 내역</div>
                          <div className="title">03</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default User;