import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import ReactToPrint from "react-to-print";
import axios from 'axios';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import 'datatables.net';

const Qr = () => {
  const [jsonData, setJsonData] = useState([]);
  const [selectedCableIds, setSelectedCableIds] = useState(new Set());
  const [qrList, setQrList] = useState([]);
  const printRef = useRef(null);

  useEffect(() => {
    // 페이지 로딩 시 데이터 가져오기
    getData();
  }, []);

  useEffect(() => {
    console.log('selected', selectedCableIds);
    axios({
      url: 'http://localhost:8089/qrancae/printQr',
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      data: Array.from(selectedCableIds),
    }).then((res) => {
      console.log('qr 이미지 리스트', res);
      setQrList(res.data);
    });
  }, [selectedCableIds]);

  useEffect(() => {
    // 데이터가 존재할 때만 DataTables를 초기화
    if (jsonData.length > 0) {
      const table = $('#basic-datatables').DataTable({
        responsive: true,
        columns: [
          {
            title: '<input type="checkbox" id="select-all">',
            orderable: false,
          },
          { title: '케이블', data: 'cable_idx' },
          { title: '랙 번호', data: 's_rack_number' },
          { title: '랙 위치', data: 's_rack_location' },
          { title: '서버 이름', data: 's_server_name' },
          { title: '포트 번호', data: 's_port_number' },
          { title: '랙 번호', data: 'd_rack_number' },
          { title: '랙 위치', data: 'd_rack_location' },
          { title: '서버 이름', data: 'd_server_name' },
          { title: '포트 번호', data: 'd_port_number' },
          {
            title: '등록일',
            data: 'cable_date',
          },
          {
            title: '출력 상태',
            data: 'qr.qr_status',
          },
        ],
        columnDefs: [
          {
            targets: 0, // 첫 번째 컬럼
            orderable: false,
            className: 'orderable-false',
          },
          {
            targets: [2, 3, 4, 5],
            className: 'source-data',
          },
          {
            targets: [6, 7, 8, 9],
            className: 'destination-data',
          },
          {
            targets: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            orderable: true,
          },
        ],
        initComplete: function () {
          const updateSelectedCableIds = () => {
            const ids = $('input.row-select:checked').map(function () {
              return $(this).data('id');
            }).get();
            setSelectedCableIds(new Set(ids));
          };

          $('#select-all').on('click', function () {
            const isChecked = this.checked;
            $('input.row-select', table.rows({ search: 'applied' }).nodes()).prop('checked', isChecked);
            updateSelectedCableIds();
          });

          $('#basic-datatables tbody').on('change', 'input.row-select', function () {
            updateSelectedCableIds();
          });
        },
      });

      return () => {
        $('#basic-datatables').DataTable().destroy();
      };
    }
  }, [jsonData]);

  const getData = () => {
    axios.get('http://localhost:8089/qrancae/cablelist')
      .then((res) => {
        setJsonData(res.data);
      })
      .catch((error) => {
        console.error('Error fetching data: ', error);
      });
  };

  return (
    <div className="wrapper">
      <style>
        {`
            table.dataTable {
              text-align: center;
            }

            table.dataTable thead th:first-child .sorting::before,
            table.dataTable thead th:first-child .sorting::after,
            table.dataTable thead th:first-child .sorting_asc::before,
            table.dataTable thead th:first-child .sorting_asc::after,
            table.dataTable thead th:first-child .sorting_desc::before,
            table.dataTable thead th:first-child .sorting_desc::after {
              display: none !important;
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
                    <div className="common-labels">
                      <label className="btn btn-label-primary btn-round btn-sm">
                        <span className="btn-label">
                          <i className="fas fa-times icon-spacing"></i>
                        </span>
                        선택 삭제
                      </label>
                      <Link to="/addQr">
                        <label className="btn btn-label-primary btn-round btn-sm">
                          <span className="btn-label">
                            <i className="fas fa-plus icon-spacing"></i>
                          </span>
                          케이블 추가
                        </label>
                      </Link>
                      <ReactToPrint
                        trigger={() => (
                          <label className="btn btn-label-primary btn-round btn-sm">
                            <span className="btn-label">
                              <i className="fas fa-print icon-spacing"></i>
                            </span>
                            QR 인쇄
                          </label>
                        )}
                        content={() => printRef.current}
                      />
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
                        <tbody>
                          {jsonData.map((item, index) => (
                            <tr key={index}>
                              <td>
                                <input
                                  type="checkbox"
                                  className="row-select"
                                  data-id={item.cable_idx}
                                />
                              </td>
                              <td>{item.cable_idx}</td>
                              <td>{item.s_rack_number}</td>
                              <td>{item.s_rack_location}</td>
                              <td>{item.s_server_name}</td>
                              <td>{item.s_port_number}</td>
                              <td>{item.d_rack_number}</td>
                              <td>{item.d_rack_location}</td>
                              <td>{item.d_server_name}</td>
                              <td>{item.d_port_number}</td>
                              <td>{item.cable_date ? item.cable_date : '-'}</td>
                              <td>
                                {item.qr.qr_status !== 'X' ? (
                                  <span className="badge badge-success">출력</span>
                                ) : (
                                  <span className="badge badge-warning">미출력</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />

        <div ref={printRef} style={{ display: 'none' }} className='printable-content'>
          {qrList.length > 0 ? (
            qrList.map((item, index) => (
              <div className='qrBox' key={index}>
                <div className='qrBoxContent'>
                  <div className='qrBoxContent-item'>
                    <span className='start-end'>S</span>
                    <img className='QR-img' src={`data:image/png;base64,${item.img}`} alt="QR Code" />
                    <div>
                      <p className='QR-start-data'><b>start</b> {item.source}</p>
                      <p className='QR-end-data'><b>end</b> {item.destination}</p>
                    </div>
                    <img className='QR-img' src={`data:image/png;base64,${item.img}`} alt="QR Code" />
                  </div>
                  <span className='start-end'>{'<->'}</span>
                  <div className='qrBoxContent-item'>
                    <img className='QR-img' src={`data:image/png;base64,${item.img}`} alt="QR Code" />
                    <div>
                      <p className='QR-start-data'><b>start</b> {item.source}</p>
                      <p className='QR-end-data'><b>end</b> {item.destination}</p>
                    </div>
                    <img className='QR-img' src={`data:image/png;base64,${item.img}`} alt="QR Code" />
                    <span className='start-end'>E</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>선택된 케이블이 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Qr;
