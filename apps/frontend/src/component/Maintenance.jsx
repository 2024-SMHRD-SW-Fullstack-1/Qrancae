import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import 'datatables.net';
import axios from 'axios';

const Maintenance = () => {
  const [maints, setMaints] = useState([]);
  const [users, setUsers] = useState([]); // 작업자 목록 상태
  const [selectedMaints, setSelectedMaints] = useState([]);
  const [tableInstance, setTableInstance] = useState(null);

  // 내역 불러오기
  useEffect(() => {
    getData();
    getUsers();
  }, []);

  // DataTable 초기화 및 갱신
  useEffect(() => {
    if (tableInstance) {
      tableInstance.clear().rows.add(maints).draw();
    } else {
      initializeDataTable();
    }
  }, [maints]);

  // db에서 가져오기
  function getData() {
    axios.get('http://localhost:8089/qrancae/getmaint')
      .then((res) => {
        console.log('maintData:', res.data);
        setMaints(res.data);
      })
      .catch((err) => {
        console.log('maintData error:', err);
      });
  }
  function getUsers() {
    axios.get('http://localhost:8089/qrancae/getusers')
      .then((res) => {
        console.log('m.user가져오기:', res.data)
        setUsers(res.data);
      })
      .catch((err) => {
        console.log('m.user가져오기 오류 error:', err);
      })
  }

  function initializeDataTable() {
    const table = $('#basic-mainttables').DataTable({
      data: maints,
      columns: [
        {
          title: '<input type="checkbox" id="select-all" />',
          orderable: false,
          render: function (_, __, row) {
            return `<input type="checkbox" class="select-checkbox" data-id="${row.maint_idx}" />`;
          }
        },
        {
          title: '요청 작업자',
          data: null,
          render: function (data) {
            return `${data.user.user_name} (${data.user.user_id})`;
          }
        },
        { title: '케이블', data: 'cable.cable_idx' },
        { title: '랙 위치', data: 'cable.s_rack_location' },
        { title: '랙 번호', data: 'cable.s_rack_number' },
        {
          title: 'QR 상태',
          data: 'maint_qr',
          render: function (data) {
            const color = data === '불량' ? 'red' : 'green';
            return `<span style="color:${color}">${data}</span>`;
          }
        },
        {
          title: '케이블 상태',
          data: 'maint_cable',
          render: function (data) {
            const color = data === '불량' ? 'red' : 'green';
            return `<span style="color:${color}">${data}</span>`;
          }
        },
        {
          title: '전원 공급 상태',
          data: 'maint_power',
          render: function (data) {
            const color = data === '불량' ? 'red' : 'green';
            return `<span style="color:${color}">${data}</span>`;
          }
        },
        { title: '요청 날짜', data: 'maint_date' },
        {
          title: '처리 작업자',
          data: null,
          render: function (data) {
            if (data.maintUser) {
              return `${data.maintUser.user_name} (${data.maintUser.user_id})`;
            }
            return '없음';
          }
        },
        {
          title: '처리 날짜',
          data: 'maint_update',
          render: function (data) {
            if (data === null || data === '') {
              return '<button class="btn btn-primary check-btn">확인하기</button>';
            }
            return data;
          }
        }
      ],
      destroy: true // DataTable을 다시 초기화할 수 있도록 설정
    });

    setTableInstance(table);

    // "확인하기" 버튼 클릭
    $(document).on('click', '.check-btn', function () {
      const button = $(this);
      const row = button.closest('tr');
      const rowData = table.row(row).data();

      $('#userSelectModal').data('maint_idx', rowData.maint_idx);
      $('#userSelectModal').modal('show');
    });

    // 개별 체크박스 선택
    $(document).on('change', '.select-checkbox', function () {
      const checkbox = $(this);
      const maint_idx = checkbox.data('id');
      if (checkbox.is(':checked')) {
        setSelectedMaints((prev) => [...prev, maint_idx]);
      } else {
        setSelectedMaints((prev) => prev.filter((id) => id !== maint_idx));
      }
    });

    // 전체 선택 체크박스
    $(document).on('change', '#select-all', function () {
      const isChecked = $(this).is(':checked');
      $('.select-checkbox').prop('checked', isChecked).trigger('change');
    });
  }

  // 유지보수 번호를 서버로 보내 처리 업데이트
  const handleConfirm = (maint_idx, maint_user_id) => {
    axios.post('http://localhost:8089/qrancae/updatemaint', null, {
      params: {
        maintIdx: maint_idx,
        userId: maint_user_id
      }
    })
      .then((res) => {
        console.log(`유지보수 번호 ${maint_idx} 업데이트 성공:`, res);
        alert('확인되었습니다');
        getData(); // 데이터 새로 고침
      })
      .catch((err) => {
        console.log('업데이트 에러:', err);
      });
  };

  // 선택된 모든 유지보수 번호를 서버로 보내기
  const handleBatchConfirm = () => {
    if (selectedMaints.length === 0) {
      alert('선택된 항목이 없습니다.');
      return;
    }
    if (window.confirm('선택된 항목을 모두 확인 하시겠습니까?')) {
      selectedMaints.forEach((maint_idx) => handleConfirm(maint_idx));
    }
  };

  // 작업자 선택 후 요청하기
  const handleUserSelect = () => {
    const selectedUserId = $('#userSelect').val();
    const maint_idx = $('#userSelectModal').data('maint_idx');

    if (!selectedUserId) {
      alert('작업자를 선택하세요.');
      return;
    }

    handleConfirm(maint_idx, selectedUserId);
    $('#userSelectModal').modal('hide');
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
                    <button className="btn btn-success" onClick={handleBatchConfirm}>
                      선택 항목 확인하기
                    </button>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table
                        id="basic-mainttables"
                        className="display table table-striped table-bordered table-hover"
                      >
                        <thead>
                          <tr>
                            <th><input type="checkbox" id="select-all" /></th>
                            <th>요청 작업자</th>
                            <th>케이블</th>
                            <th>랙 위치</th>
                            <th>랙 번호</th>
                            <th>QR 상태</th>
                            <th>케이블 상태</th>
                            <th>전원 공급 상태</th>
                            <th>요청 날짜</th>
                            <th>처리 작업자</th>
                            <th>처리 날짜</th>
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

      {/* 작업자 선택 창 추가 */}
      <div className="modal fade" id="userSelectModal" tabIndex="-1" role="dialog" aria-labelledby="userSelectModalLabel" aria-hidden="true">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="userSelectModalLabel">작업자 선택</h5>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="userSelect">작업자 선택</label>
                <select id="userSelect" className="form-control">
                  <option value="">작업자를 선택하세요</option>
                  {users.map(user => (
                    <option key={user.user_id} value={user.user_id}>
                      {user.user_name} ({user.user_id})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-dismiss="modal">닫기</button>
              <button type="button" className="btn btn-primary" onClick={handleUserSelect}>요청하기</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;