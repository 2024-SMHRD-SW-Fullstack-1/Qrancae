import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Register.module.css'; // module.css 파일을 불러옵니다.
import { Button } from 'react-bootstrap';
import ModalPopup from './popups/ModalPopup';

function Register() {
    const navigate = useNavigate();
    const [userId, setUserId] = useState('');
    const [userPw, setUserPw] = useState('');
    const [userPwConfirm, setUserPwConfirm] = useState(''); // 비밀번호 재입력
    const [userName, setUserName] = useState('');
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({});
    const [showPopup, setShowPopup] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const register = () => {
        let newErrors = {};
        if (!userId) newErrors.userId = '*아이디를 입력해주세요.';
        if (!userPw) newErrors.userPw = '*비밀번호를 입력해주세요.';
        if (userPw !== userPwConfirm) newErrors.userPwConfirm = '*비밀번호가 일치하지 않습니다.';
        if (!userName) newErrors.userName = '*이름을 입력해주세요.';
        if (!userEmail) newErrors.userEmail = '*이메일을 입력해주세요.'

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        axios.post('http://localhost:8089/qrancae/api/signup', {
            userId: userId,
            userPw: userPw,
            userName: userName,
            userEmail: userEmail,
        })
            .then((response) => {
                console.log(response.data);
                if (response.data === '회원가입 성공') {
                    setShowPopup(true);
                } else {
                    setMessage(response.data);
                }
            })
            .catch((error) => {
                console.log('통신 실패', error);
                alert('회원가입 실패');
            });
    };

    const closePopup = () => {
        setShowPopup(false);
        navigate('/user');  // 회원가입 성공 시 사용자 관리 페이지로 이동
    };

    return (
        <div>
            <div className={styles.register_form}>
                <img
                    src="assets/img/logo.png"
                    alt="navbar brand"
                    className="navbar-brand"
                    height="20"
                    style={{ marginBottom: '2rem' }}
                />
                <h1>회원가입</h1>
                <div className={styles.note} style={{ marginBottom: '.5rem' }}>*는 필수 입력</div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ marginRight: '10px' }}>아이디 <span className={styles.required}>*</span></label>
                    <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 'auto' }}>
                        {errors.userId && <div className={styles.error} style={{ marginBottom: '0' }}>{errors.userId}</div>}
                        {message && <div className={styles.error}>{message}</div>}
                    </div>
                </div>
                <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)}
                    placeholder='아이디를 입력하세요.' /><br />

                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ marginRight: '10px' }}>비밀번호 <span className={styles.required}>*</span></label>
                    <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 'auto' }}>
                        {errors.userPw && <div className={styles.error} style={{ marginBottom: '0' }}>{errors.userPw}</div>}
                    </div>
                </div>
                <input type="password" value={userPw} onChange={(e) => setUserPw(e.target.value)}
                    placeholder='비밀번호를 입력하세요.' /><br />

                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ marginRight: '10px' }}>비밀번호 재입력 <span className={styles.required}>*</span></label>
                    <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 'auto' }}>
                        {errors.userPwConfirm && <div className={styles.error} style={{ marginBottom: '0' }}>{errors.userPwConfirm}</div>}
                    </div>
                </div>
                <input type="password" value={userPwConfirm} onChange={(e) => setUserPwConfirm(e.target.value)}
                    placeholder='비밀번호를 다시 입력하세요.' /><br />

                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ marginRight: '10px' }}>이름 <span className={styles.required}>*</span></label>
                    <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 'auto' }}>
                        {errors.userName && <div className={styles.error} style={{ marginBottom: '0' }}>{errors.userName}</div>}
                    </div>
                </div>
                <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)}
                    placeholder='이름을 입력하세요.' /><br />

                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ marginRight: '10px' }}>이메일 <span className={styles.required}>*</span></label>
                    <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 'auto' }}>
                        {errors.userName && <div className={styles.error} style={{ marginBottom: '0' }}>{errors.userName}</div>}
                    </div>
                </div>
                <input type="text" value={userEmail} onChange={(e) => setUserEmail(e.target.value)}
                    placeholder='이메일을 입력하세요.' /><br />
                <Button onClick={register} style={{ marginTop: '0rem' }}>회원가입</Button>
            </div>
            {showPopup && (
                <ModalPopup
                    isOpen={showPopup}
                    onClose={closePopup}
                    message="회원가입 성공"
                />
            )}
        </div>
    );
};

export default Register;