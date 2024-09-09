import React, { useEffect, useState } from 'react';
import Rack from './Rack';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import 'datatables.net';
import axios from 'axios';
import ModalPopup from './popups/ModalPopup';
import { Modal, Button, Form } from 'react-bootstrap';
import styles from './Login.module.css';
import Cookies from 'js-cookie';

//날짜 및 시간 포맷팅
const formatDate = (dateString) => {
    const date = new Date(dateString);
    let formattedDate = date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    // 연도를 두 자리로 변환
    const yearTwoDigit = formattedDate.slice(0, 4).slice(-2);
    formattedDate = formattedDate.replace(/^\d{4}/, yearTwoDigit);

    return formattedDate.replace(',', '');
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
    const [selectedBtn, setSelectedBtn] = useState("전체");
    const [showError, setShowError] = useState(false); // 작업자 선택 안함

    // 팝업
    const [showNonePopup, setShowNonePopup] = useState(false); // 작업자 선택한게 없을 때
    const [showCompletePopup, setShowCompletePopup] = useState(false); // 유지보수 업데이트 완료

    const userId = Cookies.get('userId');

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
    // 처음 렌더링 될 때 첫 번째 줄 강조
    useEffect(() => {
        if (tableInstance && maints.length > 0) {
            const firstRow = tableInstance.repairTable.row(0).node();
            $(firstRow).css({
                'background-color': '#f0f8ff', // 밝은 파란색 배경
                'font-weight': 'bold' // 글자 굵게
            });

            const data = tableInstance.repairTable.row(firstRow).data();
            if (data && data.cable) { // null 체크 추가
                const rackLocation = data.cable.s_rack_location;
                const rackNumber = data.cable.s_rack_number;
                const portNumber = data.cable.s_port_number;

                const extractNumber = (str) => {
                    const match = str.match(/\d+/);
                    return match ? parseInt(match[0], 10) : null;
                };

                setHighlightPosition({
                    rackNumber: extractNumber(rackNumber),
                    portNumber: extractNumber(portNumber)
                });

                setRackLocationInfo(rackLocation);
            } else {
                console.warn("데이터 정의 없음");
            }
        }
    }, [tableInstance, maints]);

    // 유지 보수 내역 가져오기
    function getData() {
        axios.get('http://localhost:8089/qrancae/getmaintreq')
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
                        return data ? formatDate(data) : '';
                    }
                }
            ],
            pageLength: 5,
            lengthMenu: [[5, 10, 25, 50, 100], [5, 10, 25, 50, 100]],
            destroy: true,
            responsive: true
        });

        // 전체 선택/해제
        $('#select-all').on('click', function () {
            const isChecked = $(this).is(':checked');
            $('#repair-table .select-checkbox').prop('checked', isChecked);
        });

        // 해당 줄 클릭 시 표시
        $('#repair-table tbody').on('click', 'tr', function () {

            const data = repairTable.row(this).data();

            if (data && data.cable) {
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

                // 모든 줄에서 인라인 스타일 제거 (이전 강조 해제)
                $('#repair-table tbody tr').css({
                    'background-color': '',
                    'font-weight': ''
                });
                $(this).css({
                    'background-color': '#f0f8ff', // 밝은 파란색 배경
                    'font-weight': 'bold' // 글자 굵게
                });
            } else {
                console.warn('데이터가 없거나 cable 정보가 없습니다.');
            }
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
                { title: '케이블', data: 'cable.cable_idx', width: '15%' },
                {
                    title: '오류 내용',
                    data: null,
                    width: '30%', // 너비 30% 설정
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
                { title: '요청 날짜', data: 'maint_date', render: data => formatDate(data) || '없음' },
                {
                    title: '처리 작업자',
                    data: null,
                    render: function (data) {
                        return data.maintUser ? `${data.maintUser.user_name} (${data.maintUser.user_id})` : '요청중';
                    }
                },
                {
                    title: '상태',
                    data: null,
                    render: function (data) {
                        if (data.maintUser) {
                            if (data.maint_update) {
                                return `완료<br>(${formatDate(data.maint_date)})`
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
            ],
            pageLength: 5,
            lengthMenu: [[5, 10, 25, 50, 100], [5, 10, 25, 50, 100]],
            destroy: true,
            responsive: true
        });

        setTableInstance({ repairTable, repairingTable });

        // 오류 상태가 불량, 처리작업자 없는 항목 필터링
        const filterFaultyMaints = (data) => {
            return data.filter(item =>
                item.maint_qr === '불량' ||
                item.maint_cable === '불량' ||
                item.maint_power === '불량'
            );
        };

        // 전체/진행중/완료 탭으로 구분
        // 진행
        $('#tab-in-progress').on('click', function () {
            const filteredData = filterFaultyMaints(maints).filter(item =>
                item.maintUser !== null && item.maint_update === null
            );
            repairingTable.clear().rows.add(filteredData).draw();
            setSelectedBtn("진행중");
        });
        // 완료
        $('#tab-completed').on('click', function () {
            const filteredData = filterFaultyMaints(maints).filter(item =>
                item.maintUser !== null && item.maint_update !== null
            );
            repairingTable.clear().rows.add(filteredData).draw();
            setSelectedBtn("완료");
        });
        // 전체
        $('#tab-all').on('click', function () {
            repairingTable.clear().rows.add(filterFaultyMaints(maints).filter(item => item.maintUser !== null)).draw();
            setSelectedBtn("전체");
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
            setShowNonePopup(true);
        }
    };

    // 작업자 선택 및 추가 요청사항을 최종 확인 모달에서 확인
    const handleUserConfirm = () => {
        if (selectedUser) {
            // 최종 확인 모달 열고 그 전 모달 닫기
            setShowError(false);
            setConfirmModalIsOpen(true);
            setModalIsOpen(false);
        } else {
            setShowError(true);
        }
    };

    // 최종 확인 모달에서 제출 버튼 클릭 시
    const handleConfirmSubmit = () => {
        axios.post('http://localhost:8089/qrancae/maint/updateuser', {
            maintIdxs: selectedMaintIdxs,
            userId: selectedUser,
            alarmMsg: alarmMsg,
            adminId: userId,
        })
            .then(() => {
                setConfirmModalIsOpen(false); // 최종 확인 모달 닫기
                setShowCompletePopup(true);
            })
            .catch((err) => {
                console.log('처리 작업자 선택 오류:', err);
                alert('통신 오류가 발생했습니다. 다시 시도해주세요');
            });
    };
    // 알림창
    const handleUserChange = (event) => {
        setSelectedUser(event.target.value);
    };

    const handleAlarmMsgChange = (event) => {
        setAlarmMsg(event.target.value);
    };

    // 작업자 선택안된 팝업 닫기
    const closeNonePopup = () => {
        setShowNonePopup(false); // 팝업닫기
    };

    // 유지보수 업데이트 완료 팝업 닫기
    const closeCompletePopup = () => {
        setShowCompletePopup(false); // 팝업닫기
        window.location.reload();
    };

    return (
        <div className="wrapper">
            <style>
                {`
                    table.dataTable {
                        text-align: center;
                        white-space: nowrap;
                    `}
            </style>
            <Sidebar />
            <div className="main-panel">
                <Header />
                {showNonePopup && (
                    <ModalPopup
                        isOpen={showNonePopup}
                        onClose={closeNonePopup}
                        message="선택된 내역이 없습니다."
                    />
                )}
                {showCompletePopup && (
                    <ModalPopup
                        isOpen={showCompletePopup}
                        onClose={closeCompletePopup}
                        message="유지보수 내역이 업데이트되었습니다."
                    />
                )}
                <div className="container">
                    <div className="page-inner">
                        <div className="row">
                            <div className="col-md-4">
                                <div className="card card-round">
                                    <div className="card-header">
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <div className="card-title">케이블 위치 확인</div>
                                            <span className="tooltip-container">
                                                <span className="tooltip-icon">
                                                    <i className="fas fa-question-circle" style={{ color: '#4574C4', cursor: 'pointer' }}></i>
                                                </span>
                                                <span className="tooltip-text">점검 대상 케이블 목록의 행 선택하기</span>
                                            </span>
                                        </div>
                                        {rackLocationInfo && (
                                            <div className="card-tools">
                                                <h6 style={{ margin: 0 }}>랙 위치 : {rackLocationInfo}</h6>
                                            </div>
                                        )}
                                    </div>
                                    <div className="card-body" style={{ height: '100%', overflowY: 'auto' }}>
                                        <Rack highlightPosition={highlightPosition} />
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-8">
                                <div className="card card-round">
                                    <div className="card-header">
                                        <div className="card-title">점검 대상 케이블</div>
                                        <label className="btn btn-label-primary btn-round btn-sm" onClick={maintUserSelectClick}>
                                            <span className="btn-label">
                                                <i className="fas fa-check-double icon-spacing"></i>
                                            </span>
                                            작업자 선택
                                        </label>
                                    </div>
                                    <div className="card-body" style={{ height: '50%', overflowY: 'auto' }}>
                                        <div className="table-responsive">
                                            <table
                                                id="repair-table"
                                                className="display table table-head-bg-info table-striped table-bordered table-hover"
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
                                <div className="card card-round">
                                    <div className="card-header">
                                        <div className="card-title">케이블 점검 현황</div>
                                        <div>
                                            <label id="tab-all" className={`btn btn-label-primary btn-sm ${selectedBtn === "전체" ? 'select-btn-label' : ''}`}>전체</label>
                                            <label id="tab-in-progress" className={`btn btn-label-primary btn-sm ${selectedBtn === "진행중" ? 'select-btn-label' : ''}`}>진행중</label>
                                            <label id="tab-completed" className={`btn btn-label-primary btn-sm ${selectedBtn === "완료" ? 'select-btn-label' : ''}`}>완료</label>
                                        </div>
                                    </div>
                                    <div className="card-body" style={{ height: '50%', overflowY: 'auto' }}>
                                        <div className="table-responsive">
                                            <table
                                                id="repairing-table"
                                                className="display table table-head-bg-info table-striped table-bordered table-hover"
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


            {/* 작업자 선택 모달 */}
            <Modal show={modalIsOpen} onHide={() => setModalIsOpen(false)} centered>
                <Modal.Dialog className="custom-modal-dialog" style={{ width: '700px' }}>
                    <Modal.Header closeButton>
                        <Modal.Title>작업자 선택</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {selectedMaintsInfo.length > 0 && (
                            <>
                                <Form.Group controlId="userSelect" style={{ marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Form.Label>작업자</Form.Label>
                                        {showError && (
                                            <div className={styles.error} style={{ margin: 0 }}>
                                                *작업자를 선택해주세요.
                                            </div>
                                        )}
                                    </div>
                                    <Form.Control
                                        as="select"
                                        value={selectedUser}
                                        onChange={handleUserChange}
                                    >
                                        <option value="">작업자를 선택하세요</option>
                                        {users.map(user => (
                                            <option key={user.user_id} value={user.user_id}>
                                                {user.user_name} ({user.user_id})
                                            </option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>

                                <Form.Group controlId="alarmMsg">
                                    <Form.Label>추가 요청사항</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        value={alarmMsg}
                                        onChange={handleAlarmMsgChange}
                                        placeholder="추가 요청사항을 입력해주세요. 입력 시 메일도 함께 전송됩니다."
                                    />
                                </Form.Group>

                                <div className="mt-4">
                                    <h5>선택된 유지보수 내역</h5>
                                    <ul>
                                        {selectedMaintsInfo.map((item) => {
                                            // 상태 메시지를 배열로 수집
                                            const errorMessages = [];
                                            if (item.maint_qr === '불량') {
                                                errorMessages.push(<span key="qr">QR 상태(<span style={{ color: 'red' }}>{item.maint_qr}</span>)</span>);
                                            }
                                            if (item.maint_cable === '불량') {
                                                errorMessages.push(<span key="cable">케이블 상태(<span style={{ color: 'red' }}>{item.maint_cable}</span>)</span>);
                                            }
                                            if (item.maint_power === '불량') {
                                                errorMessages.push(<span key="power">전원 공급 상태(<span style={{ color: 'red' }}>{item.maint_power}</span>)</span>);
                                            }

                                            // 상태 메시지들을 쉼표로 구분하여 문자열로 변환
                                            const errorText = errorMessages.map((msg, index) => (
                                                <React.Fragment key={index}>
                                                    {msg}
                                                    {index < errorMessages.length - 1 && ', '}
                                                </React.Fragment>
                                            ));

                                            return (
                                                <li key={item.maint_idx} style={{ textAlign: 'left' }}>
                                                    <strong>케이블 번호 : </strong> {item.cable.cable_idx}<br />
                                                    <strong>오류 내용 : </strong>
                                                    <span style={{ marginLeft: '10px' }}>
                                                        {errorText}
                                                    </span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            </>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setModalIsOpen(false)}>취소</Button>
                        <Button variant="primary" onClick={handleUserConfirm}>확인</Button>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal>

            <Modal show={confirmModalIsOpen} onHide={() => setConfirmModalIsOpen(false)} centered>
                <Modal.Dialog className="modal-dialog" style={{ width: '700px' }}>
                    <Modal.Header closeButton>
                        <Modal.Title>요청 작업자와 요청 내용을 확인</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <h5>작업자: {users.find(user => user.user_id === selectedUser)?.user_name} ({selectedUser})</h5>
                        <p><strong>추가 요청사항:</strong> {alarmMsg || '없음'}</p>
                        <h5>선택된 유지보수 내역</h5>
                        <ul>
                            {selectedMaintsInfo.map((item) => {
                                // 상태 메시지를 배열로 수집
                                const errorMessages = [];
                                if (item.maint_qr === '불량') {
                                    errorMessages.push(<span key="qr">QR 상태(<span style={{ color: 'red' }}>{item.maint_qr}</span>)</span>);
                                }
                                if (item.maint_cable === '불량') {
                                    errorMessages.push(<span key="cable">케이블 상태(<span style={{ color: 'red' }}>{item.maint_cable}</span>)</span>);
                                }
                                if (item.maint_power === '불량') {
                                    errorMessages.push(<span key="power">전원 공급 상태(<span style={{ color: 'red' }}>{item.maint_power}</span>)</span>);
                                }

                                // 상태 메시지들을 쉼표로 구분하여 문자열로 변환
                                const errorText = errorMessages.map((msg, index) => (
                                    <React.Fragment key={index}>
                                        {msg}
                                        {index < errorMessages.length - 1 && ', '}
                                    </React.Fragment>
                                ));

                                return (
                                    <li key={item.maint_idx} style={{ textAlign: 'left' }}>
                                        <strong>케이블 번호 : </strong> {item.cable.cable_idx}<br />
                                        <strong>오류 내용 : </strong>
                                        <span style={{ marginLeft: '10px' }}>
                                            {errorText}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" style={{ backgroundColor: '#4574C4', borderColor: '#4574C4' }} onClick={() => setConfirmModalIsOpen(false)}>취소</Button>
                        <Button variant="primary" onClick={handleConfirmSubmit}>확인</Button>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal>
        </div>
    );
};

export default Repair;