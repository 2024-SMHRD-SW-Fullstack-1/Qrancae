import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import UserDetail from './UserDetail'; // UserDetail 임포트
import { useNavigate } from 'react-router-dom';
import styles from './User.module.css';

const User = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null); // 선택된 사용자 ID 저장
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태 관리

  const navigate = useNavigate();

  // "작업자 등록" 버튼 클릭 시 Register.jsx로 이동
  const handleRegisterClick = () => {
    navigate('/register');
  };

  // 모달 열기 함수
  const openModal = (userId) => {
    setSelectedUserId(userId);
    setIsModalOpen(true);
  };

  // 모달 닫기 함수
  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    axios
      .get('http://localhost:8089/qrancae/api/users')
      .then((response) => {
        const userData = response.data;
        const logRequests = userData.map((user) =>
          axios.get(`http://localhost:8089/qrancae/api/logs/count/${user.userId}`)
        );
        const maintRequests = userData.map((user) =>
          axios.get(`http://localhost:8089/qrancae/api/maint/count/${user.userId}`)
        );

        Promise.all([...logRequests, ...maintRequests])
          .then((responses) => {
            const logResponses = responses.slice(0, userData.length);
            const maintResponses = responses.slice(userData.length);

            const updatedUsers = userData.map((user, index) => ({
              ...user,
              logCount: logResponses[index].data,
              maintCount: maintResponses[index].data,
            }));
            setUsers(updatedUsers);
          })
          .catch((error) => {
            console.error('정보 가져오기 실패!', error);
          });
      })
      .catch((error) => {
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
              <button
                className={`btn btn-label-primary btn-round`}
                onClick={handleRegisterClick}>
                <span className="btn-label">
                  <i className="fas fa-user-plus icon-spacing"></i>
                </span>
                작업자 등록
              </button>
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
                          <button
                            className="btn btn-primary btn-border btn-round"
                            onClick={() => openModal(user.userId)}
                            style={{ marginTop: '30px' }}
                          >
                            작업자 정보 수정
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="card-footer">
                      <div className="row user-stats text-center">
                        <div className="col">
                          <div className="number">로그 내역</div>
                          <div className="title">{user.logCount || 0}</div>
                        </div>
                        <div className="col">
                          <div className="number">수리 내역</div>
                          <div className="title">{user.maintCount || 0}</div>
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

        {/* 모달 영역 */}
        {isModalOpen && (
          <UserDetail
            userId={selectedUserId}
            isOpen={isModalOpen}
            onClose={closeModal}
          />
        )}
      </div>
    </div>
  );
};

export default User;
