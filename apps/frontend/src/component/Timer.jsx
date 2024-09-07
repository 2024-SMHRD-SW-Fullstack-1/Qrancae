import React, { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './Timer.module.css'; // CSS 모듈 임포트
import { Button, Modal } from 'react-bootstrap';

const Timer = () => {
    const navigate = useNavigate();
    const intervalId = useRef(null);
    const timeLeft = useRef(62); // 30분 (1800초)
    const [displayTime, setDisplayTime] = useState(timeLeft.current);
    const [showExtendPrompt, setShowExtendPrompt] = useState(false);

    const decrementTime = () => {
        if (timeLeft.current > 0) {
            timeLeft.current -= 1;
            setDisplayTime(timeLeft.current);

            if (timeLeft.current === 300 || timeLeft.current === 60) {
                setShowExtendPrompt(true);
            }
        } else {
            clearInterval(intervalId.current);
            handleLogout(); // 시간이 0이 되면 로그아웃
        }
    };

    useEffect(() => {
        intervalId.current = setInterval(decrementTime, 1000);
        return () => clearInterval(intervalId.current);
    }, []);

    const handleLogout = async () => {
        axios.post('http://localhost:8089/qrancae/api/logout', {}, { withCredentials: true })
            .then(async (response) => {
                if (response.data === '로그아웃 성공') {
                    Cookies.remove('userId');
                    navigate('/login?message=timeout');

                    // 1초 대기 (sleep 기능)
                    await new Promise(resolve => setTimeout(resolve, 1000));

                } else {
                    alert('로그아웃 실패');
                }
            })
            .catch(error => {
                console.error('로그아웃 요청 중 오류가 발생했습니다.', error);
                alert('로그아웃 실패');
            });
    };

    const handleExtendTime = () => {
        timeLeft.current = 1800; // 30분으로 연장
        setDisplayTime(timeLeft.current);
        setShowExtendPrompt(false); // 연장 여부 확인 창 숨기기
    };

    const handleClosePrompt = () => {
        setShowExtendPrompt(false); // 모달 창 숨기기
    };

    const formatTime = seconds => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}분 ${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}초`;
    };

    return (
        <div className={styles.timerContainer}>
            <p style={{ margin: '0' }}>남은 로그인 시간</p>
            <p>{formatTime(displayTime)}</p>
            <Button variant="secondary" onClick={handleExtendTime} className={styles.extendTimeButton}>로그인 시간 연장</Button>

            <Modal show={showExtendPrompt} onHide={handleClosePrompt} centered>
                <Modal.Header closeButton>
                    <Modal.Title>알림</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ textAlign: 'center', marginTop: '2rem', marginBottom: '2rem' }}>
                    <h5 style={{ margin: 0 }}>로그인 시간이 얼마 남지 않았습니다.</h5>
                    <h5 style={{ margin: 0 }}>연장하시겠습니까?</h5>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClosePrompt}>
                        취소
                    </Button>
                    <Button variant="primary" onClick={handleExtendTime}>
                        연장
                    </Button>
                </Modal.Footer>
            </Modal>

            {showExtendPrompt && <div className={styles.overlay}></div>}
        </div>
    );
};

export default Timer;