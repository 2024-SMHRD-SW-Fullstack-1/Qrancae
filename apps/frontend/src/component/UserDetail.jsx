import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './UserDetail.module.css';

const UserDetail = ({ userId, onClose }) => {
  const [userPw, setUserPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [userName, setUserName] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    axios
      .get(`http://localhost:8089/qrancae/api/users/${userId}`)
      .then(({ data }) => {
        const user = data;
        setUserPw(user.userPw);
        setUserName(user.userName);
      })
      .catch((error) => {
        console.error('유저 정보 가져오기 실패!', error);
      });
  }, [userId]);

  const handleUpdate = () => {
    let newErrors = {};

    if (!userPw) newErrors.userPw = '*비밀번호를 입력해주세요.';
    if (userPw !== confirmPw) newErrors.confirmPw = '*비밀번호가 일치하지 않습니다.';
    if (!userName) newErrors.userName = '*이름을 입력해주세요.';

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    axios
      .put(`http://localhost:8089/qrancae/api/users/${userId}`, {
        userPw: userPw,
        userName: userName,
      })
      .then(() => {
        alert('작업자 정보가 수정되었습니다.');
        onClose();
      })
      .catch((error) => {
        console.error('작업자 정보 수정 실패!', error);
      });
  };

  const handleDelete = () => {
    if (window.confirm('정말로 이 작업자를 삭제하시겠습니까?')) {
      axios
        .delete(`http://localhost:8089/qrancae/api/users/${userId}`)
        .then(() => {
          alert('작업자 정보가 삭제되었습니다.');
          onClose();
        })
        .catch((error) => {
          console.error('작업자 정보 삭제 실패!', error);
        });
    }
  };

  return (
    <div className={styles.userDetailForm}>
      <button onClick={onClose} className={styles.closeButton}>X</button>
      <h1>작업자 정보 수정</h1>

      <label>아이디</label>
      <input type="text" value={userId} disabled /><br />

      <label>비밀번호</label>
      <input
        type="password"
        value={userPw}
        onChange={(e) => setUserPw(e.target.value)}
        placeholder="비밀번호를 입력하세요."
      /><br />
      {errors.userPw && <div style={{ color: 'red' }}>{errors.userPw}</div>}

      <label>비밀번호 재입력</label>
      <input
        type="password"
        value={confirmPw}
        onChange={(e) => setConfirmPw(e.target.value)}
        placeholder="비밀번호를 다시 입력하세요."
      /><br />
      {errors.confirmPw && <div style={{ color: 'red' }}>{errors.confirmPw}</div>}

      <label>이름</label>
      <input
        type="text"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        placeholder="이름을 입력하세요."
      /><br />
      {errors.userName && <div style={{ color: 'red' }}>{errors.userName}</div>}

      <button className={styles.updateButton} onClick={handleUpdate}>작업자 정보 수정</button>
      <button className={styles.deleteButton} onClick={handleDelete}>작업자 정보 삭제</button>
    </div>
  );
};

export default UserDetail;
