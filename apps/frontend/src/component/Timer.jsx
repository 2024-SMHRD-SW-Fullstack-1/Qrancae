import React, { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Timer = () => {
    const navigate = useNavigate();
    const savedCallback = useRef();
    const intervalId = useRef(null);

    // 타이머를 유지하기 위해 useRef를 사용하여 상태를 저장
    const timeLeft = useRef(1800); // 30분 (1800초)

    const [displayTime, setDisplayTime] = useState(timeLeft.current);

    // useEffect로 반복 실행할 함수를 업데이트
    useEffect(() => {
        savedCallback.current = () => {
            if (timeLeft.current > 0) {
                timeLeft.current -= 1;
                setDisplayTime(timeLeft.current); // 화면 갱신을 위해 상태 업데이트
            } else {
                clearInterval(intervalId.current);
                handleLogout(); // 시간이 0이 되면 로그아웃
            }
        };
    });

    useEffect(() => {
        const tick = () => {
            savedCallback.current();
        };
        intervalId.current = setInterval(tick, 1000);

        return () => clearInterval(intervalId.current);
    }, []);

    useEffect(() => {
        if (timeLeft.current === 300 || timeLeft.current === 60) {
            const extend = window.confirm('로그인 시간을 연장하시겠습니까?');
            if (extend) {
                timeLeft.current = 1800; // 다시 30분으로 연장
                setDisplayTime(timeLeft.current);
            }
        }
    }, [displayTime]);

    const handleLogout = () => {
        axios.post('http://localhost:8089/qrancae/api/logout', {}, { withCredentials: true })
            .then(response => {
                if (response.data === '로그아웃 성공') {
                    Cookies.remove('userId');
                    alert('로그인 시간이 만료되어 로그아웃 되었습니다.');
                    navigate('/login');
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
    };

    const formatTime = seconds => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    return (
        <div style={{ padding: '10px' }}>
            남은 로그인 시간: {formatTime(displayTime)}
            <button onClick={handleExtendTime} style={{ marginLeft: '10px', padding: '5px 10px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px' }}>로그인 시간 연장</button>
        </div>
    );
};

export default Timer;