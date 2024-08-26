import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import 'datatables.net';
import axios from 'axios';

const Maintenance = () => {
  const [maints, setMaints] = useState([]);

  //maint_idx,user_id,cable_idx,maint_qr,maint_cable,maint_power
  useEffect(() => {
    axios.get('http://localhost:8089/qrancae/getmaint')
      .then((res) => {
        console.log('maintData:' + res.data)
        setMaints(res.data);

      })
      .catch((err) => {
        console.log('maintData error:' + err)
      })
  }, []);

  // 데이터가 변경될 때 DataTable을 초기화
  useEffect(() => {
    if (maints.length > 0) {
      $('#basic-mainttables').DataTable({
        data: maints,
        columns: [
          { title: '번호', data: 'maint_idx' },
          { title: '담당자 ID', data: 'user.user_id' },
          { title: '담당자 이름', data: 'user.user_name' },
          { title: '케이블', data: 'cable.cable_idx' },
          { title: 'QR 상태', data: 'maint_qr' },
          { title: '케이블 상태', data: 'maint_cable' },
          { title: '전원 공급 상태', data: 'maint_power' },
          {
            title: '유지보수 확인',
            data: 'maint_date',
            render: function (data) {
              if (data === null || data === '') {
                return '<button class="btn btn-primary check-btn">확인하기</button>';
              }
              return data;
            }
          },
        ]
      });

      // DataTables가 렌더링된 후에 버튼 클릭 이벤트 리스너를 추가
      $('#basic-mainttables').on('click', '.check-btn', function () {
        // 클릭된 버튼의 행을 찾습니다.
        var row = $(this).closest('tr');
        var rowData = $('#basic-mainttables').DataTable().row(row).data();
        // 버튼 클릭 시 알림을 표시합니다.
        alert(`확인하기 버튼이 클릭되었습니다. 유지보수 번호: ${rowData.maint_idx}`);
      });
    }

    return () => {
      if ($.fn.DataTable.isDataTable('#basic-mainttables')) {
        $('#basic-mainttables').DataTable().destroy();
      }

    };
  }, [maints]);

  return (
    <div className="wrapper">
      <Sidebar />

      <div className="main-panel">
        <Header />

        <div className="container">
          <div className="page-inner">
            <div className="row">
              <div className="col-md-12">
                <div className="card">
                  <div className="card-header">
                    <h4 className="card-title">유지보수 내역</h4>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table
                        id="basic-mainttables"
                        className="display table table-striped table-bordered table-hover"
                      >
                        <thead>
                          <tr>
                            <th>번호</th>
                            <th>담당자 ID</th>
                            <th>담당자 이름</th>
                            <th>케이블</th>
                            <th>QR 상태</th>
                            <th>케이블 상태</th>
                            <th>전원 공급 상태</th>
                            <th>유지보수 날짜</th>
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
  );
};

export default Maintenance;