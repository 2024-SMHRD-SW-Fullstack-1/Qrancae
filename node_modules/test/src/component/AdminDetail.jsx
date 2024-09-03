import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const AdminDetail = () => {
    const [userName, setUserName] = useState('');
    const [userPw, setUserPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [userId, setUserId] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const userIdFromCookie = Cookies.get('userId');
        if (!userIdFromCookie) {
            alert('로그인이 필요합니다.');
            navigate('/login');
            return;
        }

        axios.get(`http://localhost:8089/qrancae/api/users/${userIdFromCookie}`, {
            withCredentials: true,
        })
        .then(response => {
            const admin = response.data;
            setUserName(admin.userName);
            setUserId(admin.userId); // 아이디는 변경 불가
        })
        .catch(error => {
            console.error('관리자 정보 가져오기 실패!', error);
            alert('관리자 정보 가져오기 실패!');
        });
    }, [navigate]);

    const handleUpdate = () => {
        if (userPw !== confirmPw) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }

        const updatedAdminData = {
            userPw: userPw,
            userName: userName
        };

        axios.put(`http://localhost:8089/qrancae/api/users/${userId}`, updatedAdminData, {
            withCredentials: true,
        })
        .then(() => {
            alert('관리자 정보가 수정되었습니다.');
            Cookies.remove('userId');
            navigate('/login');
        })
        .catch(error => {
            console.error('관리자 정보 수정 실패!', error);
        });
    };

    return (
        <div className="container mt-5">
            <h2>관리자 정보 수정</h2>
            <div className="form-group">
                <label>아이디</label>
                <input type="text" className="form-control" value={userId} disabled />
            </div>
            <div className="form-group">
                <label>이름</label>
                <input type="text" className="form-control" value={userName} onChange={(e) => setUserName(e.target.value)} />
            </div>
            <div className="form-group">
                <label>비밀번호</label>
                <input type="password" className="form-control" value={userPw} onChange={(e) => setUserPw(e.target.value)} />
            </div>
            <div className="form-group">
                <label>비밀번호 확인</label>
                <input type="password" className="form-control" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
            </div>
            <button className="btn btn-primary" onClick={handleUpdate}>정보 수정</button>
        </div>
    );
};

export default AdminDetail;
