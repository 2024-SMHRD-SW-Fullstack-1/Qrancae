import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import 'datatables.net';
import * as xlsx from 'xlsx';
import ModalPopup from './popups/ModalPopup';
import DeletePopup from './popups/DeletePopup';

const Addqr = () => {
  // 로딩중인지 확인
  const [loading, setLoading] = useState(false);
  // 삭제 기능 팝업 상태
  const [showPopup, setShowPopup] = useState(false);
  const [showNonePopup, setShowNonePopup] = useState(false);
  // qr 코드 등록 완료 팝업 상태
  const [showQrPopup, setShowQrPopup] = useState(false);
  const [showNoneQrPopup, setShowNoneQrPopup] = useState(false);
  // 테이블에 표시할 json 데이터
  const [jsonData, setJsonData] = useState([]);
  // 케이블 하나 추가할 때
  const [showNoneCablePopup, setShowNoneCablePopup] = useState(false);
  const [inputs, setInputs] = useState({
    s_rack_number: '',
    s_rack_location: '',
    s_server_name: '',
    s_port_number: '',
    d_rack_number: '',
    d_rack_location: '',
    d_server_name: '',
    d_port_number: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    if ($.fn.DataTable.isDataTable('#basic-datatables1')) {
      $('#basic-datatables1').DataTable().destroy();
    }
    $('#basic-datatables1').DataTable({
      ordering: false,
      data: jsonData,
      columns: [
        {
          title: '<input type="checkbox" id="select-all">',
          render: function () {
            return '<input type="checkbox" class="row-select">';
          },
        },
        { title: '랙 번호', data: 's_rack_number' },
        { title: '랙 위치', data: 's_rack_location' },
        { title: '서버 이름', data: 's_server_name' },
        { title: '포트 번호', data: 's_port_number' },
        { title: '랙 번호', data: 'd_rack_number' },
        { title: '랙 위치', data: 'd_rack_location' },
        { title: '서버 이름', data: 'd_server_name' },
        { title: '포트 번호', data: 'd_port_number' },
      ],
      columnDefs: [
        {
          targets: 0,
          className: 'dt-control',
          width: '60px',
          render: function () {
            return '<input type="checkbox">';
          },
        },
      ],
      initComplete: function () {
        $('#select-all').on('click', function () {
          const rows = $('#basic-datatables1')
            .DataTable()
            .rows({ search: 'applied' })
            .nodes();
          $('input[type="checkbox"]', rows).prop('checked', this.checked);
        });
      },
    });

    console.log('jsonData has been updated:', jsonData);

    return () => {
      if ($.fn.DataTable.isDataTable('#basic-datatables1')) {
        $('#basic-datatables1').DataTable().destroy();
      }
    };
  }, [jsonData]);

  // 엑셀 양식 다운로드
  const downloadExcelTemplate = () => {
    const fileUrl = '/assets/cable_template.xlsx';

    // 링크 요소를 생성하고, 다운로드 속성을 설정
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = 'template.xlsx'; // 다운로드할 파일 이름
    document.body.appendChild(link); // 링크를 문서에 추가
    link.click(); // 링크를 클릭하여 다운로드를 시작
    document.body.removeChild(link);
  };

  // 엑셀 파일 업로드
  const readUploadFile = (e) => {
    e.preventDefault();
    if (e.target.files) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target.result;
        const workbook = xlsx.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = xlsx.utils.sheet_to_json(worksheet);
        setJsonData([...json, ...jsonData]);
      };
      reader.readAsArrayBuffer(e.target.files[0]);
    }
  };

  // 케이블 정보 하나 추가
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs({
      ...inputs,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    for (const key in inputs) {
      if (inputs[key].trim() === '') {
        setShowNoneCablePopup(true);
        return;
      }
    }
    setJsonData([inputs, ...jsonData]);
    console.log('등록된 하나의 케이블 정보', jsonData);

    // 입력값 초기화
    setInputs({
      s_rack_number: '',
      s_rack_location: '',
      s_server_name: '',
      s_port_number: '',
      d_rack_number: '',
      d_rack_location: '',
      d_server_name: '',
      d_port_number: '',
    });
  };

  // 팝업 기능
  const openPopup = () => {
    const selectedRows = $('#basic-datatables1 .row-select:checked').length;
    if (selectedRows === 0) {
      setShowNonePopup(true);
    } else {
      setShowPopup(true);
    }
  };

  const closePopup = () => setShowPopup(false);
  const closeNonePopup = () => setShowNonePopup(false);

  // 선택된 케이블 삭제
  const handleDeleteSelected = () => {
    const selectedIndexes = [];
    $('#basic-datatables1 .row-select:checked').each(function () {
      const row = $(this).closest('tr');
      const index = $('#basic-datatables1').DataTable().row(row).index();
      selectedIndexes.push(index);
    });

    const updatedData = jsonData.filter(
      (_, index) => !selectedIndexes.includes(index)
    );
    setJsonData(updatedData);
  };

  // 전체 케이블 QR코드로 등록
  const registerQr = () => {
    const selectedRows = $('#basic-datatables1 .row-select:checked').length;
    if (selectedRows === 0) {
      setShowNoneQrPopup(true); // 선택된 케이블이 없을 때 팝업
      return;
    }

    setLoading(true);
    axios({
      url: `${process.env.REACT_APP_API_URL}/api/registerQr`,
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      data: jsonData,
    }).then((res) => {
      console.log(res);
      setLoading(false);
      setShowQrPopup(true); // QR 코드 등록 완료 팝업 표시
    });
  };

  const closeQrPopup = () => {
    setShowQrPopup(false); // QR 코드 등록 완료 팝업 닫기
    navigate('/qr'); // 케이블 목록 페이지로 이동
  };

  const closeNoneQrPopup = () => {
    setShowNoneQrPopup(false);
  };

  const closeNoneCablePopup = () => {
    setShowNoneCablePopup(false);
  };

  return (
    <div className="wrapper">
      <style>
        {`
          table.dataTable {
            text-align: center;
          }
        `}
      </style>
      <Sidebar />

      <div className="main-panel">
        <Header />
        {loading && (
          <div className="overlay">
            <img
              src="assets/img/spinner.svg"
              alt="Loading..."
              className="spinner"
            />
          </div>
        )}
        {showPopup && (
          <DeletePopup
            isOpen={showPopup}
            closePopup={closePopup}
            handleDeleteSelected={handleDeleteSelected}
          />
        )}

        {showNonePopup && (
          <ModalPopup
            isOpen={showNonePopup}
            onClose={closeNonePopup}
            message="선택된 케이블이 없습니다."
          />
        )}

        {showQrPopup && (
          <ModalPopup
            isOpen={showQrPopup}
            onClose={closeQrPopup}
            message="QR 코드 등록이 완료되었습니다."
          />
        )}
        {showNoneQrPopup && (
          <ModalPopup
            isOpen={showNoneQrPopup}
            onClose={closeNoneQrPopup}
            message="등록할 케이블을 선택해주세요."
          />
        )}
        {showNoneCablePopup && (
          <ModalPopup
            isOpen={showNoneCablePopup}
            onClose={closeNoneCablePopup}
            message="케이블의 모든 정보를 입력해주세요."
          />
        )}

        <div className="container">
          <div className="page-inner">
            <div className="row">
              <div className="col-md-12">
                <div className="card">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h4 className="card-title">QR 코드 관리 / 케이블 등록</h4>
                    <div className="cable-btns">
                      <label
                        className="btn btn-label-primary btn-round btn-sm"
                        onClick={openPopup}
                      >
                        <span className="btn-label">
                          <i className="fas fa-times icon-spacing"></i>
                        </span>
                        선택 삭제
                      </label>
                      <label
                        htmlFor="download-file"
                        className="btn btn-label-primary btn-round btn-sm"
                        onClick={downloadExcelTemplate}
                      >
                        <span className="btn-label">
                          <i className="fas fa-file-download icon-spacing"></i>
                        </span>
                        엑셀 양식 다운
                      </label>
                      <label
                        htmlFor="input-file"
                        className="btn btn-label-primary btn-round btn-sm"
                      >
                        <span className="btn-label">
                          <i className="fas fa-file-upload icon-spacing"></i>
                        </span>
                        엑셀 업로드
                      </label>
                      <input
                        type="file"
                        id="input-file"
                        accept=".xlsx, .xls"
                        onChange={readUploadFile}
                        style={{ display: 'none' }}
                      />
                      <label
                        className="btn btn-label-primary btn-round btn-sm"
                        onClick={registerQr}
                      >
                        <span className="btn-label">
                          <i className="fas fa-check-circle icon-spacing"></i>
                        </span>
                        전체 등록
                      </label>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table
                        id="basic-datatables1"
                        className="display table table-striped table-bordered table-hover"
                      >
                        <thead>
                          <tr>
                            <th>
                              <label
                                className="btn btn-label-primary btn-round btn-sm"
                                onClick={handleSubmit}
                              >
                                추가
                              </label>
                            </th>
                            <th>
                              <input
                                type="text"
                                className="form-control input-full"
                                id="inlineinput"
                                name="s_rack_number"
                                placeholder="랙 번호"
                                value={inputs.s_rack_number}
                                onChange={handleChange}
                              />
                            </th>
                            <th>
                              <input
                                type="text"
                                className="form-control input-full"
                                id="inlineinput"
                                name="s_rack_location"
                                placeholder="랙 위치"
                                value={inputs.s_rack_location}
                                onChange={handleChange}
                              />
                            </th>
                            <th>
                              <input
                                type="text"
                                className="form-control input-full"
                                id="inlineinput"
                                name="s_server_name"
                                placeholder="서버 이름"
                                value={inputs.s_server_name}
                                onChange={handleChange}
                              />
                            </th>
                            <th>
                              <input
                                type="text"
                                className="form-control input-full"
                                id="inlineinput"
                                name="s_port_number"
                                placeholder="포트 번호"
                                value={inputs.s_port_number}
                                onChange={handleChange}
                              />
                            </th>
                            <th>
                              <input
                                type="text"
                                className="form-control input-full"
                                id="inlineinput"
                                name="d_rack_number"
                                placeholder="랙 번호"
                                value={inputs.d_rack_number}
                                onChange={handleChange}
                              />
                            </th>
                            <th>
                              <input
                                type="text"
                                className="form-control input-full"
                                id="inlineinput"
                                name="d_rack_location"
                                placeholder="랙 위치"
                                value={inputs.d_rack_location}
                                onChange={handleChange}
                              />
                            </th>
                            <th>
                              <input
                                type="text"
                                className="form-control input-full"
                                id="inlineinput"
                                name="d_server_name"
                                placeholder="서버 이름"
                                value={inputs.d_server_name}
                                onChange={handleChange}
                              />
                            </th>
                            <th>
                              <input
                                type="text"
                                className="form-control input-full"
                                id="inlineinput"
                                name="d_port_number"
                                placeholder="포트 번호"
                                value={inputs.d_port_number}
                                onChange={handleChange}
                              />
                            </th>
                          </tr>
                          <tr className="input-datas">
                            <th rowSpan="2">
                              <input
                                type="checkbox"
                                id="select-all"
                                className="header-checkbox"
                                defaultChecked={true}
                              />
                            </th>
                            <th colSpan="4">
                              <i
                                className="fas fa-sign-out-alt"
                                style={{ color: 'red', marginRight: '.5rem' }}
                              ></i>{' '}
                              출발점 (Start)
                            </th>
                            <th colSpan="4">
                              <i
                                className="fas fa-sign-in-alt"
                                style={{
                                  color: '#1572e8',
                                  marginRight: '.5rem',
                                }}
                              ></i>{' '}
                              도착점 (End)
                            </th>
                          </tr>
                          <tr className="input-datas">
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

export default Addqr;
