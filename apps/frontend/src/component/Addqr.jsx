import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import 'datatables.net';
import * as xlsx from 'xlsx';

const Addqr = () => {
  const [jsonData, setJsonData] = useState([]);

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

  useEffect(() => {
    $('#basic-datatables1').DataTable({});

    return () => {
      $('#basic-datatables1').DataTable().destroy();
    };
  }, []);

  useEffect(() => {
    // DataTable 초기화
    if (jsonData.length > 0) {
      if ($.fn.DataTable.isDataTable('#basic-datatables1')) {
        $('#basic-datatables1').DataTable().destroy();
      }
      $('#basic-datatables1').DataTable({
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
          { title: '소스 랙 번호', data: 's_rack_number' },
          { title: '소스 랙 위치', data: 's_rack_location' },
          { title: '소스 서버 이름', data: 's_server_name' },
          { title: '소스 포트 번호', data: 's_port_number' },
          { title: '목적지 랙 번호', data: 'd_rack_number' },
          { title: '목적지 랙 위치', data: 'd_rack_location' },
          { title: '목적지 서버 이름', data: 'd_server_name' },
          { title: '목적지 포트 번호', data: 'd_port_number' },
        ],
        columnDefs: [
          {
            targets: 0, // 첫 번째 컬럼 (인덱스 0)을 대상으로 함
            className: 'dt-control',
            orderable: false,
            render: function () {
              return '<input type="checkbox" checked>';
            },
          },
        ],
        initComplete: function () {
          // "Select all" 체크박스의 클릭 이벤트 처리
          $('#select-all').on('click', function () {
            const rows = $('#basic-datatables1')
              .DataTable()
              .rows({ search: 'applied' })
              .nodes();
            $('input[type="checkbox"]', rows).prop('checked', this.checked);
          });
        },
      });
    }

    console.log('jsonData has been updated:', jsonData);

    // 컴포넌트가 언마운트될 때 DataTable을 파괴합니다
    return () => {
      if ($.fn.DataTable.isDataTable('#basic-datatables1')) {
        $('#basic-datatables1').DataTable().destroy();
      }
    };
  }, [jsonData]);

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

  // 입력값이 변경될 때 호출되는 함수
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs({
      ...inputs,
      [name]: value,
    });
  };

  // 하나 추가 버튼 클릭
  const handleSubmit = (e) => {
    e.preventDefault();
    // 빈 입력값이 있는지 확인
    for (const key in inputs) {
      if (inputs[key].trim() === '') {
        alert('케이블의 모든 정보를 입력해주세요.');
        return;
      }
    }
    setJsonData([inputs, ...jsonData]);
    console.log(jsonData);
  };

  function registerQr() {
    axios({
      url: 'http://localhost:8089/qrancae/registerQr',
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      data: jsonData,
    }).then((res) => {
      console.log(res);
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="wrapper">
        <style>
          {`
          table.dataTable thead th:first-child,
          table.dataTable tbody td:first-child {
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
                      <h4 className="card-title">케이블 등록</h4>
                      <div className="cable-btns">
                        <label className="btn btn-label-primary btn-round btn-sm">
                          <span className="btn-label">
                            <i className="fas fa-times"></i>
                          </span>
                          선택 삭제
                        </label>
                        <label
                          htmlFor="input-file"
                          className="btn btn-label-primary btn-round btn-sm"
                        >
                          <span className="btn-label">
                            <i className="fas fa-file-upload"></i>
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
                          onClick={registerQr()}
                        >
                          <span className="btn-label">
                            <i className="fas fa-check-circle"></i>
                          </span>
                          전체 등록
                        </label>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="table-responsive">
                        <table
                          id="basic-datatables1"
                          className="display table table-striped table-hover"
                        >
                          <thead>
                            <tr>
                              <th>
                                <input
                                  type="submit"
                                  value="추가"
                                  className="btn btn-label-primary btn-round btn-sm"
                                />
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
                            <tr>
                              <th>
                                <input
                                  type="checkbox"
                                  id="select-all"
                                  checked
                                />
                              </th>
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
    </form>
  );
};

export default Addqr;
