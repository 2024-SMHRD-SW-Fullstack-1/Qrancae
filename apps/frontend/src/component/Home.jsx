import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactToPrint from "react-to-print";
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

  // 프린트 참조
  const printRef = useRef(null);

  const handleReportDownload = () => {
    axios({
      url: 'http://localhost:8089/qrancae/reportMain',
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

      const filename = `report_${getFormattedDate()}.xlsx`;

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

  const getCalendarList = () => {
    axios({
      url: 'http://localhost:8089/qrancae/calendar',
      method: 'post',
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

  useEffect(() => {
    getCalendarList();
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
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="fw-bold mb-3">메인</h3>
              <div className="common-labels">
                <ReactToPrint
                  trigger={() => (
                    <label className="btn btn-label-primary btn-round btn-sm">
                      <span className="btn-label">
                        <i className="fas fa-chart-pie icon-spacing"></i>
                      </span>
                      차트 다운로드
                    </label>
                  )}
                  content={() => printRef.current}
                  pageStyle={`@media print {
                    #print-content {
                      zoom: 0.8;
                    }
                  }`}
                />
                <label
                  className="btn btn-label-primary btn-round btn-sm"
                  onClick={handleReportDownload}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px'
                  }}>
                  <span className="btn-label">
                    <i className="fas fa-file-excel icon-spacing"></i>
                  </span>
                  보고서 다운로드
                </label>
              </div>
            </div>
            <div className="row" style={{ display: 'flex', flexWrap: 'nowrap' }}>
              <div className="col-md-5" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="card card-round" style={{ flex: 1 }}>
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <div className="card-title">일정</div>
                    <label className="btn btn-label-primary btn-round btn-sm" onClick={handleOpenPopup}>
                      <span className="btn-label">
                        <i className="far fa-calendar-plus icon-spacing"></i>
                      </span>
                      일정 추가
                    </label>
                  </div>
                  <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
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
                        right: 'prev today next',
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
                    <div className="my-3" style={{ flex: 1, overflowY: 'auto' }}>
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
              <div className="col-md-7" style={{ display: 'flex', flexDirection: 'column' }}>
                <div id="print-content" ref={printRef} style={{ flex: 1 }}>
                  <div className="card card-round" style={{ flex: 1 }}>
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
                    <div className="card-body" style={{ flex: 1 }}>
                      <LineChart year={selectedYear} />
                    </div>
                  </div>
                  <div className="card card-round" style={{ flex: 1 }}>
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
                    <div className="card-body flex-card-body" style={{ flex: 1 }}>
                      <PieChart year={selectedDefectYear} month={selectedDefectMonth} range={selectedDefectRange} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div >
  );
};

export default Home;
