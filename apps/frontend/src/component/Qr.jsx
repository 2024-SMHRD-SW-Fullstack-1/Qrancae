import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import 'datatables.net';

const Qr = () => {
  const [jsonData, setJsonData] = useState([]);

  useEffect(() => {
    // 페이지 로딩 시 데이터 가져오기
    getData();
  }, []);

  useEffect(() => {
    // 컴포넌트가 마운트될 때 DataTable을 초기화
    $('#basic-datatables').DataTable({
      ordering: false,
      data: jsonData,
      columns: [
        {
          title: '<input type="checkbox" id="select-all" checked>',
          orderable: false,
          render: function () {
            return '<input type="checkbox" class="row-select" checked>';
          },
        },
        { title: '케이블', data: 'cable_idx' },
        { title: '소스 랙 번호', data: 's_rack_number' },
        { title: '소스 랙 위치', data: 's_rack_location' },
        { title: '소스 서버 이름', data: 's_server_name' },
        { title: '소스 포트 번호', data: 's_port_number' },
        { title: '목적지 랙 번호', data: 'd_rack_number' },
        { title: '목적지 랙 위치', data: 'd_rack_location' },
        { title: '목적지 서버 이름', data: 'd_server_name' },
        { title: '목적지 포트 번호', data: 'd_port_number' },
        {
          title: '등록일',
          data: 'cable_date',
          render: function (data) {
            return data ? data : '-';
          },
        },
        {
          title: '출력 상태',
          data: 'qr',
          render: function (data) {
            if (data.qr_status != 'X') {
              return `<span class="badge badge-success">출력</span>`;
            } else {
              return `<span class="badge badge-warning">미출력</span>`;
            }
          },
        },
      ],
      columnDefs: [
        {
          targets: 0, // 첫 번째 컬럼
          className: 'dt-control',
          orderable: false,
          render: function () {
            return '<input type="checkbox" checked>';
          },
        },
        {
          targets: [2, 3, 4, 5],
          className: 'source-data',
        },
        {
          targets: [6, 7, 8, 9],
          className: 'destination-data',
        },
      ],
      initComplete: function () {
        // "Select all" 체크박스의 클릭 이벤트 처리
        $('#select-all').on('click', function () {
          const rows = $('#basic-datatables')
            .DataTable()
            .rows({ search: 'applied' })
            .nodes();
          $('input[type="checkbox"]', rows).prop('checked', this.checked);
        });
      },
    });

    // 컴포넌트가 언마운트될 때 DataTable을 파괴
    return () => {
      $('#basic-datatables').DataTable().destroy();
    };
  }, [jsonData]);

  function getData() {
    axios({
      url: 'http://localhost:8089/qrancae/cablelist',
      method: 'GET',
    }).then((res) => {
      setJsonData(res.data);
    }).catch((error) => {
      console.error('Error fetching data: ', error);
    });
  }

  return (
    <div className="wrapper">
      <style>
        {`
            table.dataTable thead th:first-child,
            table.dataTable tbody td:first-child {
              text-align: center;
            }

            table.dataTable td:nth-child(11),
            table.dataTable th:nth-child(11),
            table.dataTable td:nth-child(12),
            table.dataTable th:nth-child(12) {
              text-align: center;
            }

            table.dataTable thead .sorting::before,
            table.dataTable thead .sorting::after,
            table.dataTable thead .sorting_asc::before,
            table.dataTable thead .sorting_asc::after,
            table.dataTable thead .sorting_desc::before,
            table.dataTable thead .sorting_desc::after {
              display: none;
            }
          `}
      </style>
      <Sidebar />

      <div className="main-panel">
        <Header />

        <div className="container">
          <div className="page-inner">
            <div className="page-header">
              <h3 className="fw-bold mb-3">QR코드 관리</h3>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="card">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h4 className="card-title">케이블 목록</h4>
                    <div className="cable-btns">
                      <label className="btn btn-label-primary btn-round btn-sm">
                        <span className="btn-label">
                          <i className="fas fa-times"></i>
                        </span>
                        선택 삭제
                      </label>
                      <Link to="/addQr">
                        <label className="btn btn-label-primary btn-round btn-sm">
                          <span className="btn-label">
                            <i className="fas fa-plus"></i>
                          </span>
                          케이블 추가
                        </label>
                      </Link>
                      <label className="btn btn-label-primary btn-round btn-sm">
                        <span className="btn-label">
                          <i className="fas fa-print"></i>
                        </span>
                        QR 인쇄
                      </label>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table
                        id="basic-datatables"
                        className="display table table-striped table-bordered table-hover"
                      >
                        <thead>
                          <tr>
                            <th>
                              <input
                                type="checkbox"
                                id="select-all"
                                checked
                              />
                            </th>
                            <th>케이블</th>
                            <th>랙 번호</th>
                            <th>랙 위치</th>
                            <th>서버 이름</th>
                            <th>포트 번호</th>
                            <th>랙 번호</th>
                            <th>랙 위치</th>
                            <th>서버 이름</th>
                            <th>포트 번호</th>
                            <th>등록일</th>
                            <th>출력 상태</th>
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

export default Qr;
