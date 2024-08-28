import React, { useEffect, useState } from 'react';
import Rack from './Rack';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';


const Repair = () => {
    const [inspectionData, setInspectionData] = useState([]);
    const [inspectingData, setInspectingData] = useState([]);

    // 점검 대상 케이블
    useEffect(() => {
        $('repair-table').DataTable({
            data: inspectionData,
            columns: [
                { title: 'No', data: 'ins_idx' },
                { title: '오류', data: 'ins_error' },
                { title: '작업자', data: 'ins_user' },
                { title: '메시지', data: 'ins_msg' },
            ],
        });

        // 컴포넌트가 언마운트될 때 DataTable을 파괴
        return () => {
            $('#inspection-table').DataTable().destroy();
        };
    }, [inspectionData]);

    // 점검 중인 케이블
    useEffect(() => {
        $('#repairing-table').DataTable({
            data: inspectingData,
            columns: [
                { title: 'No', data: 'ins_idx' },
                { title: '오류', data: 'ins_error' },
                { title: '작업자', data: 'ins_user' },
                { title: '메시지', data: 'ins_msg' },
                { title: '전송', data: 'ins_trans' },
            ],
        });

        // 컴포넌트가 언마운트될 때 DataTable을 파괴
        return () => {
            $('#inspecting-table').DataTable().destroy();
        };
    }, [inspectingData]);

    return (
        <div className="App">
            <div className="wrapper">
                <Sidebar />

                <div className="main-panel">
                    <Header />

                    <div className="container">
                        <div className="page-inner">
                            <div className="row">
                                <div className="col-md-4 d-flex flex-column">
                                    <div className="card card-round flex-grow-1">
                                        <div className="card-header">
                                            <div className="card-head-row">
                                                <div className="card-title">케이블 위치 확인</div>
                                                <div className="card-tools">
                                                    <select className="form-select input-fixed" id="notify_state">
                                                        <option value="1">점검 No.1</option>
                                                        <option value="2">점검 No.2</option>
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
                                                            <th>No</th>
                                                            <th>오류</th>
                                                            <th>작업자</th>
                                                            <th>메시지</th>
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
                                                <div className="card-title">점검 중인 케이블</div>
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
                                                            <th>오류</th>
                                                            <th>작업자</th>
                                                            <th>메시지</th>
                                                            <th>전송</th>
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
        </div>
    );
};

export default Repair;
