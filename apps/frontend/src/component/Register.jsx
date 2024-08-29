import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Register.module.css'; // module.css 파일을 불러옵니다.

function Register() {
    const navigate = useNavigate();
    const [userId, setUserId] = useState('');
    const [userPw, setUserPw] = useState('');
    const [userPwConfirm, setUserPwConfirm] = useState(''); // 비밀번호 재입력
    const [userName, setUserName] = useState('');
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({});

    const register = () => {
        let newErrors = {};
        if (!userId) newErrors.userId = '*아이디를 입력해주세요.';
        if (!userPw) newErrors.userPw = '*비밀번호를 입력해주세요.';
        if (userPw !== userPwConfirm) newErrors.userPwConfirm = '*비밀번호가 일치하지 않습니다.';
        if (!userName) newErrors.userName = '*이름을 입력해주세요.';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        axios.post('http://localhost:8089/qrancae/api/signup', {
            userId: userId,
            userPw: userPw,
            userName: userName,
        })
            .then((response) => {
                console.log(response.data);
                if (response.data === '회원가입 성공') {
                    alert('회원가입 성공');
                    navigate('/user');  // 회원가입 성공 시 사용자 관리 페이지로 이동
                } else {
                    setMessage(response.data);
                }
            })
            .catch((error) => {
                console.log('통신 실패', error);
                alert('회원가입 실패');
            });
    };

    return (
        <div className={styles.register_form}>
            <h1>회원가입</h1>
            <div className={styles.note}>*는 필수 입력</div>
            <label>아이디 <span className={styles.required}>*</span></label>
            <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)}
                placeholder='아이디를 입력하세요.' /><br />
            {errors.userId && <div className={styles.error}>{errors.userId}</div>}
            {message && <div className={styles.error}>{message}</div>}

            <label>비밀번호 <span className={styles.required}>*</span></label>
            <input type="password" value={userPw} onChange={(e) => setUserPw(e.target.value)}
                placeholder='비밀번호를 입력하세요.' /><br />
            {errors.userPw && <div className={styles.error}>{errors.userPw}</div>}

            <label>비밀번호 재입력 <span className={styles.required}>*</span></label>
            <input type="password" value={userPwConfirm} onChange={(e) => setUserPwConfirm(e.target.value)}
                placeholder='비밀번호를 다시 입력하세요.' /><br />
            {errors.userPwConfirm && <div className={styles.error}>{errors.userPwConfirm}</div>}

            <label>이름 <span className={styles.required}>*</span></label>
            <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)}
                placeholder='이름을 입력하세요.' /><br />
            {errors.userName && <div className={styles.error}>{errors.userName}</div>}

            <button onClick={register}>회원가입</button>
        </div>
    );
};

export default Register;