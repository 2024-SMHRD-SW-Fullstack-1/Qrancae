import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import ReactToPrint from "react-to-print";
import axios from 'axios';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import 'datatables.net';
import QrDeletePopup from './popups/QrDeletePopup';

const Qr = () => {
  // 상태 변수 선언
  const [jsonData, setJsonData] = useState([]); // 테이블 데이터
  const [selectedCableIds, setSelectedCableIds] = useState(new Set()); // 선택된 케이블 ID
  const [qrList, setQrList] = useState([]); // QR 코드 리스트
  const [showModal, setShowModal] = useState(false); // 모달 표시 여부
  const [modalMessage, setModalMessage] = useState(''); // 모달 메시지
  const [deleteConfirmed, setDeleteConfirmed] = useState(false); // 삭제 확인 여부
  const printRef = useRef(null); // 프린트 참조



  // 컴포넌트 마운트 시 데이터 가져오기
  useEffect(() => {
    getData();
  }, []);

  // 선택된 케이블 ID가 변경될 때 QR 코드 리스트 업데이트
  useEffect(() => {
    console.log('selected', selectedCableIds);
    axios.post('http://localhost:8089/qrancae/printQr', Array.from(selectedCableIds), {
      headers: { 'Content-Type': 'application/json' }
    }).then((res) => {
      console.log('qr 이미지 리스트', res);
      setQrList(res.data);
    });
  }, [selectedCableIds]);

  // jsonData가 업데이트될 때 DataTable 초기화
  useEffect(() => {
    if (jsonData.length > 0) {
      initializeDataTable();
    }
  }, [jsonData]);

  // 데이터 가져오기
  const getData = () => {
    axios.get('http://localhost:8089/qrancae/cablelist')
      .then((res) => setJsonData(res.data))
      .catch((error) => console.error('Error fetching data: ', error));
  };

  // DataTable 초기화
  const initializeDataTable = () => {
    // 기존 DataTables 인스턴스가 있으면 파괴
    if ($.fn.DataTable.isDataTable('#basic-datatables')) {
      $('#basic-datatables').DataTable().clear().destroy();
    }

    const table = $('#basic-datatables').DataTable({
      responsive: true,
      autoWidth: true,
      columns: [
        {
          title: '<input type="checkbox" id="select-all" checked>',
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
          title: '케이블 연결',
          data: 'cable_date',
        },
        {
          title: '출력 상태',
          data: 'qr.qr_status',
        },
      ],
      initComplete: function () {
        const updateSelectedCableIds = () => {
          const ids = $('input.row-select:checked').map(function () {
            return $(this).data('id');
          }).get();
          setSelectedCableIds(new Set(ids));
        };

        // '전체 선택' 체크박스 클릭 시
        $('#select-all').on('click', function () {
          const isChecked = this.checked;
          $('input.row-select', table.rows({ search: 'applied' }).nodes()).prop('checked', isChecked);
          updateSelectedCableIds();
        });

        // 개별 체크박스 변경 시
        $('#basic-datatables tbody').on('change', 'input.row-select', function () {
          updateSelectedCableIds();
        });

        // 데이터 로드 후 기본적으로 체크박스 선택
        setTimeout(() => {
          $('input.row-select').prop('checked', true);
          updateSelectedCableIds();
        }, 0)
      },
      destroy: true,
    });

    // 테이블 그리기 후 선택된 ID 업데이트
    table.on('draw', function () {
      const ids = $('input.row-select:checked').map(function () {
        return $(this).data('id');
      }).get();
      setSelectedCableIds(new Set(ids));
    });

    // 컴포넌트 언마운트 시 DataTable 제거
    return () => {
      $('#basic-datatables').DataTable().destroy();
    };
  };

  // 선택된 항목 삭제 버튼 클릭 핸들러
  const handleDeleteSelected = () => {
    if (selectedCableIds.size === 0) {
      setModalMessage('케이블을 선택해주세요.');
      setShowModal(true);
      return;
    }

    setModalMessage(`${Array.from(selectedCableIds).join(', ')}`);
    setDeleteConfirmed(true);
    setShowModal(true);
  };

  // 삭제 확인 후 서버에 삭제 요청
  const confirmDelete = () => {
    axios.post('http://localhost:8089/qrancae/deleteQr', Array.from(selectedCableIds), {
      headers: { 'Content-Type': 'application/json' }
    }).then((res) => {
      console.log("선택 삭제", res.data);
      setShowModal(false);
      window.location.reload();
    }).catch((error) => {
      console.error('Error deleting data: ', error);
    });
  };

  // 모달 닫기 핸들러
  const handleCloseModal = () => {
    setShowModal(false);
  };

  const arrow = "<->"; // 화살표 문자

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear().toString().slice(-2); // 두 자리 연도
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 월 (01, 02, ...)
    const day = String(date.getDate()).padStart(2, '0'); // 일 (01, 02, ...)
    const hours = String(date.getHours()).padStart(2, '0'); // 시간 (00, 01, ...)
    const minutes = String(date.getMinutes()).padStart(2, '0'); // 분 (00, 01, ...)

    return (
      <>
        <div>연결 완료</div>
        <div>({year}.{month}.{day} {hours}시 {minutes}분)</div>
      </>
    );
  };

  return (
    <div className="wrapper">
      <style>
        {`
            table.dataTable {
              text-align: center;
              white-space: nowrap;
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
            <div className="row">
              <div className="col-md-12">
                <div className="card">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h4 className="card-title">QR 코드 관리 / 케이블 목록</h4>
                    <div className="common-labels">
                      <label className="btn btn-label-primary btn-round btn-sm" onClick={handleDeleteSelected}>
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
                        className="display table table-head-bg-info table-striped table-bordered table-hover"
                      >
                        <thead>
                          <tr>
                            <th rowSpan="2">
                              <input
                                type="checkbox"
                                id="select-all"
                                className="header-checkbox"
                                defaultChecked={true}
                              />
                            </th>
                            <th rowSpan="2">케이블</th>
                            <th colSpan="4">
                              <i className="fas fa-sign-out-alt" style={{ color: 'red', marginRight: '.5rem' }}></i> 출발점 (Start)
                            </th>
                            <th colSpan="4">
                              <i className="fas fa-sign-in-alt" style={{ color: '#1572e8', marginRight: '.5rem' }}></i> 도착점 (End)</th>
                            <th rowSpan="2">케이블 연결</th>
                            <th rowSpan="2">출력 상태</th>
                          </tr>
                          <tr>
                            <th>랙 번호</th>
                            <th>랙 위치</th>
                            <th>서버 이름</th>
                            <th>포트 번호</th>
                            <th>랙 번호</th>
                            <th>랙 위치</th>
                            <th>서버 이름</th>
                            <th>포트 번호</th>
                          </tr>
                        </thead>
                        <tbody>
                          {jsonData.map((item, index) => (
                            <tr key={index}>
                              <td>
                                <input
                                  type="checkbox"
                                  className="row-select"
                                  defaultChecked={true}
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
                              <td>{item.cable_date ? formatDate(item.cable_date) : '-'}</td>
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

        {/* QR 코드 인쇄용 콘텐츠 */}
        <div ref={printRef} style={{ display: 'none' }} className='printable-content col-md-12'>
          <table className='QR-print-table'>
            {qrList.length > 0 ? (
              qrList.map((item, index) => (
                <React.Fragment key={index}>
                  <tbody className='QR-print-body'>
                    <tr>
                      <td rowSpan="2" className='cell-s'>S</td>
                      <td rowSpan="2" className='cell-img'>
                        <img className='QR-img' src={`data:image/png;base64,${item.img}`} alt="QR Code" />
                      </td>
                      <td className='cell-start'>
                        <b>Start</b> {item.source}
                      </td>
                      <td rowSpan="2" className='cell-img'>
                        <img className='QR-img' src={`data:image/png;base64,${item.img}`} alt="QR Code" />
                      </td>
                      <td rowSpan="2" className='cell-arrow'>{arrow}</td>
                      <td rowSpan="2" className='cell-img'>
                        <img className='QR-img' src={`data:image/png;base64,${item.img}`} alt="QR Code" />
                      </td>
                      <td className='cell-start'>
                        <b>Start</b> {item.source}
                      </td>
                      <td rowSpan="2" className='cell-img'>
                        <img className='QR-img' src={`data:image/png;base64,${item.img}`} alt="QR Code" />
                      </td>
                      <td rowSpan="2" className='cell-e'>E</td>
                    </tr>
                    <tr>
                      <td className='cell-end'>
                        <b>End</b> {item.destination}
                      </td>
                      <td className='cell-end'>
                        <b>End</b> {item.destination}
                      </td>
                    </tr>
                  </tbody>
                  <tbody className='QR-print-body'>
                    <tr>
                      <td rowSpan="2" className='cell-s'>S</td>
                      <td rowSpan="2" className='cell-img'>
                        <img className='QR-img' src={`data:image/png;base64,${item.img}`} alt="QR Code" />
                      </td>
                      <td className='cell-start'>
                        <b>Start</b> {item.source}
                      </td>
                      <td rowSpan="2" className='cell-img'>
                        <img className='QR-img' src={`data:image/png;base64,${item.img}`} alt="QR Code" />
                      </td>
                      <td rowSpan="2" className='cell-arrow'>{arrow}</td>
                      <td rowSpan="2" className='cell-img'>
                        <img className='QR-img' src={`data:image/png;base64,${item.img}`} alt="QR Code" />
                      </td>
                      <td className='cell-start'>
                        <b>Start</b> {item.source}
                      </td>
                      <td rowSpan="2" className='cell-img'>
                        <img className='QR-img' src={`data:image/png;base64,${item.img}`} alt="QR Code" />
                      </td>
                      <td rowSpan="2" className='cell-e'>E</td>
                    </tr>
                    <tr>
                      <td className='cell-end'>
                        <b>End</b> {item.destination}
                      </td>
                      <td className='cell-end'>
                        <b>End</b> {item.destination}
                      </td>
                    </tr>
                  </tbody>
                </React.Fragment>
              ))
            ) : (
              <tbody>
                <tr>
                  <td>선택된 케이블이 없습니다.</td>
                </tr>
              </tbody>
            )}
          </table>
        </div>
        <div>
          {/* QR 코드 삭제 모달 */}
          <QrDeletePopup
            show={showModal}
            handleClose={handleCloseModal}
            modalMessage={modalMessage}
            onConfirm={confirmDelete}
            onCancel={deleteConfirmed ? handleCloseModal : undefined} // 조건부로 onCancel 처리
          />
        </div>
      </div>
    </div>
  );
};

export default Qr;
