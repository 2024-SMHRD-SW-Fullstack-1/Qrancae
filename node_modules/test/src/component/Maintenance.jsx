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

  function initializeDataTable() {
    const table = $('#basic-mainttables').DataTable({
      data: maints,
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
          title: '처리 작업자',
          data: null,
          render: function (data) {
            if (data.maintUser) {
              return `${data.maintUser.user_name} (${data.maintUser.user_id})`;
            }
            return '없음';
          }
        },
        {
          title: '처리 날짜',
          data: 'maint_update',
          render: function (data) {
            if (data === null || data === '') {
              return '<button class="btn btn-primary check-btn">확인하기</button>';
            }
            return data;
          }
        }
      ],
      destroy: true // DataTable을 다시 초기화할 수 있도록 설정
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
                            <th><input type="checkbox" id="select-all" /></th>
                            <th>요청 작업자</th>
                            <th>케이블</th>
                            <th>랙 위치</th>
                            <th>랙 번호</th>
                            <th>QR 상태</th>
                            <th>케이블 상태</th>
                            <th>전원 공급 상태</th>
                            <th>요청 날짜</th>
                            <th>처리 작업자</th>
                            <th>처리 날짜</th>
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
