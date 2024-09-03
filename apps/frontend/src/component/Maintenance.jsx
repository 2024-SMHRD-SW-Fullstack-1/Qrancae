import React, { useEffect, useState } from 'react';
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import 'datatables.net';
import axios from 'axios';
import { ko } from 'date-fns/locale';

// 날짜 포맷팅 함수
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).replace(',', '');
};

// 유지보수 작업자 옵션 생성
const generateUserOptions = (users) => {
  return users.map(user => (
    <option key={user.user_id} value={user.user_id}>
      {user.user_name} ({user.user_id})
    </option>
  ));
};

const Maintenance = () => {
  const [maints, setMaints] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [tableInstance, setTableInstance] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [selectedUser, setSelectedUser] = useState('All');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    filterData();
  }, [dateRange, selectedUser, maints]);

  useEffect(() => {
    if (tableInstance) {
      tableInstance.clear().rows.add(filteredData).draw();
    } else {
      initializeDataTable();
    }
  }, [filteredData]);

  useEffect(() => {
    setUsers(
      [...new Set(maints.map(item => item.user.user_id))]
        .map(userId => maints.find(item => item.user.user_id === userId).user)
        .sort((a, b) => a.user_name.localeCompare(b.user_name))
    );
  }, [maints]);

  function getData() {
    axios.get('http://localhost:8089/qrancae/getmaint')
      .then((res) => {
        setMaints(res.data);
        setFilteredData(res.data); // 초기 데이터 설정
      })
      .catch((err) => {
        console.log('maintData error:', err);
      });
  }

  function initializeDataTable() {
    const table = $('#basic-mainttables').DataTable({
      data: filteredData,
      autoWidth: true,
      columns: [
        { title: '작업자', data: null, render: (data) => `${data.user.user_name} (${data.user.user_id})` },
        { title: '케이블', data: 'cable.cable_idx' },
        { title: '랙 위치', data: 'cable.s_rack_location' },
        { title: '랙 번호', data: 'cable.s_rack_number' },
        {
          title: 'QR 상태',
          data: 'maint_qr',
          render: (data) => {
            const color = data === '불량' ? 'red' : 'green';
            return `<span style="color:${color}">${data}</span>`;
          }
        },
        {
          title: '케이블 상태',
          data: 'maint_cable',
          render: (data) => {
            const color = data === '불량' ? 'red' : 'green';
            return `<span style="color:${color}">${data}</span>`;
          }
        },
        {
          title: '전원 공급 상태',
          data: 'maint_power',
          render: (data) => {
            const color = data === '불량' ? 'red' : 'green';
            return `<span style="color:${color}">${data}</span>`;
          }
        },
        { title: '날짜', data: 'maint_date', render: data => formatDate(data) },
        {
          title: '상태',
          data: null,
          render: (data) => {
            const maintUser = data.maintUser;
            const maintUpdate = data.maint_update;
            const allGood = data.maint_qr === '양호' && data.maint_cable === '양호' && data.maint_power === '양호';

            if (allGood) {
              return '정기 점검 완료';
            } else if (!maintUser && !maintUpdate) {
              return '접수 대기중';
            } else if (maintUser && !maintUpdate) {
              return `진행중 (${maintUser.user_name})`;
            } else if (maintUser && maintUpdate) {
              return `${formatDate(maintUpdate)} (${maintUser.user_name}) 완료`;
            }
          }
        }
      ],
      columnDefs: [
        { targets: 7, width: '15%' }, // 날짜 컬럼 너비 설정
        { targets: 8, width: '18%' } // 상태 컬럼 너비 설정
      ],
      order: [[7, 'desc']], // 날짜 기준으로 내림차순 정렬
      destroy: true
    });

    setTableInstance(table);
  }

  const filterData = () => {
    let filtered = maints;

    if (dateRange[0] && dateRange[1]) {
      const [startDate, endDate] = [new Date(dateRange[0]), new Date(dateRange[1])];
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(item => {
        const maintDate = new Date(item.maint_date);
        return maintDate >= startDate && maintDate <= endDate;
      });
    }

    if (selectedUser !== 'All') filtered = filtered.filter(item => item.user.user_id === selectedUser);

    // 날짜 최신순으로 정렬
    filtered.sort((a, b) => new Date(b.maint_date) - new Date(a.maint_date));
    setFilteredData(filtered);
  };

  const handleReset = () => {
    setDateRange([null, null]);
    setSelectedUser('All');
    setFilteredData(maints);
  };

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
                    <h4 className="card-title">유지보수 내역</h4>
                  </div>
                  <div className="card-body">
                    <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                        <div style={{ marginRight: '20px' }}>
                          <label style={{ marginRight: '10px' }}>조회 일자</label>
                          <DatePicker
                            locale={ko}
                            selected={dateRange[0]}
                            onChange={dates => { setDateRange(dates); }}
                            startDate={dateRange[0]}
                            endDate={dateRange[1]}
                            selectsRange
                            dateFormat="yyyy/MM/dd"
                            placeholderText="날짜 범위를 선택하세요."
                          />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', marginRight: '20px' }}>
                          <label style={{ marginRight: '10px' }}>작업자</label>
                          <select
                            value={selectedUser}
                            onChange={e => {
                              setSelectedUser(e.target.value);
                              filterData();
                            }}
                            style={{ display: 'block', width: '200px', padding: '5px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '4px' }}
                          >
                            <option value="All">전체</option>
                            {generateUserOptions(users)}
                          </select>
                        </div>
                        <button onClick={handleReset} style={{ marginLeft: '10px' }}>초기화</button>
                      </div>
                    </div>
                    <div className="table-responsive">
                      <table
                        id="basic-mainttables"
                        className="display table table-striped table-hover"
                        style={{ width: '100%' }}
                      >
                        <thead>
                          <tr>
                            <th>요청 작업자</th>
                            <th>케이블</th>
                            <th>랙 위치</th>
                            <th>랙 번호</th>
                            <th>QR 상태</th>
                            <th>케이블 상태</th>
                            <th>전원 공급 상태</th>
                            <th>날짜</th>
                            <th>상태</th>
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

export default Maintenance;
