import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import 'datatables.net';

const Addqr = () => {
  useEffect(() => {
    // 컴포넌트가 마운트될 때 DataTable을 초기화합니다
    $('#basic-datatables').DataTable({
      ordering: false,
    });

    // 컴포넌트가 언마운트될 때 DataTable을 파괴합니다
    return () => {
      $('#basic-datatables').DataTable().destroy();
    };
  }, []);
  return (
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
                      <a
                        href="#"
                        className="btn btn-label-primary btn-round btn-sm"
                      >
                        <span className="btn-label">
                          <i className="fas fa-times"></i>
                        </span>
                        선택 삭제
                      </a>
                      <Link to="/qr/add">
                        <a
                          href="#"
                          className="btn btn-label-primary btn-round btn-sm"
                        >
                          <span className="btn-label">
                            <i className="fas fa-file-upload"></i>
                          </span>
                          엑셀 업로드
                        </a>
                      </Link>
                      <a
                        href="#"
                        className="btn btn-label-primary btn-round btn-sm"
                      >
                        <span className="btn-label">
                          <i className="fas fa-check-circle"></i>
                        </span>
                        전체 등록
                      </a>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table
                        id="basic-datatables"
                        className="display table table-striped table-hover"
                      >
                        <thead>
                          <tr>
                            <th>
                              <label>
                                <input type="checkbox" />
                              </label>
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
                        <tbody>
                          <tr>
                            <td>
                              <label>
                                <input type="checkbox" />
                              </label>
                            </td>
                            <td>Rack01</td>
                            <td>DataCenter01</td>
                            <td>Webserver01</td>
                            <td>eth0</td>
                            <td>Rack02</td>
                            <td>DataCenter02</td>
                            <td>AppServer01</td>
                            <td>eth0</td>
                          </tr>
                          <tr>
                            <td>
                              <label>
                                <input type="checkbox" />
                              </label>
                            </td>
                            <td>Rack01</td>
                            <td>DataCenter01</td>
                            <td>Webserver01</td>
                            <td>eth0</td>
                            <td>Rack02</td>
                            <td>DataCenter02</td>
                            <td>AppServer01</td>
                            <td>eth0</td>
                          </tr>
                        </tbody>
                        <tfoot>
                          <tr>
                            <td>
                              <a
                                href="#"
                                className="btn btn-label-primary btn-round btn-sm"
                              >
                                추가
                              </a>
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-control input-full"
                                id="inlineinput"
                                placeholder="랙 번호"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-control input-full"
                                id="inlineinput"
                                placeholder="랙 위치"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-control input-full"
                                id="inlineinput"
                                placeholder="서버 이름"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-control input-full"
                                id="inlineinput"
                                placeholder="포트 번호"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-control input-full"
                                id="inlineinput"
                                placeholder="랙 번호"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-control input-full"
                                id="inlineinput"
                                placeholder="랙 위치"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-control input-full"
                                id="inlineinput"
                                placeholder="서버 이름"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-control input-full"
                                id="inlineinput"
                                placeholder="포트 번호"
                              />
                            </td>
                          </tr>
                        </tfoot>
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
