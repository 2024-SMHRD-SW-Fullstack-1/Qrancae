import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';

const UserDetail = ({ userId, isOpen, onClose }) => {
  const [userPw, setUserPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/users/${userId}`)
      .then(({ data }) => {
        const user = data;
        setUserPw(user.userPw);
        setUserName(user.userName);
        setUserEmail(user.userEmail);
      })
      .catch((error) => {
        console.error('유저 정보 가져오기 실패!', error);
      });
  }, [userId]);

  const handleUpdate = () => {
    let newErrors = {};

    if (!userPw) newErrors.userPw = '*비밀번호를 입력해주세요.';
    if (userPw !== confirmPw)
      newErrors.confirmPw = '*비밀번호가 일치하지 않습니다.';
    if (!userName) newErrors.userName = '*이름을 입력해주세요.';
    if (!userEmail) newErrors.userEmail = '*이메일을 입력해주세요.';
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    axios
      .put(`${process.env.REACT_APP_API_URL}/api/users/${userId}`, {
        userPw: userPw,
        userName: userName,
        userEmail: userEmail,
      })
      .then(() => {
        alert('작업자 정보가 수정되었습니다.');
        onClose();
        window.location.reload(); // 수정 후 새로고침
      })
      .catch((error) => {
        console.error('작업자 정보 수정 실패!', error);
      });
  };

  const handleDelete = () => {
    let newErrors = {};

    if (!userPw) newErrors.userPw = '*비밀번호를 입력해주세요.';
    if (userPw !== confirmPw)
      newErrors.confirmPw = '*비밀번호가 일치하지 않습니다.';
    if (!userName) newErrors.userName = '*이름을 입력해주세요.';
    if (!userEmail) newErrors.userEmail = '*이메일을 입력해주세요.';
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    if (window.confirm('정말로 이 작업자를 삭제하시겠습니까?')) {
      axios
        .delete(`${process.env.REACT_APP_API_URL}/api/users/${userId}`, {
          userPw: userPw,
          userName: userName,
          userEmail: userEmail,
        })
        .then(() => {
          alert('작업자 정보가 삭제되었습니다.');
          onClose();
          window.location.reload(); // 삭제 후 새로고침
        })
        .catch((error) => {
          console.error('작업자 정보 삭제 실패!', error);
        });
    }
  };

  return (
    <Modal show={isOpen} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>작업자 정보 수정</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <label>아이디</label>
        <input
          className="form-control input-full"
          type="text"
          value={userId}
          disabled
        />
        <br />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <label>비밀번호</label>
          {errors.userPw && <div style={{ color: 'red' }}>{errors.userPw}</div>}
        </div>
        <input
          className="form-control input-full"
          type="password"
          value={userPw}
          onChange={(e) => setUserPw(e.target.value)}
          placeholder="비밀번호를 입력하세요."
        />
        <br />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <label>비밀번호 재입력</label>
          {errors.confirmPw && (
            <div style={{ color: 'red' }}>{errors.confirmPw}</div>
          )}
        </div>
        <input
          className="form-control"
          type="password"
          value={confirmPw}
          onChange={(e) => setConfirmPw(e.target.value)}
          placeholder="비밀번호를 다시 입력하세요."
        />
        <br />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <label>이름</label>
          {errors.userName && (
            <div style={{ color: 'red' }}>{errors.userName}</div>
          )}
        </div>
        <input
          className="form-control input-full"
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="이름을 입력하세요."
        />
        <br />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <label>이메일</label>
          {errors.userEmail && (
            <div style={{ color: 'red' }}>{errors.userEmail}</div>
          )}
        </div>
        <input
          className="form-control input-full"
          type="text"
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
          placeholder="이메일을 입력하세요."
        />
        <br />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleDelete}>
          작업자 정보 삭제
        </Button>
        <Button variant="primary" onClick={handleUpdate}>
          작업자 정보 수정
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UserDetail;
