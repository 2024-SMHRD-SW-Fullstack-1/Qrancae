import React, { useRef, useEffect, useState } from 'react';
import { Chart, registerables } from 'chart.js';
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
import { useNavigate } from 'react-router-dom'; // useNavigate를 가져옴
import Cookies from 'js-cookie';

Chart.register(...registerables);

const Home = () => {
  const lineChartRef = useRef(null);
  const pieChartRef = useRef(null);
  const navigate = useNavigate();
  const userId = Cookies.get('userId');

  useEffect(() => {
    // 쿠키에서 userId를 가져와 로그인 상태 확인
    if (!userId) {
      navigate('/login'); // userId 쿠키가 없으면 로그인 페이지로 이동
    }
  }, [navigate]);

  const [events, setEvents] = useState([]);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showPopup, setShowPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);

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

  useEffect(() => {

    getCalendarList();

    if (lineChartRef.current) {
      new Chart(lineChartRef.current, {
        type: 'line',
        data: {
          labels: [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
          ],
          datasets: [{
            label: 'Active Users',
            borderColor: '#1d7af3',
            pointBorderColor: '#FFF',
            pointBackgroundColor: '#1d7af3',
            pointBorderWidth: 2,
            pointHoverRadius: 4,
            pointHoverBorderWidth: 1,
            pointRadius: 4,
            backgroundColor: 'transparent',
            fill: true,
            borderWidth: 2,
            data: [542, 480, 430, 550, 530, 453, 380, 434, 568, 610, 700, 900],
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          legend: {
            position: 'bottom',
            labels: {
              padding: 10,
              fontColor: '#1d7af3',
            },
          },
          tooltips: {
            bodySpacing: 4,
            mode: 'nearest',
            intersect: 0,
            position: 'nearest',
            xPadding: 10,
            yPadding: 10,
            caretPadding: 10,
          },
          layout: {
            padding: { left: 15, right: 15, top: 15, bottom: 15 },
          },
        },
      });
    }

    if (pieChartRef.current) {
      new Chart(pieChartRef.current, {
        type: 'pie',
        data: {
          labels: ['Red', 'Blue', 'Yellow'],
          datasets: [{
            label: 'Pie Chart',
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
            data: [300, 50, 100],
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              callbacks: {
                label: function (tooltipItem) {
                  return tooltipItem.label + ': ' + tooltipItem.raw;
                }
              }
            }
          },
        },
      });
    }
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
      calendar_start: new Date(newEvent.start).toISOString(),
      calendar_end: new Date(newEvent.end).toISOString(),
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
    console.log(updatedEvent);

    const eventData = {
      user_id: userId,
      calendar_idx: updatedEvent.id,
      calendar_title: updatedEvent.title,
      calendar_start: new Date(updatedEvent.start).toISOString(),
      calendar_end: new Date(updatedEvent.end).toISOString(),
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
                  <label className="btn btn-primary btn-border btn-round btn-sm">
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
                      events={events}
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
                            <h5>신규 접수</h5>
                            <p className="repair-num">4</p>
                          </div>
                        </div>
                        <div className='today-repair'>
                          <div className="col-3">
                            <i className="fas fa-wrench repair-i"></i>
                          </div>
                          <div className="col-9 col-stats text-center">
                            <h5>진행 중</h5>
                            <p className="repair-num">6</p>
                          </div>
                        </div>
                        <div className='today-repair'>
                          <div className="col-3">
                            <i className="far fa-check-circle repair-i"></i>
                          </div>
                          <div className="col-9 col-stats text-center">
                            <h5>보수 완료</h5>
                            <p className="repair-num">2</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='col-md-8 flex-grow-1'>
                    <div className="card card-round">
                      <div className="card-header">
                        <div className="card-head-row">
                          <div className="card-title">로그 내역</div>
                        </div>
                      </div>
                      <div className="card-body">
                        <div className="chart-container">
                          <canvas ref={lineChartRef}></canvas>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card card-round mt-3">
                  <div className="card-header">
                    <div className="card-head-row">
                      <div className="card-title">케이블 불량률</div>
                    </div>
                  </div>
                  <div className="card-body flex-card-body">
                    <div className="chart-container defect-rate-chart">
                      <canvas ref={pieChartRef}></canvas>
                    </div>
                    <table className="table table-striped table-bordered mt-3 defect-rate-table">
                      <thead>
                        <tr>
                          <th scope="col">높음</th>
                          <th scope="col">랙 위치</th>
                          <th scope="col">불량률</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>1</td>
                          <td>R33</td>
                          <td>2.3%</td>
                        </tr>
                        <tr>
                          <td>2</td>
                          <td>R07</td>
                          <td>1.9%</td>
                        </tr>
                        <tr>
                          <td>3</td>
                          <td>R19</td>
                          <td>1.3%</td>
                        </tr>
                        <tr>
                          <td>4</td>
                          <td>R19</td>
                          <td>1.3%</td>
                        </tr>
                      </tbody>
                    </table>
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
