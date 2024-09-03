import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import 'datatables.net';
import axios from 'axios';

const Maintenance = () => {
  const [maints, setMaints] = useState([]);
  const [tableInstance, setTableInstance] = useState(null);

  // 내역 불러오기
  useEffect(() => {
    getData();
  }, []);

  // DataTable 초기화 및 갱신
  useEffect(() => {
    if (tableInstance) {
      tableInstance.clear().rows.add(maints).draw();
    } else {
      initializeDataTable();
    }
  }, [maints]);

  // db에서 가져오기(요청 날짜 순으로 정렬)
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
  // 유지보수 내역
  function initializeDataTable() {
    const table = $('#basic-mainttables').DataTable({
      data: maints,
      autoWidth: true,
      columns: [
        {
          title: '요청 작업자',
          data: null,
          render: function (data) {
            return `${data.user.user_name} (${data.user.user_id})`;
          }
        },
        { title: '케이블', data: 'cable.cable_idx' },
        { title: '랙 위치', data: 'cable.s_rack_location' },
        { title: '랙 번호', data: 'cable.s_rack_number' },
        {
          title: 'QR 상태',
          data: 'maint_qr',
          render: function (data) {
            const color = data === '불량' ? 'red' : 'green';
            return `<span style="color:${color}">${data}</span>`;
          }
        },
        {
          title: '케이블 상태',
          data: 'maint_cable',
          render: function (data) {
            const color = data === '불량' ? 'red' : 'green';
            return `<span style="color:${color}">${data}</span>`;
          }
        },
        {
          title: '전원 공급 상태',
          data: 'maint_power',
          render: function (data) {
            const color = data === '불량' ? 'red' : 'green';
            return `<span style="color:${color}">${data}</span>`;
          }
        },
        { title: '요청 날짜', data: 'maint_date' },
        {
          title: '상태',
          data: null,
          render: function (data) {
            const maintUser = data.maintUser;
            const maintUpdate = data.maint_update;

            if (!maintUser && !maintUpdate) {
              return '접수 대기중';
            } else if (maintUser && !maintUpdate) {
              return `진행중 (${maintUser.user_name})`;
            } else if (maintUser && maintUpdate) {
              return `${maintUpdate} (${maintUser.user_name}) 완료`;
            }
          }
        }
      ],
      columnDefs: [
        { targets: 7, width: '15%' }, // 요청 날짜의 너비를 15%로 설정
        { targets: 8, width: '18%' }// 상태 컬럼의 너비를 18%로 설정

      ],
      destroy: true // DataTable을 다시 초기화
    });

    setTableInstance(table);
  }

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
                            <th>요청 작업자</th>
                            <th>케이블</th>
                            <th>랙 위치</th>
                            <th>랙 번호</th>
                            <th>QR 상태</th>
                            <th>케이블 상태</th>
                            <th>전원 공급 상태</th>
                            <th>요청 날짜</th>
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
  );
};

export default Maintenance;
