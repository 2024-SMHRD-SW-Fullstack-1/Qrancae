import React, { useRef, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

Chart.register(...registerables);

const Home = () => {
  const barChartRef = useRef(null);

  useEffect(() => {
    // Bar Chart
    if (barChartRef.current) {
      new Chart(barChartRef.current, {
        type: 'bar',
        data: {
          labels: [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
          ],
          datasets: [
            {
              backgroundColor: 'rgb(23, 125, 255)',
              borderColor: 'rgb(23, 125, 255)',
              data: [3, 2, 9, 5, 4, 6, 4, 6, 7, 8, 7, 4],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    }
  }, []);

  return (
    <div className="App">
      <div className="wrapper">
        <Sidebar />

        <div className="main-panel">
          <Header />

          <div className="container">
            <div className="page-inner">
              <div className="page-header">
                <h3 className="fw-bold mb-3">메인</h3>
              </div>
              {/* <div className="row">
                <div className="col-sm-6 col-md-3">
                  <div className="card card-stats card-round">
                    <div className="card-body">
                      <div className="row align-items-center">
                        <div className="col-icon">
                          <div className="icon-big text-center icon-primary bubble-shadow-small">
                            <i className="fas fa-users"></i>
                          </div>
                        </div>
                        <div className="col col-stats ms-3 ms-sm-0">
                          <div className="numbers">
                            <p className="card-category">Visitors</p>
                            <h4 className="card-title">1,294</h4>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-md-3">
                  <div className="card card-stats card-round">
                    <div className="card-body">
                      <div className="row align-items-center">
                        <div className="col-icon">
                          <div className="icon-big text-center icon-info bubble-shadow-small">
                            <i className="fas fa-user-check"></i>
                          </div>
                        </div>
                        <div className="col col-stats ms-3 ms-sm-0">
                          <div className="numbers">
                            <p className="card-category">Subscribers</p>
                            <h4 className="card-title">1303</h4>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-md-3">
                  <div className="card card-stats card-round">
                    <div className="card-body">
                      <div className="row align-items-center">
                        <div className="col-icon">
                          <div className="icon-big text-center icon-success bubble-shadow-small">
                            <i className="fas fa-luggage-cart"></i>
                          </div>
                        </div>
                        <div className="col col-stats ms-3 ms-sm-0">
                          <div className="numbers">
                            <p className="card-category">Sales</p>
                            <h4 className="card-title">$ 1,345</h4>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-md-3">
                  <div className="card card-stats card-round">
                    <div className="card-body">
                      <div className="row align-items-center">
                        <div className="col-icon">
                          <div className="icon-big text-center icon-secondary bubble-shadow-small">
                            <i className="far fa-check-circle"></i>
                          </div>
                        </div>
                        <div className="col col-stats ms-3 ms-sm-0">
                          <div className="numbers">
                            <p className="card-category">Order</p>
                            <h4 className="card-title">576</h4>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div> */}
              <div className="row">
                <div className="col-md-8">
                  <div className="card card-round">
                    <div className="card-header">
                      <div className="card-head-row">
                        <div className="card-title">QR 코드 확인 횟수</div>
                        <div className="card-tools">
                          <select
                            className="form-select input-fixed"
                            id="notify_state"
                          >
                            <option value="2024">2024</option>
                            <option value="2023">2023</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="chart-container">
                        <canvas ref={barChartRef}></canvas>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card card-primary card-round">
                    <div className="card-header">
                      <div className="card-head-row">
                        <div className="card-title">Daily Sales</div>
                        <div className="card-tools">
                          <div className="dropdown">
                            <button
                              className="btn btn-sm btn-label-light dropdown-toggle"
                              type="button"
                              id="dropdownMenuButton"
                              data-bs-toggle="dropdown"
                              aria-haspopup="true"
                              aria-expanded="false"
                            >
                              Export
                            </button>
                            <div
                              className="dropdown-menu"
                              aria-labelledby="dropdownMenuButton"
                            >
                              <a className="dropdown-item" href="#">
                                Action
                              </a>
                              <a className="dropdown-item" href="#">
                                Another action
                              </a>
                              <a className="dropdown-item" href="#">
                                Something else here
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="card-category">March 25 - April 02</div>
                    </div>
                    <div className="card-body pb-0">
                      <div className="mb-4 mt-2">
                        <h1>$4,578.58</h1>
                      </div>
                      <div className="pull-in">
                        <canvas id="dailySalesChart"></canvas>
                      </div>
                    </div>
                  </div>
                  <div className="card card-round">
                    <div className="card-body pb-0">
                      <div className="h1 fw-bold float-end text-primary">
                        +5%
                      </div>
                      <h2 className="mb-2">17</h2>
                      <p className="text-muted">Users online</p>
                      <div className="pull-in sparkline-fix">
                        <div id="lineChart"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-4">
                  <div className="card card-round">
                    <div className="card-body">
                      <div className="card-head-row card-tools-still-right">
                        <div className="card-title">New Customers</div>
                        <div className="card-tools">
                          <div className="dropdown">
                            <button
                              className="btn btn-icon btn-clean me-0"
                              type="button"
                              id="dropdownMenuButton"
                              data-bs-toggle="dropdown"
                              aria-haspopup="true"
                              aria-expanded="false"
                            >
                              <i className="fas fa-ellipsis-h"></i>
                            </button>
                            <div
                              className="dropdown-menu"
                              aria-labelledby="dropdownMenuButton"
                            >
                              <a className="dropdown-item" href="#">
                                Action
                              </a>
                              <a className="dropdown-item" href="#">
                                Another action
                              </a>
                              <a className="dropdown-item" href="#">
                                Something else here
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="card-list py-4">
                        <div className="item-list">
                          <div className="avatar">
                            <img
                              alt="image"
                              src="/assets/img/profile2.jpg"
                              className="avatar-img rounded-circle"
                            />
                          </div>
                          <div className="info-user">
                            <span className="username">Vanessa Smith</span>
                            <span className="status">2 new messages</span>
                          </div>
                        </div>
                        <div className="item-list">
                          <div className="avatar">
                            <img
                              alt="image"
                              src="/assets/img/profile3.jpg"
                              className="avatar-img rounded-circle"
                            />
                          </div>
                          <div className="info-user">
                            <span className="username">Derek Schuler</span>
                            <span className="status">5 new messages</span>
                          </div>
                        </div>
                        <div className="item-list">
                          <div className="avatar">
                            <img
                              alt="image"
                              src="/assets/img/profile4.jpg"
                              className="avatar-img rounded-circle"
                            />
                          </div>
                          <div className="info-user">
                            <span className="username">Catherine Moore</span>
                            <span className="status">7 new messages</span>
                          </div>
                        </div>
                      </div>
                      <div className="card-footer text-center">
                        <a href="#" className="btn btn-primary btn-round">
                          View All
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-8">
                  <div className="card card-round">
                    <div className="card-header">
                      <div className="card-title">Visitors</div>
                    </div>
                    <div className="card-body">
                      <div className="chart-container">
                        <canvas id="visitorChart"></canvas>
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
    </div>
  );
};

export default Home;
