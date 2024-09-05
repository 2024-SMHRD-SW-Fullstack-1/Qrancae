import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import styles from './Login.module.css'; // module.css 파일을 불러옵니다.
import { Button } from 'react-bootstrap';
import ModalPopup from './popups/ModalPopup';

function Login() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [userPw, setUserPw] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [showPopup, setShowPopup] = useState(false);

  const login = async () => {
    let newErrors = {};
    if (!userId) newErrors.userId = '*아이디를 입력해주세요.';
    if (!userPw) newErrors.userPw = '*비밀번호를 입력해주세요.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await axios.post('http://localhost:8089/qrancae/api/login', {
        userId: userId,
        userPw: userPw,
      });

      console.log(response.data);
      if (response.data === '로그인 성공') {
        // 로그인 성공 시 처리
        Cookies.set('userId', userId, { expires: 7 }); // 쿠키에 사용자 아이디 저장 (7일 유효)
        setShowPopup(true);
      } else {
        setMessage(response.data);
      }
    } catch (error) {
      console.log('통신 실패', error);
      alert('로그인 실패');
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    navigate('/home'); // 홈 페이지로 리다이렉트
  };

  return (
    <div>
      <div className={styles.loginForm}>
        <img
          src="assets/img/logo.png"
          alt="navbar brand"
          className="navbar-brand"
          height="20"
          style={{ marginBottom: '5rem' }}
        />
        <h1>로그인</h1>
        <p style={{ marginBottom: '4rem' }}>Welcome back! Let’s continue with.</p>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <label style={{ marginRight: '10px' }}>아이디</label>
          <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 'auto' }}>
            {errors.userId && <div className={styles.error} style={{ marginBottom: '0' }}>{errors.userId}</div>}
            {message && <div className={styles.error}>{message}</div>}
          </div>
        </div>
        <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)}
          placeholder='아이디를 입력하세요.' /><br />

        <div style={{ display: 'flex', alignItems: 'center', marginTop: '.5rem' }}>
          <label style={{ marginRight: '10px' }}>비밀번호</label>
          <div style={{ marginLeft: 'auto' }}>
            {errors.userPw && <div className={styles.error} style={{ marginBottom: '0' }}>{errors.userPw}</div>}
          </div>
        </div>
        <input type="password" value={userPw} onChange={(e) => setUserPw(e.target.value)}
          placeholder='비밀번호를 입력하세요.' /><br />

        <Button onClick={login} style={{ marginTop: '3rem' }}>로그인</Button>
      </div>
      {showPopup && (
        <ModalPopup
          isOpen={showPopup}
          onClose={closePopup}
          message="로그인 성공"
        />
      )}
    </div>
  );
};

export default Login;