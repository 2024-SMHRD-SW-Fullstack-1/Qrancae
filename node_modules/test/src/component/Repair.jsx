import React, { useEffect, useState } from 'react';
import Rack from './Rack';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import 'datatables.net';
import axios from 'axios';

//날짜 및 시간 포맷팅
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(',', '');
};

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
        return data.filter(item =>
            (!item.maintUser && !item.maint_update) &&
            (item.maint_qr === '불량' || item.maint_cable === '불량' || item.maint_power === '불량')
        );
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
                        if (data.maint_msg) {
                            errorMessages.push(`(${data.maint_msg})`);
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
                        return formatDate(data);
                    }
                }
            ],
            destroy: true
        });

        // 전체 선택/해제
        $('#select-all').on('click', function () {
            const isChecked = $(this).is(':checked');
            $('#repair-table .select-checkbox').prop('checked', isChecked);
        });

        // 해당 줄 클릭 시 표시
        $('#repair-table tbody').on('click', 'tr', function () {
            const data = repairTable.row(this).data();

            const rackLocation = data.cable.s_rack_location;
            const rackNumber = data.cable.s_rack_number;
            const portNumber = data.cable.s_port_number;
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
                    width: '30%',// 너비 30% 설정
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
                { title: '요청 날짜', data: 'maint_date', render: data => formatDate(data) },
                {
                    title: '처리 작업자',
                    data: null,
                    render: function (data) {
                        if (data.maintUser) {
                            return `${data.maintUser.user_name} (${data.maintUser.user_id})`;
                        }
                        return '요청 대기중';
                    }
                },
                {
                    title: '상태',
                    data: null,
                    render: function (data) {
                        if (data.maintUser) {
                            if (data.maint_update) {
                                return `완료(${formatDate(data.maint_date)})`
                            }
                            return '진행중'
                        }
                        return '접수 대기중'

                    }
                },
                // 상태를 숫자로 변환하여 정렬
                {
                    title: '상태 정렬',
                    data: null,
                    visible: false,
                    render: function (data) {
                        if (data.maintUser) {
                            if (data.maint_update) {
                                return 3; // '완료'
                            }
                            return 2; // '진행중'
                        }
                        return 1; // '접수 대기중'
                    }
                }
            ],
            // maint_update가 없는 항목을 먼저 표시하고, 있는 항목을 나중에 표시
            order: [
                [6, 'asc'], // '상태 정렬' 열을 기준으로 정렬
                [4, 'asc'], // '처리 작업자' 열이 없는 항목 먼저 정렬
            ],
            destroy: true
        });

        setTableInstance({ repairTable, repairingTable });
        // 오늘 날짜 포맷
        const today = new Date().toISOString().split('T')[0];
        // 오류 상태가 불량인 항목만 필터링하는 함수
        const filterFaultyMaints = (data) => {
            return data.filter(item =>
                item.maint_qr === '불량' ||
                item.maint_cable === '불량' ||
                item.maint_power === '불량'
            );
        };

        // 오늘/진행중/완료 탭으로 구분
        $('#tab-today').on('click', function () {
            const filteredData = filterFaultyMaints(maints).filter(item => item.maint_date.startsWith(today));
            repairingTable.clear().rows.add(filteredData).draw();
        });
        // 진행
        $('#tab-in-progress').on('click', function () {
            const filteredData = filterFaultyMaints(maints).filter(item =>
                item.maintUser !== null && item.maint_update === null
            );
            repairingTable.clear().rows.add(filteredData).draw();
        });
        // 완료
        $('#tab-completed').on('click', function () {
            const filteredData = filterFaultyMaints(maints).filter(item =>
                item.maintUser !== null && item.maint_update !== null
            );
            repairingTable.clear().rows.add(filteredData).draw();
        });
        // 전체
        $('#tab-all').on('click', function () {
            const filteredData = filterFaultyMaints(maints);
            repairingTable.clear().rows.add(filteredData).draw();
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
                                                <div>
                                                    <button id="tab-today">오늘</button>
                                                    <button id="tab-in-progress">진행중</button>
                                                    <button id="tab-completed">완료</button>
                                                    <button id="tab-all">전체</button>
                                                </div>
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
                                                <li key={item.maint_idx} style={{ textAlign: 'left' }}>
                                                    <strong>케이블 번호 : </strong> {item.cable.cable_idx}<br />
                                                    <strong>오류 내용</strong><br />
                                                    <div style={{ marginLeft: '10px' }}>
                                                        {item.maint_qr === '불량' && <div>- QR 상태: <span style={{ color: 'red' }}>{item.maint_qr}</span></div>}
                                                        {item.maint_cable === '불량' && <div>- 케이블 상태: <span style={{ color: 'red' }}>{item.maint_cable}</span></div>}
                                                        {item.maint_power === '불량' && <div>- 전원 공급 상태: <span style={{ color: 'red' }}>{item.maint_power}</span></div>}
                                                    </div>
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
                            <h5 className="modal-title" id="confirmModalLabel">요청사항 확인</h5>
                            <button type="button" className="close" onClick={() => setConfirmModalIsOpen(false)} aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <p>요청 작업자와 요청 내용을 확인하세요.</p>
                            <h5>작업자: {users.find(user => user.user_id === selectedUser)?.user_name} ({selectedUser})</h5>
                            <p><strong>추가 요청사항:</strong> {alarmMsg || '없음'}</p>
                            <h5>선택된 유지보수 내역</h5>
                            <ul>
                                {selectedMaintsInfo.map((item) => (
                                    <li key={item.maint_idx} style={{ textAlign: 'left' }}>
                                        <strong>케이블 번호 : </strong> {item.cable.cable_idx}<br />
                                        <strong>오류 내용</strong><br />
                                        <div style={{ marginLeft: '10px' }}>
                                            {item.maint_qr === '불량' && <div>- QR 상태: <span style={{ color: 'red' }}>{item.maint_qr}</span></div>}
                                            {item.maint_cable === '불량' && <div>- 케이블 상태: <span style={{ color: 'red' }}>{item.maint_cable}</span></div>}
                                            {item.maint_power === '불량' && <div>- 전원 공급 상태: <span style={{ color: 'red' }}>{item.maint_power}</span></div>}
                                        </div>
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