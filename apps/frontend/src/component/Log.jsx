import React, { useEffect, useState } from 'react';
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import 'datatables.net';
import axios from 'axios';

const Log = () => {
  // 번호, 사용자id, 이름,케이블,소스 랙 번호,소스 랙 위치,목적지 랙 번호, 목적지 랙 위치,date
  const [logdata, setLogdata] = useState([]);
  // 오늘 날짜를 계산
  const today = new Date();
  // 기간 조회
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    $('#basic-logtables').DataTable({
      data: logdata,
      columns: [
        { title: '번호', data: 'log_idx' },
        { title: '사용자ID', data: 'user.user_id' },
        { title: '이름', data: 'user.user_name' },
        { title: '케이블', data: 'cable.cable_idx' },
        { title: '소스 랙 번호', data: 'cable.s_rack_number' },
        { title: '소스 랙 위치', data: 'cable.s_rack_location' },
        { title: '목적지 랙 번호', data: 'cable.d_rack_number' },
        { title: '목적지 랙 위치', data: 'cable.d_rack_location' },
        { title: '날짜 및 시간', data: 'log_date' }
      ],
    });

    // 컴포넌트가 언마운트될 때 DataTable을 파괴합니다
    return () => {
      if ($.fn.DataTable.isDataTable('#basic-logtables')) {
        $('#basic-logtables').DataTable().destroy();
      }

    };
  }, [logdata]);

  function getData() {
    axios({
      url: 'http://localhost:8089/qrancae/getlog',
      method: 'GET',
    })
      .then((res) => {
        console.log('logdata:' + res.data)
        setLogdata(res.data)
      })
      .catch((err) => {
        console.log('logdata error:' + err)
      });
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
                    <h4 className="card-title">로그 내역</h4>
                  </div>
                  <div className="card-body">
                    <div className="date-picker-container">
                      <DatePicker
                        selectsRange
                        startDate={startDate}
                        endDate={endDate}
                        onChange={handleDateChange}
                        isClearable
                        dateFormat="yyyy/MM/dd"
                        placeholderText="조회 기간을 선택하세요."
                        className="datepicker"
                      />
                    </div>
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

export default Log;