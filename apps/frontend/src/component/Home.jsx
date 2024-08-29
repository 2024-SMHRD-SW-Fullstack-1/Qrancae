import React, { useRef, useEffect, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import koLocale from '@fullcalendar/core/locales/ko';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import AddEventPopup from './popups/AddEventPopup';
import { useNavigate } from 'react-router-dom'; // useNavigate를 가져옴
import Cookies from 'js-cookie';

Chart.register(...registerables);

const Home = () => {
  const lineChartRef = useRef(null);
  const pieChartRef = useRef(null);
  /////////
  const navigate = useNavigate();

  useEffect(() => {
    // 쿠키에서 userId를 가져와 로그인 상태 확인
    const userId = Cookies.get('userId');
    if (!userId) {
      navigate('/login'); // userId 쿠키가 없으면 로그인 페이지로 이동
    }
  }, [navigate]);
  //////////
  const [events, setEvents] = useState([
    {
      id: 1,
      title: '방청소',
      start: '2024-08-27T12:00:00',
      end: '2024-08-30T12:00:00',
      allDay: false,
      content: '아파트 청소',
      color: "#FADADD",
    },
    {
      id: 2,
      title: '이승지(seung)',
      start: '2024-08-16T09:00:00',
      end: '2024-08-22T09:00:00',
      color: "#FADADD",
      content: ''
    }
  ]);

  const [selectedDate, setSelectedDate] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
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

  const handleOpenPopup = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedDate(null);
  };

  const handleSaveEvent = (newEvent) => {
    setEvents([
      ...events,
      {
        id: events.length + 1,
        ...newEvent,
        color: "#FFCE56"
      }
    ]);
    handleClosePopup();
  };

  // 클릭된 날짜가 일정의 범위 내에 있는지 확인
  const filteredEvents = events.filter(event => {
    const startDate = new Date(event.start);
    const endDate = new Date(event.end);
    const selectedDateObj = new Date(selectedDate);

    return selectedDateObj >= startDate && selectedDateObj <= endDate;
  });

  return (
    <div className="wrapper">
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
                      events={events}
                      locale={koLocale}
                      headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek'
                      }}
                      dateClick={handleDateClick}  // 날짜 클릭 핸들러
                    />
                    <div className="text-center my-3">
                      {filteredEvents.length > 0 && (
                        <div className="filtered-events">
                          {filteredEvents.map(event => (
                            <div key={event.id} className="event-details">
                              <p><strong>{event.title}</strong></p>
                              <p>시작: {new Date(event.start).toLocaleString()}</p>
                              <p>종료: {new Date(event.end).toLocaleString()}</p>
                              <p>내용: {event.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* 팝업 표시 조건 추가 */}
                    {showPopup && (
                      <AddEventPopup
                        isOpen={showPopup}
                        onClose={handleClosePopup}
                        onSave={handleSaveEvent}
                        defaultStartDate={selectedDate}
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="col-md-7 d-flex flex-column">
                <div className="row">
                  <div className="card card-round">
                    <div className="card-header">
                      <div className="card-head-row">
                        <div className="card-title">라인 차트</div>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="chart-container">
                        <canvas ref={lineChartRef}></canvas>
                      </div>
                    </div>
                  </div>
                  <div className="card card-round">
                    <div className="card-header">
                      <div className="card-head-row">
                        <div className="card-title">파이 차트</div>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="chart-container">
                        <canvas ref={pieChartRef}></canvas>
                      </div>
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

export default Home;
