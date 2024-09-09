import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import ModalPopup from './popups/ModalPopup';

const AdminDetail = () => {
    const [showAdminPopup, setShowAdminPopup] = useState(false); // 팝업
    const [userName, setUserName] = useState('');
    const [userPw, setUserPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [userId, setUserId] = useState('');
    const [errors, setErrors] = useState({});
    const [userEmail, setUserEmail] = useState('');
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
                setUserEmail(admin.userEmail)
            })
            .catch(error => {
                console.error('관리자 정보 가져오기 실패!', error);
                alert('관리자 정보 가져오기 실패!');
            });
    }, [navigate]);

    const handleUpdate = () => {
        let newErrors = {};

        // 이름과 비밀번호 필수 입력 검사
        if (!userName) newErrors.userName = '*이름을 입력해주세요.';
        if (!userPw) newErrors.userPw = '*비밀번호를 입력해주세요.';
        if (userPw !== confirmPw) newErrors.confirmPw = '*비밀번호가 일치하지 않습니다.';
        if (!userEmail) newErrors.userEmail = '*이메일을 입력해주세요.'

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            return;
        }

        const updatedAdminData = {
            userPw: userPw,
            userName: userName,
            userEmail: userEmail
        };

        axios.put(`http://localhost:8089/qrancae/api/users/${userId}`, updatedAdminData, {
            withCredentials: true,
        })
            .then(() => {
                setShowAdminPopup(true);
                Cookies.remove('userId');
            })
            .catch(error => {
                console.error('관리자 정보 수정 실패!', error);
            });
    };

    //  팝업 닫기
    const closeAdminPopup = () => {
        setShowAdminPopup(false);
        navigate('/login');

    };

    return (
        <div className="wrapper">
            <style>
                {`
          table.dataTable {
            text-align: center;
            white-space: nowrap;
          }
        `}
            </style>
            <Sidebar />

            <div className="main-panel">
                <Header />

                <div className="container d-flex justify-content-center align-items-center">
                    <div className="page-inner" style={{ width: '40%' }}>
                        <div className="row">
                            <div className="card">
                                <div className="card-header" >
                                    <h4 className="card-title">관리자 정보 수정</h4>
                                </div>
                                <div className="card-body">
                                    <div className="form-group">
                                        <label>아이디</label>
                                        <input type="text" className="form-control" value={userId} disabled />
                                    </div>
                                    <div className="form-group">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <label>이름</label>
                                            {errors.userName && <div style={{ color: 'red' }}>{errors.userName}</div>}
                                        </div>
                                        <input type="text" className="form-control" value={userName} onChange={(e) => setUserName(e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <label>비밀번호</label>
                                            {errors.userPw && <div style={{ color: 'red' }}>{errors.userPw}</div>}
                                        </div>
                                        <input type="password" className="form-control" value={userPw} onChange={(e) => setUserPw(e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <label>비밀번호 확인</label>
                                            {errors.confirmPw && <div style={{ color: 'red' }}>{errors.confirmPw}</div>}
                                        </div>
                                        <input type="password" className="form-control" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
                                    </div>                                    
                                    <div className="form-group">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <label>이메일</label>
                                            {errors.userEmail && <div style={{ color: 'red' }}>{errors.userEmail}</div>}
                                        </div>
                                        <input type="text" className="form-control" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} />
                                    </div>
                                    <div style={{ textAlign: 'right', margin: '2rem 1rem' }}>
                                        <button className="btn btn-primary" onClick={handleUpdate}>정보 수정</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {showAdminPopup && (
                    <ModalPopup
                        isOpen={showAdminPopup}
                        onClose={closeAdminPopup}
                        message="관리자 정보가 수정되었습니다."
                    />
                )}

                <Footer />
            </div>
        </div>
    );
};

export default AdminDetail;
