import React, { useEffect, useState } from 'react';
import Rack from './Rack';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import 'datatables.net';
import axios from 'axios';

const Repair = () => {
    const [maints, setMaints] = useState([]); // 유지보수 내역 가져오기
    const [users, setUsers] = useState([]); // 작업자 목록
    const [selectedMaintIdxs, setSelectedMaintIdxs] = useState([]);// 선택된 유지보수내역
    const [selectedUser, setSelectedUser] = useState(''); // 처리할 작업자 선택
    const [alarmMsg, setAlarmMsg] = useState(''); // 추가 요청사항 추가

    const [tableInstance, setTableInstance] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false); // 모달창

    useEffect(() => {
        getData();
        getUsers();
    }, []);

    // DataTable 초기화 및 갱신
    useEffect(() => {
        if (maints.length > 0) {
            if (tableInstance) {
                tableInstance.repairTable.clear().rows.add(filterMaints(maints)).draw();
                tableInstance.repairingTable.clear().rows.add(maints).draw();
            } else {
                initializeDataTable();
            }
        }
    }, [maints]);

    // db에서 가져오기
    function getData() {
        axios.get('http://localhost:8089/qrancae/getmaint')
            .then((res) => {
                console.log('maintData:', res.data);
                setMaints(res.data);
            })
            .catch((err) => {
                console.log('maintData error:', err);
            });
    }

    function getUsers() {
        axios.get('http://localhost:8089/qrancae/maint/getusers')
            .then((res) => {
                console.log('m.user가져오기:', res.data);
                setUsers(res.data);
            })
            .catch((err) => {
                console.log('m.user가져오기 오류 error:', err);
            });
    }

    function filterMaints(data) {
        return data.filter(item => !item.maintUser && !item.maint_update);
    }

    function initializeDataTable() {
        // 점검 대상
        const repairTable = $('#repair-table').DataTable({
            data: filterMaints(maints),
            columns: [
                {
                    title: '<input type="checkbox" id="select-all" />',
                    orderable: false,
                    render: function (_, __, row) {
                        return `<input type="checkbox" class="select-checkbox" data-id="${row.maint_idx}" />`;
                    }
                },
                {
                    title: '요청 작업자',
                    data: null,
                    render: function (data) {
                        return `${data.user.user_name} (${data.user.user_id})`;
                    }
                },
                { title: '케이블', data: 'cable.cable_idx' },
                {
                    title: '오류 내용',
                    data: null,
                    render: function (data) {
                        let errorMessages = [];

                        if (data.maint_qr === '불량') {
                            errorMessages.push(`QR 상태: <span style="color:red">${data.maint_qr}</span>`);
                        }
                        if (data.maint_cable === '불량') {
                            errorMessages.push(`케이블 상태: <span style="color:red">${data.maint_cable}</span>`);
                        }
                        if (data.maint_power === '불량') {
                            errorMessages.push(`전원 공급 상태: <span style="color:red">${data.maint_power}</span>`);
                        }

                        return errorMessages.length > 0 ? errorMessages.join('<br>') : '양호';
                    }
                },
                {
                    title: '요청 날짜',
                    data: 'maint_date',
                    render: function (data) {
                        if (data === null || data === '') {
                            return '';
                        }
                        return data;
                    }
                }
            ],
            destroy: true // DataTable을 다시 초기화할 수 있도록 설정
        });

        // 점검 현황
        const repairingTable = $('#repairing-table').DataTable({
            data: maints.filter(item => item.maintUser !== null),
            columns: [
                {
                    title: '요청 작업자',
                    data: null,
                    render: function (data) {
                        return `${data.user.user_name} (${data.user.user_id})`;
                    }
                },
                { title: '케이블', data: 'cable.cable_idx' },
                {
                    title: '오류 내용',
                    data: null,
                    render: function (data) {
                        let errorMessages = [];

                        if (data.maint_qr === '불량') {
                            errorMessages.push(`QR 상태: <span style="color:red">${data.maint_qr}</span>`);
                        }
                        if (data.maint_cable === '불량') {
                            errorMessages.push(`케이블 상태: <span style="color:red">${data.maint_cable}</span>`);
                        }
                        if (data.maint_power === '불량') {
                            errorMessages.push(`전원 공급 상태: <span style="color:red">${data.maint_power}</span>`);
                        }

                        return errorMessages.length > 0 ? errorMessages.join('<br>') : '양호';
                    }
                },
                { title: '요청 날짜', data: 'maint_date' },
                {
                    title: '처리 작업자',
                    data: null,
                    render: function (data) {
                        if (data.maintUser) {
                            return `${data.maintUser.user_name} (${data.maintUser.user_id})`;
                        }
                        return '요청중';
                    }
                },
                {
                    title: '상태',
                    data: 'maint_update',
                    render: function (data) {
                        if (data === null || data === '') {
                            return '진행중';
                        }
                        return data;
                    }
                }
            ],
            destroy: true // DataTable을 다시 초기화할 수 있도록 설정
        });

        setTableInstance({ repairTable, repairingTable });
    }


    // 작업자 선택하기
    const maintUserSelectClick = () => {
        const selectedIdxs = $('#repair-table .select-checkbox:checked').map(function () {
            return $(this).data('id');
        }).get();
        if (selectedIdxs.length > 0) {
            setSelectedMaintIdxs(selectedIdxs);
            setModalIsOpen(true);
        } else {
            alert('선택된 항목이 없습니다.');
        }
    };

    // 서버로 선택한 작업자와 메시지 전송 처리
    const handleUserConfirm = () => {
        if (selectedMaintIdxs.length > 0 && selectedUser) {
            axios.post('http://localhost:8089/qrancae/maint/updateuser', {
                maintIdxs: selectedMaintIdxs,
                userId: selectedUser,
                alarmMsg: alarmMsg
            })
                .then((res) => {
                    console.log('작업자 할당 성공:', res.data);
                    // 성공 후 테이블 데이터 업데이트
                    const updatedData = maints.map(item => {
                        if (selectedMaintIdxs.includes(item.maint_idx)) {
                            return { ...item, maintUser: { user_id: selectedUser }, user_note: alarmMsg };
                        }
                        return item;
                    });
                    setMaints(updatedData);
                    setModalIsOpen(false);
                    alert('작업자 할당 성공')
                })
                .catch((err) => {
                    console.log('작업자 할당 오류:', err);
                });
        } else {
            alert('작업자와 추가 요청사항을 모두 입력해주세요.');
        }
    };

    const handleUserChange = (event) => {
        setSelectedUser(event.target.value);
    };

    const handlealarmMsgChange = (event) => {
        setAlarmMsg(event.target.value);
    };

    return (
        <div className="App">
            <div className="wrapper">
                <Sidebar />
                <div className="main-panel">
                    <Header />
                    <div className="container">
                        <div className="page-inner">
                            <div className="page-header">
                                <h3 className="fw-bold mb-3">점검 관리</h3>
                            </div>
                            <div className="row">
                                <div className="col-md-4 d-flex flex-column">
                                    <div className="card card-round flex-grow-1">
                                        <div className="card-header">
                                            <div className="card-head-row">
                                                <div className="card-title">케이블 위치 확인</div>
                                                <div className="card-tools">
                                                    <select className="form-select input-fixed" id="notify_state">
                                                        <option value="1">랙 번호 1</option>
                                                        <option value="2">랙 번호 2</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="card-body" style={{ height: '100%', overflowY: 'auto' }}>
                                            <Rack />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-8 d-flex flex-column">
                                    <div className="card card-round flex-grow-1 mb-2">
                                        <div className="card-header">
                                            <div className="card-head-row">
                                                <div className="card-title">점검 대상 케이블</div>
                                                <button className="btn btn-primary" onClick={maintUserSelectClick}>작업자 선택</button>
                                            </div>
                                        </div>
                                        <div className="card-body" style={{ height: '50%', overflowY: 'auto' }}>
                                            <div className="table-responsive">
                                                <table
                                                    id="repair-table"
                                                    className="display table table-striped table-bordered table-hover"
                                                >
                                                    <thead>
                                                        <tr>
                                                            <th><input type="checkbox" id="select-all" /></th>
                                                            <th>요청 작업자</th>
                                                            <th>케이블</th>
                                                            <th>오류 내용</th>
                                                            <th>요청 날짜</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody></tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card card-round flex-grow-1 mb-2">
                                        <div className="card-header">
                                            <div className="card-head-row">
                                                <div className="card-title">케이블 점검 현황</div>
                                            </div>
                                        </div>
                                        <div className="card-body" style={{ height: '50%', overflowY: 'auto' }}>
                                            <div className="table-responsive">
                                                <table
                                                    id="repairing-table"
                                                    className="display table table-striped table-bordered table-hover"
                                                >
                                                    <thead>
                                                        <tr>
                                                            <th>요청 작업자</th>
                                                            <th>케이블</th>
                                                            <th>오류 내용</th>
                                                            <th>요청 날짜</th>
                                                            <th>처리 작업자</th>
                                                            <th>상태</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody></tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Footer />
                </div>
            </div>

            {/* 작업자 선택 모달 */}
            <div className={`modal fade ${modalIsOpen ? 'show d-block' : ''}`} id="userSelectModal" tabIndex="-1" role="dialog" aria-labelledby="userSelectModalLabel" aria-hidden={!modalIsOpen}>
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="userSelectModalLabel">작업자 선택</h5>
                            <button type="button" className="close" onClick={() => setModalIsOpen(false)} aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label htmlFor="userSelect">작업자 선택</label>
                                <select id="userSelect" className="form-control" value={selectedUser} onChange={handleUserChange}>
                                    <option value="">작업자를 선택하세요</option>
                                    {users.map(user => (
                                        <option key={user.user_id} value={user.user_id}>
                                            {user.user_name} ({user.user_id})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group mt-3">
                                <label htmlFor="alarmMsg">추가 요청사항</label>
                                <textarea
                                    id="alarmMsg"
                                    className="form-control"
                                    value={alarmMsg}
                                    onChange={handlealarmMsgChange}
                                    placeholder="추가 요청사항을 입력해주세요"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setModalIsOpen(false)}>취소</button>
                            <button type="button" className="btn btn-primary" onClick={handleUserConfirm}>확인</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Repair;
