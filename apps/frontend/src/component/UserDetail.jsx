import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './UserDetail.module.css'; // 모듈 CSS를 불러옵니다.

const UserDetail = () => {
    const { userId } = useParams(); // URL에서 userId를 받아옵니다.
    const navigate = useNavigate();

    const [userPw, setUserPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [userName, setUserName] = useState('');

    useEffect(() => {
        // 초기 로드 시 사용자 정보를 가져옵니다.
        axios.get(`http://localhost:8089/qrancae/api/users/${userId}`)
            .then(response => {
                const user = response.data;
                setUserPw(user.userPw);
                setUserName(user.userName);
            })
            .catch(error => {
                console.error('유저 정보 가져오기 실패!', error);
            });
    }, [userId]);

    const handleUpdate = () => {
        if (userPw !== confirmPw) {
            alert("비밀번호 불일치!");
            return;
        }

        axios.put(`http://localhost:8089/qrancae/api/users/${userId}`, {
            userPw: userPw,
            userName: userName
        })
            .then(response => {
                alert('작업자 정보가 수정되었습니다.');
                navigate('/user');
            })
            .catch(error => {
                console.error('작업자 정보 수정 실패!', error);
            });
    };

    const handleDelete = () => {
        if (window.confirm('정말로 이 작업자를 삭제하시겠습니까?')) {
            axios.delete(`http://localhost:8089/qrancae/api/users/${userId}`)
                .then(response => {
                    alert('작업자 정보가 삭제되었습니다.');
                    navigate('/user');
                })
                .catch(error => {
                    console.error('작업자 정보 삭제 실패!', error);
                });
        }
    };

    return (
        <div className={styles.userDetailForm}>
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

            <label>비밀번호 재입력</label>
            <input
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="비밀번호를 다시 입력하세요."
            /><br />

            <label>이름</label>
            <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="이름을 입력하세요."
            /><br />

            <button className={styles.updateButton} onClick={handleUpdate}>작업자 정보 수정</button>
            <button className={styles.deleteButton} onClick={handleDelete}>작업자 정보 삭제</button>
        </div>
    );
};

export default UserDetail;