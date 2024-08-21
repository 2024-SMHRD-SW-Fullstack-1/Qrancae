import React, { useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import 'datatables.net';

const Maintenance = () => {
  useEffect(() => {
    // 컴포넌트가 마운트될 때 DataTable을 초기화합니다
    $('#basic-datatables').DataTable({});

    // 컴포넌트가 언마운트될 때 DataTable을 파괴합니다
    return () => {
      $('#basic-datatables').DataTable().destroy();
    };
  }, []);
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
                    <h4 className="card-title">케이블 목록</h4>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table
                        id="basic-datatables"
                        className="display table table-striped table-hover"
                      >
                        <thead>
                          <tr>
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
                            <th>상태</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>001</td>
                            <td>Rack01</td>
                            <td>DataCenter01</td>
                            <td>Webserver01</td>
                            <td>eth0</td>
                            <td>Rack02</td>
                            <td>DataCenter02</td>
                            <td>AppServer01</td>
                            <td>eth0</td>
                            <td>24-08-21</td>
                            <td>미출력</td>
                          </tr>
                          <tr>
                            <td>001</td>
                            <td>Rack01</td>
                            <td>DataCenter01</td>
                            <td>Webserver01</td>
                            <td>eth0</td>
                            <td>Rack02</td>
                            <td>DataCenter02</td>
                            <td>AppServer01</td>
                            <td>eth0</td>
                            <td>24-08-21</td>
                            <td>미출력</td>
                          </tr>
                          <tr>
                            <td>001</td>
                            <td>Rack01</td>
                            <td>DataCenter01</td>
                            <td>Webserver01</td>
                            <td>eth0</td>
                            <td>Rack02</td>
                            <td>DataCenter02</td>
                            <td>AppServer01</td>
                            <td>eth0</td>
                            <td>24-08-21</td>
                            <td>미출력</td>
                          </tr>
                          <tr>
                            <td>001</td>
                            <td>Rack01</td>
                            <td>DataCenter01</td>
                            <td>Webserver01</td>
                            <td>eth0</td>
                            <td>Rack02</td>
                            <td>DataCenter02</td>
                            <td>AppServer01</td>
                            <td>eth0</td>
                            <td>24-08-21</td>
                            <td>미출력</td>
                          </tr>
                          <tr>
                            <td>001</td>
                            <td>Rack01</td>
                            <td>DataCenter01</td>
                            <td>Webserver01</td>
                            <td>eth0</td>
                            <td>Rack02</td>
                            <td>DataCenter02</td>
                            <td>AppServer01</td>
                            <td>eth0</td>
                            <td>24-08-21</td>
                            <td>미출력</td>
                          </tr>
                          <tr>
                            <td>001</td>
                            <td>Rack01</td>
                            <td>DataCenter01</td>
                            <td>Webserver01</td>
                            <td>eth0</td>
                            <td>Rack02</td>
                            <td>DataCenter02</td>
                            <td>AppServer01</td>
                            <td>eth0</td>
                            <td>24-08-21</td>
                            <td>미출력</td>
                          </tr>
                          <tr>
                            <td>001</td>
                            <td>Rack01</td>
                            <td>DataCenter01</td>
                            <td>Webserver01</td>
                            <td>eth0</td>
                            <td>Rack02</td>
                            <td>DataCenter02</td>
                            <td>AppServer01</td>
                            <td>eth0</td>
                            <td>24-08-21</td>
                            <td>미출력</td>
                          </tr>
                          <tr>
                            <td>001</td>
                            <td>Rack01</td>
                            <td>DataCenter01</td>
                            <td>Webserver01</td>
                            <td>eth0</td>
                            <td>Rack02</td>
                            <td>DataCenter02</td>
                            <td>AppServer01</td>
                            <td>eth0</td>
                            <td>24-08-21</td>
                            <td>미출력</td>
                          </tr>
                          <tr>
                            <td>001</td>
                            <td>Rack01</td>
                            <td>DataCenter01</td>
                            <td>Webserver01</td>
                            <td>eth0</td>
                            <td>Rack02</td>
                            <td>DataCenter02</td>
                            <td>AppServer01</td>
                            <td>eth0</td>
                            <td>24-08-21</td>
                            <td>미출력</td>
                          </tr>
                          <tr>
                            <td>001</td>
                            <td>Rack01</td>
                            <td>DataCenter01</td>
                            <td>Webserver01</td>
                            <td>eth0</td>
                            <td>Rack02</td>
                            <td>DataCenter02</td>
                            <td>AppServer01</td>
                            <td>eth0</td>
                            <td>24-08-21</td>
                            <td>미출력</td>
                          </tr>
                          <tr>
                            <td>001</td>
                            <td>Rack01</td>
                            <td>DataCenter01</td>
                            <td>Webserver01</td>
                            <td>eth0</td>
                            <td>Rack02</td>
                            <td>DataCenter02</td>
                            <td>AppServer01</td>
                            <td>eth0</td>
                            <td>24-08-21</td>
                            <td>미출력</td>
                          </tr>
                          <tr>
                            <td>001</td>
                            <td>Rack01</td>
                            <td>DataCenter01</td>
                            <td>Webserver01</td>
                            <td>eth0</td>
                            <td>Rack02</td>
                            <td>DataCenter02</td>
                            <td>AppServer01</td>
                            <td>eth0</td>
                            <td>24-08-21</td>
                            <td>미출력</td>
                          </tr>
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
      </div>
    </div>
  );
};

export default Maintenance;
