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
    const [selectedMaintIdxs, setSelectedMaintIdxs] = useState([]); // 선택된 유지보수 내역
    const [selectedUser, setSelectedUser] = useState(''); // 처리할 작업자 선택
    const [alarmMsg, setAlarmMsg] = useState(''); // 추가 요청사항 추가
    const [tableInstance, setTableInstance] = useState(null); // 테이블 갱신
    const [modalIsOpen, setModalIsOpen] = useState(false); // 모달창
    const [confirmModalIsOpen, setConfirmModalIsOpen] = useState(false); // 최종 확인 모달
    const [rackLocationInfo, setRackLocationInfo] = useState(''); // 랙 위치
    const [highlightPosition, setHighlightPosition] = useState(null); // 보여줄 위치 저장
    const [selectedMaintsInfo, setSelectedMaintsInfo] = useState([]); // 선택된 유지보수 내역 정보

    useEffect(() => {
        getData();
        getUsers();
    }, []);

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

    // 유지 보수 내역 가져오기
    function getData() {
        axios.get('http://localhost:8089/qrancae/getmaint')
            .then((res) => {
                setMaints(res.data);
            })
            .catch((err) => {
                console.log('maintData error:', err);
            });
    }

    // 처리할 작업자 가져오기
    function getUsers() {
        axios.get('http://localhost:8089/qrancae/maint/getusers')
            .then((res) => {
                setUsers(res.data);
            })
            .catch((err) => {
                console.log('m.user 가져오기 오류:', err);
            });
    }

    // 처리 작업자와 처리 날짜 필터링
    function filterMaints(data) {
        return data.filter(item => !item.maintUser && !item.maint_update);
    }

    // 테이블 초기화
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
                {
                    title: '케이블', data: 'cable.cable_idx',
                    render: function (data, type, row) {
                        return `<a href="#" class="cable-link"
                        data-rack-location="${row.cable.s_rack_location}" 
                        data-port-number="${row.cable.s_port_number}"
                        data-rack-number="${row.cable.s_rack_number}" >${data}</a>`;
                    }
                },
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
            destroy: true
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
                        return `완료(${data})`;
                    }
                }
            ],
            // maint_update가 없는 항목을 먼저 표시하고, 있는 항목을 나중에 표시
            order: [[5, 'desc']], // '상태' 열을 기준으로 정렬
            destroy: true
        });

        setTableInstance({ repairTable, repairingTable });

        $('#repair-table').on('click', '.cable-link', function (e) {
            e.preventDefault();

            const rackLocation = $(this).data('rack-location');
            const rackNumber = $(this).data('rack-number');
            const portNumber = $(this).data('port-number');
            setRackLocationInfo(rackLocation);

            const extractNumber = (str) => {
                const match = str.match(/\d+/);
                return match ? parseInt(match[0], 10) : null;
            };

            setHighlightPosition({
                rackNumber: extractNumber(rackNumber),
                portNumber: extractNumber(portNumber)
            });
        });
    }

    // 작업자 선택 클릭 시 모달 열기
    const maintUserSelectClick = () => {
        const selectedIdxs = $('#repair-table .select-checkbox:checked').map(function () {
            return $(this).data('id');
        }).get();
        if (selectedIdxs.length > 0) {
            setSelectedMaintIdxs(selectedIdxs);
            // 선택된 유지보수 내역 정보 가져오기
            const selectedMaintsInfo = maints.filter(item => selectedIdxs.includes(item.maint_idx));
            setSelectedMaintsInfo(selectedMaintsInfo);
            setModalIsOpen(true);
        } else {
            alert('선택된 항목이 없습니다.');
        }
    };

    // 작업자 선택 및 추가 요청사항을 최종 확인 모달에서 확인
    const handleUserConfirm = () => {
        if (selectedUser) {
            // 최종 확인 모달 열고 그 전 모달 닫기
            setConfirmModalIsOpen(true);
            setModalIsOpen(false);
        } else {
            alert('작업자는 필수로 선택해 주세요.');
        }
    };

    // 최종 확인 모달에서 제출 버튼 클릭 시
    const handleConfirmSubmit = () => {
        axios.post('http://localhost:8089/qrancae/maint/updateuser', {
            maintIdxs: selectedMaintIdxs,
            userId: selectedUser,
            alarmMsg: alarmMsg
        })
            .then(() => {
                alert('유지보수 내역이 업데이트되었습니다.');
                setConfirmModalIsOpen(false); // 최종 확인 모달 닫기
                // 유지보수 내역 업데이트
                const updatedData = maints.map(item => {
                    if (selectedMaintIdxs.includes(item.maint_idx)) {
                        return { ...item, maintUser: { user_id: selectedUser }, user_note: alarmMsg };
                    }
                    return item;
                });
                setMaints(updatedData);
                setRackLocationInfo('');
            })
            .catch((err) => {
                console.log('처리 작업자 선택 오류:', err);
                alert('서버와의 통신 오류가 발생했습니다.');
            });
    };

    const handleUserChange = (event) => {
        setSelectedUser(event.target.value);
    };

    const handleAlarmMsgChange = (event) => {
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
                                                {rackLocationInfo && (
                                                    <div className="card-tools">
                                                        <h6>랙 위치 : {rackLocationInfo}</h6>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="card-body" style={{ height: '100%', overflowY: 'auto' }}>
                                            <Rack highlightPosition={highlightPosition} />
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
                            {selectedMaintsInfo.length > 0 && (
                                <>
                                    <div className="form-group">
                                        <label htmlFor="userSelect">작업자</label>
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
                                            onChange={handleAlarmMsgChange}
                                            placeholder="추가 요청사항을 입력해주세요"
                                        />
                                    </div>
                                    <div className="mt-4">
                                        <h5>선택된 유지보수 내역</h5>
                                        <ul>
                                            {selectedMaintsInfo.map((item) => (
                                                <li key={item.maint_idx}>
                                                    <strong>케이블 번호:</strong> {item.cable.cable_idx}<br />
                                                    <strong>오류 내용:</strong>
                                                    {item.maint_qr === '불량' ? `QR 상태: ${item.maint_qr}` : ''}
                                                    {item.maint_cable === '불량' ? `케이블 상태: ${item.maint_cable}` : ''}
                                                    {item.maint_power === '불량' ? `전원 공급 상태: ${item.maint_power}` : ''}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setModalIsOpen(false)}>취소</button>
                            <button type="button" className="btn btn-primary" onClick={handleUserConfirm}>확인</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 최종 확인 모달 */}
            <div className={`modal fade ${confirmModalIsOpen ? 'show d-block' : ''}`} id="confirmModal" tabIndex="-1" role="dialog" aria-labelledby="confirmModalLabel" aria-hidden={!confirmModalIsOpen}>
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="confirmModalLabel">최종 확인</h5>
                            <button type="button" className="close" onClick={() => setConfirmModalIsOpen(false)} aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <h5>작업자: {users.find(user => user.user_id === selectedUser)?.user_name} ({selectedUser})</h5>
                            <p><strong>추가 요청사항:</strong> {alarmMsg || '없음'}</p>
                            <h5>선택된 유지보수 내역</h5>
                            <ul>
                                {selectedMaintsInfo.map((item) => (
                                    <li key={item.maint_idx}>
                                        <strong>케이블 번호:</strong> {item.cable.cable_idx}<br />
                                        <strong>오류 내용:</strong>
                                        {item.maint_qr === '불량' ? `QR 상태: ${item.maint_qr}` : ''}
                                        {item.maint_cable === '불량' ? `케이블 상태: ${item.maint_cable}` : ''}
                                        {item.maint_power === '불량' ? `전원 공급 상태: ${item.maint_power}` : ''}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setConfirmModalIsOpen(false)}>취소</button>
                            <button type="button" className="btn btn-primary" onClick={handleConfirmSubmit}>확인</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Repair;