import React, { useEffect, useState } from 'react';
import axios from 'axios';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import koLocale from '@fullcalendar/core/locales/ko';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import AddEventPopup from './popups/AddEventPopup';
import EditEventPopup from './popups/EditEventPopup';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import LineChart from './charts/LineChart';
import PieChart from './charts/PieChart';

const Home = () => {
  // 로그인 확인
  const navigate = useNavigate();
  const userId = Cookies.get('userId');

  useEffect(() => {
    // 쿠키에서 userId를 가져와 로그인 상태 확인
    if (!userId) {
      navigate('/login'); // userId 쿠키가 없으면 로그인 페이지로 이동
    }
  }, [navigate]);

  // 일정 관리
  const [events, setEvents] = useState([]);
  const [repairCnt, setRepairCnt] = useState([]);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showPopup, setShowPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);

  // 라인 차트
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // 파이 차트
  const [selectedDefectYear, setSelectedDefectYear] = useState(new Date().getFullYear());
  const [selectedDefectMonth, setSelectedDefectMonth] = useState(new Date().getMonth() + 1);
  const [selectedDefectRange, setSelectedDefectRange] = useState('max');

  const handleReportDownload = () => {
    axios({
      url: 'http://localhost:8089/qrancae/reportMain',
      method: 'get',
      responseType: 'blob',
    }).then((res) => {
      // Blob을 사용하여 파일 다운로드 처리
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'report.xlsx'); // 파일 이름 지정
      document.body.appendChild(link);
      link.click();

      // 클릭 후 링크 제거
      document.body.removeChild(link);
    });
  }

  const getCalendarList = () => {
    axios({
      url: 'http://localhost:8089/qrancae/calendar',
      method: 'post',
      data: userId
    }).then((res) => {
      console.log('캘린더 리스트', res.data);
      const data = res.data;

      const formattedData = data.map(event => ({
        id: event.calendar_idx,
        title: event.calendar_title,
        content: event.calendar_content,
        start: event.calendar_start,
        end: event.calendar_end,
        color: event.calendar_color,
        allDay: event.calendar_allday === 'O',
      }))
      console.log('formattedData', formattedData);
      setEvents(formattedData);
    });
  };

  const getTodayRepair = () => {
    axios({
      url: 'http://localhost:8089/qrancae/todayRepair',
      method: 'get',
    }).then((res) => {
      console.log('오늘의 점검', res.data);
      setRepairCnt(res.data);
    });
  }

  useEffect(() => {

    getCalendarList();
    getTodayRepair();

  }, []);

  const handleDateClick = (arg) => {
    setSelectedDate(arg.dateStr);
  };

  const handleEventClick = (info) => {
    console.log(info.event)

    axios({
      url: `http://localhost:8089/qrancae/findCalendar/${info.event.id}`,
      method: 'get',
    }).then((res) => {
      console.log('캘린더 리스트', res.data);
      setCurrentEvent({
        id: res.data.calendar_idx,
        title: res.data.calendar_title,
        start: res.data.calendar_start,
        end: res.data.calendar_end,
        content: res.data.calendar_content,
        color: res.data.calendar_color,
        allDay: res.data.calendar_allday,
      });
      setShowEditPopup(true); // 일정 수정 팝업 열기
    });

  };

  const handleOpenPopup = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const handleCloseEditPopup = () => {
    setShowEditPopup(false);
  };

  const handleSaveEvent = (newEvent) => {
    console.log(newEvent);

    const eventData = {
      user_id: userId,
      calendar_title: newEvent.title,
      calendar_start: newEvent.start,
      calendar_end: newEvent.end,
      calendar_content: newEvent.content,
      calendar_color: newEvent.color,
      calendar_allday: newEvent.allDay ? 'O' : 'X'
    };

    axios({
      url: 'http://localhost:8089/qrancae/addCalendar',
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      data: eventData,
    }).then((res) => {
      console.log(res);
      getCalendarList();
    });

    handleClosePopup();
  };

  // 클릭된 날짜가 일정의 범위 내에 있는지 확인
  const filteredEvents = events.filter(event => {
    const startDate = new Date(event.start).setHours(0, 0, 0, 0);
    const endDate = new Date(event.end).setHours(0, 0, 0, 0);
    const selectedDateObj = new Date(selectedDate).setHours(0, 0, 0, 0);

    return selectedDateObj >= startDate && selectedDateObj <= endDate;
  });

  const handleUpdateEvent = (updatedEvent) => {
    console.log('수정할 캘린더', updatedEvent);

    const eventData = {
      user_id: userId,
      calendar_idx: updatedEvent.id,
      calendar_title: updatedEvent.title,
      calendar_start: updatedEvent.start,
      calendar_end: updatedEvent.end,
      calendar_content: updatedEvent.content,
      calendar_color: updatedEvent.color,
      calendar_allday: updatedEvent.allDay ? 'O' : 'X'
    };

    axios({
      url: 'http://localhost:8089/qrancae/updateCalendar',
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      data: eventData,
    }).then((res) => {
      console.log(res);
      getCalendarList();
    });

    handleClosePopup();
  };

  const handleDeleteEvent = () => {
    getCalendarList();
    handleClosePopup();
  };

  // 라인 차트 - 연도 선택
  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  }

  /* 파이 차트 */
  // - 연도 선택
  const handleDefectYearChange = (event) => {
    setSelectedDefectYear(event.target.value);
  }
  // - 달 선택
  const handleDefectMonthChange = (event) => {
    setSelectedDefectMonth(event.target.value);
  }

  // - 최고 최저 선택
  const handleDefectRangeChange = (event) => {
    setSelectedDefectRange(event.target.value);
  }

  return (
    <div className="wrapper">
      <style>
        {`
          table thead th, table tbody td {
            text-align: center;
          }
          .flex-container {
            display: flex;
            gap: 20px;
          }
          .chart-container {
            flex: 1;
            min-width: 0;
          }
          .card-round {
            border-radius: 0.5rem;
          }
        `}
      </style>
      <Sidebar />

      <div className="main-panel">
        <Header />

        <div className="container">
          <div className="page-inner">
            <div className="row h-100">
              <div className="col-md-12">
                <div className="common-labels outside-card-labels">
                  <label className="btn btn-primary btn-border btn-round btn-sm">
                    <span className="btn-label">
                      <i className="fas fa-print icon-spacing"></i>
                    </span>
                    출력
                  </label>
                  <label className="btn btn-primary btn-border btn-round btn-sm" onClick={handleReportDownload}>
                    <span className="btn-label">
                      <i className="fas fa-print icon-spacing"></i>
                    </span>
                    다운로드
                  </label>
                </div>
              </div>

              <div className="col-md-5 d-flex flex-column">
                <div className="card card-round flex-grow-1">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <div className="card-title">일정</div>
                    <label className="btn btn-primary btn-border btn-round btn-sm" onClick={handleOpenPopup}>
                      <span className="btn-label">
                        <i className="far fa-calendar-plus icon-spacing"></i>
                      </span>
                      일정 추가
                    </label>
                  </div>
                  <div className="card-body">
                    <FullCalendar
                      plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
                      initialView="dayGridMonth"
                      contentHeight="auto"
                      events={events.map(event => ({
                        ...event,
                        end: event.allDay ? new Date(new Date(event.end).setDate(new Date(event.end).getDate() + 1)) : event.end
                      }))}
                      locale={koLocale}
                      headerToolbar={{
                        left: 'title',
                        right: 'prev today next'
                      }}
                      dateClick={handleDateClick}
                      eventClick={handleEventClick}
                      dayCellContent={(args) => {
                        return (
                          <div>
                            {args.date.getDate()}
                          </div>
                        );
                      }}
                    />
                    <div className="my-3">
                      {filteredEvents.length > 0 ? (
                        <div className="event-list filtered-events">
                          <p>{selectedDate}</p>
                          {filteredEvents.map(event => (
                            <div key={event.id} className="event-details" style={{ display: 'flex', alignItems: 'stretch' }}>
                              <div style={{
                                width: '.5rem',
                                backgroundColor: event.color,
                                marginRight: '1rem'
                              }} />
                              <div className='event-title-content-date'>
                                <p className="event-title"><strong>{event.title}</strong></p>
                                {event.content && <p className="event-content">{event.content}</p>}
                                <p className="event-date">
                                  {event.allDay
                                    ? `${new Date(event.start).toLocaleDateString()} - ${new Date(new Date(event.end).setHours(23, 59)).toLocaleDateString()}`
                                    : `${new Date(event.start).toLocaleDateString()} ${new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(event.end).toLocaleDateString()} ${new Date(event.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                  }
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="event-list filtered-events">
                          <p>{selectedDate}</p>
                          <p className='event-title text-center'>일정 없음</p>
                        </div>
                      )}
                    </div>
                    {showPopup && (
                      <AddEventPopup
                        isOpen={showPopup}
                        onClose={handleClosePopup}
                        onSave={handleSaveEvent}
                        defaultStartDate={selectedDate}
                      />
                    )}
                    {currentEvent && (
                      <EditEventPopup
                        isOpen={showEditPopup}
                        onClose={handleCloseEditPopup}
                        onSave={handleUpdateEvent}
                        onDelete={handleDeleteEvent}
                        event={currentEvent}
                        getCalendarList={getCalendarList}
                      />
                    )}
                  </div>
                </div>
              </div>
              <div className="col-md-7">
                <div className="flex-container">
                  <div className='col-md-4 flex-grow-1'>
                    <div className="card card-round">
                      <div className="card-header">
                        <div className="card-head-row">
                          <div className="card-title">오늘의 점검</div>
                        </div>
                      </div>
                      <div className="card-body text-center">
                        <div className='today-repair text-center'>
                          <div className="col-3">
                            <i className="fas fa-server repair-i"></i>
                          </div>
                          <div className="col-9 col-stats text-center">
                            <h5 style={{ margin: '0' }}>신규 접수</h5>
                            <p className="repair-num">{repairCnt.cntNewRepair}</p>
                          </div>
                        </div>
                        <div className='today-repair'>
                          <div className="col-3">
                            <i className="fas fa-wrench repair-i"></i>
                          </div>
                          <div className="col-9 col-stats text-center">
                            <h5 style={{ margin: '0' }}>진행 중</h5>
                            <p className="repair-num">{repairCnt.cntInProgressRepair}</p>
                          </div>
                        </div>
                        <div className='today-repair'>
                          <div className="col-3">
                            <i className="far fa-check-circle repair-i"></i>
                          </div>
                          <div className="col-9 col-stats text-center">
                            <h5 style={{ margin: '0' }}>보수 완료</h5>
                            <p className="repair-num">{repairCnt.cntCompleteRepair}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='col-md-8 flex-grow-1'>
                    <div className="card card-round">
                      <div className="card-header">
                        <div className="card-title">로그 내역</div>
                        <select
                          className="form-select input-fixed"
                          id="notify_state"
                          value={selectedYear}
                          onChange={handleYearChange}
                        >
                          <option value="2024">2024</option>
                          <option value="2023">2023</option>
                        </select>
                      </div>
                      <div className="card-body">
                        <LineChart year={selectedYear} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card card-round mt-3">
                  <div className="card-header">
                    <div className="card-title">케이블 불량률</div>
                    <div className="select-container">
                      <select
                        className="form-select input-fixed"
                        id="notify_state"
                        value={selectedDefectYear}
                        onChange={handleDefectYearChange}
                      >
                        <option value="2024">2024</option>
                        <option value="2023">2023</option>
                      </select>
                      <select
                        className="form-select input-fixed"
                        id="notify_state"
                        value={selectedDefectMonth}
                        onChange={handleDefectMonthChange}
                      >
                        <option value="1">1월</option>
                        <option value="2">2월</option>
                        <option value="3">3월</option>
                        <option value="4">4월</option>
                        <option value="5">5월</option>
                        <option value="6">6월</option>
                        <option value="7">7월</option>
                        <option value="8">8월</option>
                        <option value="9">9월</option>
                        <option value="10">10월</option>
                        <option value="11">11월</option>
                        <option value="12">12월</option>
                      </select>
                      <select
                        className="form-select input-fixed"
                        id="notify_state"
                        value={selectedDefectRange}
                        onChange={handleDefectRangeChange}
                      >
                        <option value="max">최고</option>
                        <option value="min">최저</option>
                      </select>
                    </div>
                  </div>
                  <div className="card-body flex-card-body">
                    <PieChart year={selectedDefectYear} month={selectedDefectMonth} range={selectedDefectRange} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <table>
          <tbody>
            <tr>
              <td>작업자명</td>
              <td>총 점검</td>
              <td>상세</td>
              <td>점검 완료</td>
            </tr>
            <tr>
              <td rowSpan={3}>작업자 이름</td>
              <td rowSpan={3}>총 점검 개수</td>
              <td>QR 불량</td>
              <td>3</td>
            </tr>
            <tr>
              <td>케이블 불량</td>
              <td>5</td>
            </tr>
            <tr>
              <td>전력공급 불량</td>
              <td>2</td>
            </tr>
          </tbody>
        </table>

        <Footer />
      </div>
    </div >
  );
};

export default Home;
