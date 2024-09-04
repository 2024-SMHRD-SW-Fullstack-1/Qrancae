import React, { useEffect, useState } from 'react';
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import { ko } from 'date-fns/locale';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import 'datatables.net';
import axios from 'axios';

// 날짜 및 시간 포맷팅
const formatDate = (dateString) => {
  const date = new Date(dateString);
  let formattedDate = date.toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const yearTwoDigit = formattedDate.slice(0, 4).slice(-2);
  formattedDate = formattedDate.replace(/^\d{4}/, yearTwoDigit);

  return formattedDate.replace(',', '');
};

// 로그 테이블의 열 설정
const tableColumns = [
  { title: '번호', data: null, render: (_, __, row, meta) => meta.row + 1 },
  { title: 'log_idx', data: 'log_idx', visible: false },
  { title: '작업자', data: null, render: data => `${data.user.user_name}(${data.user.user_id})` },
  { title: '케이블', data: 'cable.cable_idx' },
  { title: '소스 랙 번호', data: 'cable.s_rack_number' },
  { title: '소스 랙 위치', data: 'cable.s_rack_location' },
  { title: '목적지 랙 번호', data: 'cable.d_rack_number' },
  { title: '목적지 랙 위치', data: 'cable.d_rack_location' },
  { title: '날짜 및 시간', data: 'log_date', render: data => formatDate(data) }
];

const Log = () => {
  const [logdata, setLogdata] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [year, setYear] = useState('All');
  const [month, setMonth] = useState('All');
  const [day, setDay] = useState('All');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('All');

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    const uniqueUsers = [...new Set(logdata.map(item => item.user.user_id))]
      .map(userId => logdata.find(item => item.user.user_id === userId).user)
      .sort((a, b) => a.user_name.localeCompare(b.user_name)); // 가나다 순으로 정렬
    setUsers(uniqueUsers);
  }, [logdata]);

  useEffect(() => {
    filterData();
  }, [dateRange, year, month, day, selectedUser]);

  useEffect(() => {
    const tableElement = $('#basic-logtables');
    if ($.fn.DataTable.isDataTable(tableElement)) {
      tableElement.DataTable().clear().rows.add(filteredData).draw();
    } else {
      tableElement.DataTable({
        data: filteredData,
        columns: tableColumns,
        destroy: true,
        paging: true,
        searching: true,
        lengthChange: true
      });
    }
  }, [filteredData]);

  const getData = async () => {
    try {
      const response = await axios.get('http://localhost:8089/qrancae/getlog');
      setLogdata(response.data);
      setFilteredData(response.data);
    } catch (error) {
      console.error('로그 데이터 오류:', error);
    }
  };

  const filterData = () => {
    let filtered = logdata;

    if (dateRange[0] && dateRange[1]) {
      const [startDate, endDate] = [new Date(dateRange[0]), new Date(dateRange[1])];
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(item => {
        const logDate = new Date(item.log_date);
        return logDate >= startDate && logDate <= endDate;
      });
    }

    if (year !== 'All') filtered = filtered.filter(item => new Date(item.log_date).getFullYear() === parseInt(year, 10));
    if (month !== 'All') filtered = filtered.filter(item => new Date(item.log_date).getMonth() + 1 === parseInt(month, 10));
    if (day !== 'All') filtered = filtered.filter(item => new Date(item.log_date).getDate() === parseInt(day, 10));
    if (selectedUser !== 'All') filtered = filtered.filter(item => item.user.user_id === selectedUser);

    setFilteredData(filtered);
  };

  const handleReset = () => {
    setDateRange([null, null]);
    setYear('All');
    setMonth('All');
    setDay('All');
    setSelectedUser('All');
    setFilteredData(logdata);
  };

  const handleReportDownload = () => {
    axios({
      url: 'http://localhost:8089/qrancae/reportLog',
      method: 'get',
      responseType: 'blob',
    }).then((res) => {
      // 날짜 포맷
      const getFormattedDate = () => {
        const now = new Date();
        const year = now.getFullYear().toString().slice(-2);
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');

        return `${year}${month}${day}`;
      };

      const filename = `log_${getFormattedDate()}.xlsx`;

      // Blob을 사용하여 파일 다운로드 처리
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename); // 파일 이름 지정
      document.body.appendChild(link);
      link.click();

      // 클릭 후 링크 제거
      document.body.removeChild(link);
    });
  }

  return (
    <div className="wrapper">
      <style>
        {`
          table.dataTable {
            text-align: center;
            white-space: nowrap;
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
                  <div className="card-header d-flex justify-content-between align-items-center" >
                    <h4 className="card-title">로그 내역</h4>
                    <div className="common-labels" style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ display: 'inline-block', marginRight: '20px' }}>
                        <label style={{ marginRight: '5px' }}>조회 일자</label>
                        <DatePicker
                          locale={ko}
                          selected={dateRange[0]}
                          onChange={dates => { setDateRange(dates); filterData(); }}
                          startDate={dateRange[0]}
                          endDate={dateRange[1]}
                          selectsRange
                          dateFormat="yyyy/MM/dd"
                          placeholderText="날짜 범위를 선택하세요."
                          className='date-picker'
                        />
                      </div>
                      <div style={{ display: 'inline-block' }}>
                        <label style={{ marginRight: '5px' }}>작업자</label>
                        <select value={selectedUser} onChange={e => { setSelectedUser(e.target.value); filterData(); }} style={{ display: 'inline-block', width: '200px', padding: '5px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '4px' }}>
                          <option value="All">전체</option>
                          {users.map(user => (
                            <option key={user.user_id} value={user.user_id}>
                              {user.user_name} ({user.user_id})
                            </option>
                          ))}
                        </select>
                        <label className='btn btn-label-primary btn-round btn-sm' onClick={handleReset} style={{ marginLeft: '10px' }}>선택 초기화</label>
                      </div>
                      <label className="btn btn-label-primary btn-round btn-sm" onClick={handleReportDownload}>
                        <span className="btn-label">
                          <i className="fas fa-file-excel icon-spacing"></i>
                        </span>
                        보고서 다운로드
                      </label>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table
                        id="basic-logtables"
                        className="display table table-head-bg-info table-striped table-hover"
                        style={{ width: '100%' }}
                      >
                        <thead>
                          <tr>
                            {tableColumns.map(col => <th key={col.title}>{col.title}</th>)}
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
