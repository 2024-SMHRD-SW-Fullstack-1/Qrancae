import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import 'datatables.net';
import axios from 'axios';

const Log = () => {
  // 번호, 사용자id, 이름,케이블,소스 랙 번호,소스 랙 위치,목적지 랙 번호, 목적지 랙 위치,date
  const [logdata, setLogdata] = useState([]);
  // const logdata = [
  //   {
  //     log_idx: 1,
  //     user_id: 'hong',
  //     user_name: '김길동',
  //     cable_idx: '100',
  //     s_rack_number: 'u20',
  //     s_rack_location: 'rack01',
  //     d_rack_number: 'd20',
  //     d_rack_location: 'DataCenter01',
  //     log_date: '2024-08-21 12:22:35'
  //   },
  //   {
  //     log_idx: 2,
  //     user_id: 'hong',
  //     user_name: '이길동',
  //     cable_idx: '100',
  //     s_rack_number: 'u20',
  //     s_rack_location: 'rack01',
  //     d_rack_number: 'd20',
  //     d_rack_location: 'DataCenter01',
  //     log_date: '2024-08-21 12:22:35'
  //   }
  // ];

  // const tabledata = logdata.map(item => [
  //   item.log_idx,
  //   item.user_id,
  //   item.user_name,
  //   item.cable_idx,
  //   item.s_rack_location,
  //   item.d_rack_location,
  //   item.log_date
  // ]);
  useEffect(() => {
    axios({
      url: 'http://localhost:8089/qrancae/getlog',
      method: 'post'
    })
      .then((res) => {
        console.log('logdata:' + res)
        setLogdata(res.data)
      })
  });

  useEffect(() => {
    // 컴포넌트가 마운트될 때 DataTable을 초기화합니다
    $('#basic-logtables').DataTable({
      data: logdata,
      columns: [
        { title: '번호', data: 'log_idx' },
        { title: '사용자ID', data: 'user_id' },
        { title: '이름', data: 'user_name' },
        { title: '케이블', data: 'cable_idx' },
        { title: '소스 랙 번호', data: 's_rack_number' },
        { title: '소스 랙 위치', data: 's_rack_location' },
        { title: '목적지 랙 번호', data: 'd_rack_number' },
        { title: '목적지 랙 위치', data: 'd_rack_location' },
        { title: '날짜 및 시간', data: 'log_date' }
      ]
    });

    // 컴포넌트가 언마운트될 때 DataTable을 파괴합니다
    return () => {
      $('#basic-logtables').DataTable().destroy();
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
                    <h4 className="card-title">로그 내역</h4>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table
                        id="basic-logtables"
                        className="display table table-striped table-hover"
                      >
                        <thead>
                          <tr>
                            <th>번호</th>
                            <th>사용자ID</th>
                            <th>이름</th>
                            <th>케이블</th>
                            <th>소스 랙 번호</th>
                            <th>소스 랙 위치</th>
                            <th>목적지 랙 번호</th>
                            <th>목적지 랙 위치</th>
                            <th>날짜 및 시간</th>
                          </tr>
                        </thead>
                        <tbody>
                          {logdata.map((data, index) =>
                            <tr key={index}>
                              <td>{data.log_idx}</td>
                              <td>{data.user_id}</td>
                              <td>{data.user_name}</td>
                              <td>{data.cable_idx}</td>
                              <td>{data.s_rack_location}</td>
                              <td>{data.d_rack_location}</td>
                              <td>{data.log_date}</td>
                            </tr>
                          )}
                          <tr>
                            <td>001</td>
                            <td>hong</td>
                            <td>홍길동</td>
                            <td>Rack01</td>
                            <td>DataCenter01</td>
                            <td>DataCenter02</td>
                            <td>24-08-21</td>
                          </tr>
                          <tr>

                            <td>002</td>
                            <td>hong</td>
                            <td>홍길동</td>
                            <td>Rack01</td>
                            <td>DataCenter01</td>
                            <td>DataCenter02</td>
                            <td>24-08-21</td>
                          </tr>
                          <tr>
                            <td>003</td>
                            <td>hong</td>
                            <td>홍길동</td>
                            <td>Rack01</td>
                            <td>DataCenter01</td>
                            <td>DataCenter02</td>
                            <td>24-08-21</td>
                          </tr>
                          <tr>
                            <td>004</td>
                            <td>hong</td>
                            <td>홍길동</td>
                            <td>Rack01</td>
                            <td>DataCenter01</td>
                            <td>DataCenter02</td>
                            <td>24-08-21</td>
                          </tr>
                          <tr>
                            <td>005</td>
                            <td>hong</td>
                            <td>홍길동</td>
                            <td>Rack01</td>
                            <td>DataCenter01</td>
                            <td>DataCenter02</td>
                            <td>24-08-21</td>
                          </tr>
                          <tr>
                            <td>006</td>
                            <td>hong</td>
                            <td>홍길동</td>
                            <td>Rack01</td>
                            <td>DataCenter01</td>
                            <td>DataCenter02</td>
                            <td>24-08-21</td>
                          </tr>
                          <tr>
                            <td>007</td>
                            <td>hong</td>
                            <td>홍길동</td>
                            <td>Rack01</td>
                            <td>DataCenter01</td>
                            <td>DataCenter02</td>
                            <td>24-08-21</td>
                          </tr>
                          <tr>
                            <td>008</td>
                            <td>hong</td>
                            <td>홍길동</td>
                            <td>Rack01</td>
                            <td>DataCenter01</td>
                            <td>DataCenter02</td>
                            <td>24-08-21</td>
                          </tr>
                          <tr>
                            <td>009</td>
                            <td>hong</td>
                            <td>홍길동</td>
                            <td>Rack01</td>
                            <td>DataCenter01</td>
                            <td>DataCenter02</td>
                            <td>24-08-21</td>
                          </tr>
                          <tr>
                            <td>010</td>
                            <td>hong</td>
                            <td>홍길동</td>
                            <td>Rack01</td>
                            <td>DataCenter01</td>
                            <td>DataCenter02</td>
                            <td>24-08-21</td>
                          </tr>
                          <tr>
                            <td>011</td>
                            <td>hong</td>
                            <td>홍길동</td>
                            <td>Rack01</td>
                            <td>DataCenter01</td>
                            <td>DataCenter02</td>
                            <td>24-08-21</td>
                          </tr>
                          <tr>
                            <td>012</td>
                            <td>hong</td>
                            <td>홍길동</td>
                            <td>Rack01</td>
                            <td>DataCenter01</td>
                            <td>DataCenter02</td>
                            <td>24-08-21</td>
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

export default Log;