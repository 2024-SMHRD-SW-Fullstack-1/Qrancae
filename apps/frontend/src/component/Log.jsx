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
  return new Date(dateString).toLocaleString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'
  }).replace(',', '');
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

// 연도, 월, 일 선택 옵션 생성
const generateOptions = (type) => {
  const currentYear = new Date().getFullYear();
  const options = type === 'year'
    ? [...Array(10).keys()].map(i => currentYear - i)
    : type === 'month'
      ? [...Array(12).keys()].map(i => i + 1)
      : [...Array(31).keys()].map(i => i + 1);

  return options.map(value => (
    <option key={value} value={value}>{value}</option>
  ));
};

const Log = () => {
  const [logdata, setLogdata] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [year, setYear] = useState('All');
  const [month, setMonth] = useState('All');
  const [day, setDay] = useState('All');
  const [searchMode, setSearchMode] = useState(false);
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
        searching: false,
        lengthChange: false
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

  useEffect(() => {
    handleReset();
  }, [searchMode]);

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
                    <button
                      onClick={() => setSearchMode(prev => !prev)}
                      style={{ marginBottom: '20px' }}
                    >
                      {searchMode ? '기본 검색' : '세부 검색'}
                    </button>
                  </div>
                  <div className="card-body">
                    <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '20px' }}>
                      {!searchMode ? (
                        <>
                          <div style={{ marginRight: '20px', marginBottom: '10px' }}>
                            <label style={{ marginRight: '10px' }}>조회일자:</label>
                            <DatePicker
                              locale={ko}
                              selected={dateRange[0]}
                              onChange={dates => { setDateRange(dates); filterData(); }}
                              startDate={dateRange[0]}
                              endDate={dateRange[1]}
                              selectsRange
                              dateFormat="yyyy/MM/dd"
                              placeholderText="날짜 범위를 선택하세요."
                              style={{ marginRight: '10px' }}
                            />
                            <button onClick={handleReset}>초기화</button>
                          </div>

                          {dateRange[0] && dateRange[1] && (
                            <div style={{ marginBottom: '20px' }}>
                              <strong>선택된 날짜 범위:</strong> {dateRange[0].toLocaleDateString()} - {dateRange[1].toLocaleDateString()}
                            </div>
                          )}
                        </>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {['year', 'month', 'day'].map((type) => (
                            <div key={type} style={{ display: 'flex', alignItems: 'center', marginRight: '20px' }}>
                              <label style={{ marginRight: '10px' }}>
                                {type === 'year' ? '년' : type === 'month' ? '월' : '일'}:
                              </label>
                              <select
                                value={type === 'year' ? year : type === 'month' ? month : day}
                                onChange={e => {
                                  const value = e.target.value;
                                  type === 'year' ? setYear(value) : type === 'month' ? setMonth(value) : setDay(value);
                                  filterData();
                                }}
                                style={{ display: 'block', width: '100px', padding: '5px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '4px' }}
                              >
                                <option value="All">전체</option>
                                {generateOptions(type).map(option => option)}
                              </select>
                            </div>
                          ))}
                          <div style={{ display: 'flex', alignItems: 'center', marginRight: '20px' }}>
                            <label style={{ marginRight: '10px' }}>작업자:</label>
                            <select
                              value={selectedUser}
                              onChange={e => {
                                setSelectedUser(e.target.value);
                                filterData();
                              }}
                              style={{ display: 'block', width: '200px', padding: '5px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '4px' }}
                            >
                              <option value="All">전체</option>
                              {users.map(user => (
                                <option key={user.user_id} value={user.user_id}>
                                  {user.user_name} ({user.user_id})
                                </option>
                              ))}
                            </select>
                          </div>
                          <button onClick={handleReset}>초기화</button>
                        </div>
                      )}
                    </div>
                    <div className="table-responsive">
                      <table
                        id="basic-logtables"
                        className="display table table-striped table-hover"
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
