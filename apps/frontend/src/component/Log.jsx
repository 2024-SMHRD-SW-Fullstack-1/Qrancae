import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
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
  let formattedDate = date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const yearTwoDigit = formattedDate.slice(0, 4).slice(-2);
  formattedDate = formattedDate.replace(/^\d{4}/, yearTwoDigit);

  return formattedDate.replace(',', '');
};

const Log = () => {
  const [logdata, setLogdata] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [tableInstance, setTableInstance] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('All');
  const [loading, setLoading] = useState(false); // 로딩중인지 확인

  useEffect(() => {
    setLoading(true);
    // 오늘 날짜로 초기 날짜 범위 설정
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));  // 오늘 0시
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));  // 오늘 23시 59분
    setDateRange([startOfDay, endOfDay]);
    getData();
  }, []);

  useEffect(() => {
    const uniqueUsers = [...new Set(logdata.map((item) => item.user.user_id))]
      .map(
        (userId) => logdata.find((item) => item.user.user_id === userId).user
      )
      .sort((a, b) => a.user_name.localeCompare(b.user_name)); // 가나다 순으로 정렬
    setUsers(uniqueUsers);
  }, [logdata]);

  useEffect(() => {
    filterData();
  }, [dateRange, selectedUser, logdata]);

  useEffect(() => {
    if (tableInstance) {
      tableInstance.clear().rows.add(filteredData).draw();
    } else {
      initializeDataTable();
    }
  }, [filteredData]);

  const getData = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/getlog`
      );
      setLogdata(response.data);
      setFilteredData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('로그 데이터 오류:', error);
    }
  };

  const filterData = () => {
    let filtered = logdata;

    if (dateRange[0] && dateRange[1]) {
      const [startDate, endDate] = [
        new Date(dateRange[0]),
        new Date(dateRange[1]),
      ];
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((item) => {
        const logDate = new Date(item.log_date);
        return logDate >= startDate && logDate <= endDate;
      });
    }

    if (selectedUser !== 'All')
      filtered = filtered.filter((item) => item.user.user_id === selectedUser);

    filtered.sort((a, b) => new Date(b.log_date) - new Date(a.log_date));
    setFilteredData(filtered);
  };

  const handleReset = () => {
    setDateRange([null, null]);
    setSelectedUser('All');
    setFilteredData(logdata);
  };

  const initializeDataTable = () => {
    $('#basic-logtables').empty();
    $('#basic-logtables').html(`
      <thead>
        <tr>
          <th rowSpan="2">번호</th>
          <th rowSpan="2">log_idx</th>
          <th rowSpan="2">작업자</th>
          <th rowSpan="2">케이블</th>
          <th colSpan="2">
            <i class="fas fa-sign-out-alt" style="color: red; margin-right: .5rem;"></i> 출발점 (Start)
          </th>
          <th colSpan="2">
            <i class="fas fa-sign-in-alt" style="color: #1572e8; margin-right: .5rem;"></i> 도착점 (End)
          </th>
          <th rowSpan="2">날짜 및 시간</th>
        </tr>
        <tr>
          <th>랙 번호</th>
          <th>랙 위치</th>
          <th>랙 번호</th>
          <th>랙 위치</th>
        </tr>
      </thead>
      <tbody></tbody>
    `);
    const table = $('#basic-logtables').DataTable({
      data: filteredData,
      autoWidth: true,
      columns: [
        {
          title: '번호',
          data: null,
          render: (_, __, row, meta) => meta.row + 1,
        },
        { title: 'log_idx', data: 'log_idx', visible: false },
        {
          title: '작업자',
          data: null,
          render: (data) => `${data.user.user_name}(${data.user.user_id})`,
        },
        { title: '케이블', data: 'cable.cable_idx' },
        { title: '랙 번호', data: 'cable.s_rack_number' },
        { title: '랙 위치', data: 'cable.s_rack_location' },
        { title: '랙 번호', data: 'cable.d_rack_number' },
        { title: '랙 위치', data: 'cable.d_rack_location' },
        {
          title: '날짜 및 시간',
          data: 'log_date',
          render: (data) => formatDate(data),
        },
      ],
    });

    setTableInstance(table);
  };

  const handleReportDownload = () => {
    axios({
      url: `${process.env.REACT_APP_API_URL}/api/reportLog`,
      method: 'get',
      responseType: 'blob',
    })
      .then((res) => {
        const getFormattedDate = () => {
          const now = new Date();
          const year = now.getFullYear().toString().slice(-2);
          const month = (now.getMonth() + 1).toString().padStart(2, '0');
          const day = now.getDate().toString().padStart(2, '0');

          return `${year}${month}${day}`;
        };

        const filename = `log_${getFormattedDate()}.xlsx`;

        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((err) => {
        console.log(err);
      });
  };

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
        {loading && (
          <div className="overlay">
            <img
              src="assets/img/spinner.svg"
              alt="Loading..."
              className="spinner"
            />
          </div>
        )}

        <div className="container">
          <div className="page-inner">
            <div className="row">
              <div className="col-md-12">
                <div className="card">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h4 className="card-title">로그 내역</h4>
                    <div
                      className="common-labels"
                      style={{ display: 'flex', alignItems: 'center' }}
                    >
                      <div
                        style={{ display: 'inline-block', marginRight: '20px' }}
                      >
                        <label style={{ marginRight: '5px' }}>조회 일자</label>
                        <DatePicker
                          locale={ko}
                          selected={dateRange[0]}
                          onChange={(dates) => {
                            setDateRange(dates);
                          }}
                          startDate={dateRange[0]}
                          endDate={dateRange[1]}
                          selectsRange
                          dateFormat="yyyy/MM/dd"
                          placeholderText="날짜 범위를 선택하세요."
                          className="date-picker"
                        />
                      </div>
                      <div style={{ display: 'inline-block' }}>
                        <label style={{ marginRight: '5px' }}>작업자</label>
                        <select
                          value={selectedUser}
                          onChange={(e) => {
                            setSelectedUser(e.target.value);
                            filterData();
                          }}
                          style={{
                            display: 'inline-block',
                            width: '200px',
                            padding: '5px',
                            fontSize: '14px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                          }}
                        >
                          <option value="All">전체</option>
                          {users.map((user) => (
                            <option key={user.user_id} value={user.user_id}>
                              {user.user_name} ({user.user_id})
                            </option>
                          ))}
                        </select>
                        <label
                          className="btn btn-label-primary btn-round btn-sm"
                          onClick={handleReset}
                          style={{ marginLeft: '10px' }}
                        >
                          선택 초기화
                        </label>
                      </div>
                      <label
                        className="btn btn-label-primary btn-round btn-sm"
                        onClick={handleReportDownload}
                      >
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
                            <th rowSpan="2">번호</th>
                            <th rowSpan="2">log_idx</th>
                            <th rowSpan="2">작업자</th>
                            <th rowSpan="2">케이블</th>
                            <th colSpan="2">
                              <i
                                className="fas fa-sign-out-alt"
                                style={{ color: 'red', marginRight: '.5rem' }}
                              ></i>{' '}
                              출발점 (Start)
                            </th>
                            <th colSpan="2">
                              <i
                                className="fas fa-sign-in-alt"
                                style={{
                                  color: '#1572e8',
                                  marginRight: '.5rem',
                                }}
                              ></i>{' '}
                              도착점 (End)
                            </th>
                            <th rowSpan="2">날짜 및 시간</th>
                          </tr>
                          <tr>
                            <th>랙 번호</th>
                            <th>랙 위치</th>
                            <th>랙 번호</th>
                            <th>랙 위치</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredData.map((item, index) => (
                            <tr key={item.log_idx || index}>
                              <td>{index + 1}</td>
                              <td>{item.log_idx}</td>
                              <td>
                                {item.user.user_name} ({item.user.user_id})
                              </td>
                              <td>{item.cable.cable_idx}</td>
                              <td>{item.cable.s_rack_number}</td>
                              <td>{item.cable.s_rack_location}</td>
                              <td>{item.cable.d_rack_number}</td>
                              <td>{item.cable.d_rack_location}</td>
                              <td>{formatDate(item.log_date)}</td>
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
      </div>
    </div>
  );
};

export default Log;
