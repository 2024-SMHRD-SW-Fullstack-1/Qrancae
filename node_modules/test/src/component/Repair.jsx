import React, { useEffect, useState } from 'react';
import Rack from './Rack';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import 'datatables.net';

const Repair = () => {
    const [inspectionData, setInspectionData] = useState([]);
    const [inspectingData, setInspectingData] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedCable, setSelectedCable] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [availableUsers, setAvailableUsers] = useState([]);

    useEffect(() => {
        setInspectionData([
            {
                ins_idx: 1,
                cable_idx: 10,
                ins_error: '케이블 상태 불량',
                alarm_msg: '',
                ins_user: '김길동(kim)',
                ins_date: '2024-08-01',

            },
            {
                ins_idx: 2,
                cable_idx: 12,
                ins_error: '전원 공급 상태 불량',
                alarm_msg: '네트워크 불량',
                ins_user: '홍길동(hong)',
                ins_date: '2024-08-01',

            },
            {
                ins_idx: 3,
                cable_idx: 1,
                ins_error: 'QR 상태 불량',
                alarm_msg: '물리적 손상',
                ins_user: '박길동(park)',
                ins_date: '2024-08-01',

            }
        ]);

        setInspectingData([
            {
                ins_idx: 1,
                cable_idx: 2,
                ins_error: 'QR 상태 불량',
                alarm_msg: '물리적 손상',
                ins_user: '김길동(kim)',
                ins_date: '2024-08-01',
                maint_user: '이길동(lee)',
                maint_date: ''
            },
            {
                ins_idx: 2,
                cable_idx: 23,
                ins_error: '전원 공급 상태 불량',
                alarm_msg: '네트워크 불량',
                ins_user: '이길동(lee)',
                ins_date: '2024-08-01',
                maint_user: '홍길동(hong)',
                maint_date: '2024-08-02'
            },
            {
                ins_idx: 3,
                cable_idx: 16,
                ins_error: '전원 공급 상태 불량',
                alarm_msg: '',
                ins_user: '박길동(park)',
                ins_date: '2024-08-01',
                maint_user: '김길동(kim)',
                maint_date: '2024-08-02'
            }
        ]);

        setAvailableUsers(['김길동', '홍길동', '박길동', '이길동']);
    }, []);

    useEffect(() => {
        if ($.fn.DataTable.isDataTable('#repair-table')) {
            $('#repair-table').DataTable().destroy();
        }

        $('#repair-table').DataTable({
            data: inspectionData,
            columns: [
                {
                    title: '<input type="checkbox" id="select-all"/>',
                    data: null,
                    render: () => '<input type="checkbox" class="select-item"/>'
                },
                { title: 'No', data: 'ins_idx' },
                { title: '케이블', data: 'cable_idx' },
                {
                    title: '오류 내역',
                    data: null,
                    render: (_, __, row) => row.alarm_msg ? `${row.ins_error} (${row.alarm_msg})` : `${row.ins_error}`
                },
                { title: '요청 작업자', data: 'ins_user' },
                { title: '요청 날짜', data: 'ins_date' },
            ]
        });

        $('#repair-table').on('click', '#select-all', function () {
            const isChecked = $(this).is(':checked');
            $('#repair-table .select-item').prop('checked', isChecked);
        });

        $('#repair-table').on('click', '.select-item', function () {
            const allChecked = $('#repair-table .select-item').length === $('#repair-table .select-item:checked').length;
            $('#select-all').prop('checked', allChecked);
        });

        return () => {
            if ($.fn.DataTable.isDataTable('#repair-table')) {
                $('#repair-table').DataTable().destroy();
            }
        };
    }, [inspectionData]);

    useEffect(() => {
        if ($.fn.DataTable.isDataTable('#repairing-table')) {
            $('#repairing-table').DataTable().destroy();
        }

        $('#repairing-table').DataTable({
            data: inspectingData,
            columns: [
                { title: 'No', data: 'ins_idx' },
                { title: '케이블', data: 'cable_idx' },
                {
                    title: '오류 내용',
                    data: null,
                    render: (_, __, row) => row.alarm_msg ? `${row.ins_error} (${row.alarm_msg})` : `${row.ins_error}`
                },
                { title: '요청 작업자', data: 'ins_user' },
                { title: '요청 날짜', data: 'ins_date' },
                { title: '처리 작업자', data: 'maint_user' },
                {
                    title: '상태',
                    data: null,
                    render: (_, __, row) => row.maint_date ? `${row.maint_date} (완료)` : '진행 중'
                }
            ]
        });

        return () => {
            if ($.fn.DataTable.isDataTable('#repairing-table')) {
                $('#repairing-table').DataTable().destroy();
            }
        };
    }, [inspectingData]);

    const handleUserSelectClick = () => {
        const selectedIds = $('#repair-table .select-item:checked').map(function () {
            return $(this).closest('tr').find('td').eq(1).text();
        }).get();
        if (selectedIds.length > 0) {
            setSelectedCable(selectedIds);
            setModalIsOpen(true);
        } else {
            alert('선택된 항목이 없습니다.');
        }
    };

    const handleUserConfirm = () => {
        if (selectedCable.length > 0) {
            const updatedData = inspectionData.map(item => {
                if (selectedCable.includes(item.ins_idx.toString())) {
                    return { ...item, select_user: selectedUsers.join(', ') };
                }
                return item;
            });
            setInspectionData(updatedData);
        }
        setModalIsOpen(false);
    };

    const handleUserChange = (event) => {
        const value = event.target.value;
        setSelectedUsers(prev =>
            prev.includes(value) ? prev.filter(user => user !== value) : [...prev, value]
        );
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
                                <div className="col-md-3 d-flex flex-column">
                                    <div className="card card-round flex-grow-1">
                                        <div className="card-header">
                                            <div className="card-head-row">
                                                <div className="card-title">케이블 위치 확인</div>
                                            </div>
                                        </div>
                                        <div className="card-body" style={{ height: '100%', overflowY: 'auto' }}>
                                            {/* <Rack /> */}
                                            <img
                                                src="assets/img/rack.JPG"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-9 d-flex flex-column">
                                    <div className="card card-round flex-grow-1 mb-2">
                                        <div className="card-header d-flex justify-content-between align-items-center">
                                            <div className="card-title">점검 대상 케이블</div>
                                            <label className="btn btn-primary btn-border btn-round btn-sm" onClick={handleUserSelectClick}>
                                                <span className="btn-label">
                                                    <i className="far fa-calendar-plus icon-spacing"></i>
                                                </span>
                                                작업자 선택
                                            </label>
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
                                                            <th>No</th>
                                                            <th>케이블</th>
                                                            <th>오류 내역</th>
                                                            <th>요청 작업자</th>
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
                                                            <th>No</th>
                                                            <th>케이블</th>
                                                            <th>오류 내용</th>
                                                            <th>요청 작업자</th>
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
                                <select id="userSelect" className="form-control" multiple value={selectedUsers} onChange={handleUserChange}>
                                    {availableUsers.map(user => (
                                        <option key={user} value={user}>
                                            {user}
                                        </option>
                                    ))}
                                </select>
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