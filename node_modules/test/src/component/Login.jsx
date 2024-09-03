import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import styles from './Login.module.css'; // module.css 파일을 불러옵니다.

function Login() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [userPw, setUserPw] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

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
        alert('로그인 성공');
        navigate('/home'); // 홈 페이지로 리다이렉트
      } else {
        setMessage(response.data);
      }
    } catch (error) {
      console.log('통신 실패', error);
      alert('로그인 실패');
    }
  };

  return (
    <div className={styles.loginForm}>
      <h1>로그인</h1>
      <p>Welcome back! Let’s continue with.</p>

      <label>아이디</label>
      <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)}
        placeholder='아이디를 입력하세요.' /><br />
      {errors.userId && <div className={styles.error}>{errors.userId}</div>}
      {message && <div className={styles.error}>{message}</div>}

      <label>비밀번호</label>
      <input type="password" value={userPw} onChange={(e) => setUserPw(e.target.value)}
        placeholder='비밀번호를 입력하세요.' /><br />
      {errors.userPw && <div className={styles.error}>{errors.userPw}</div>}

      <button onClick={login}>로그인</button>
    </div>
  );
};

export default Login;