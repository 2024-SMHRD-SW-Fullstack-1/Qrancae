import React, { useRef, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

Chart.register(...registerables);

const Charts = () => {
  const lineChartRef = useRef(null);
  const barChartRef = useRef(null);
  const pieChartRef = useRef(null);
  const doughnutChartRef = useRef(null);
  const radarChartRef = useRef(null);
  const bubbleChartRef = useRef(null);
  const multipleLineChartRef = useRef(null);
  const multipleBarChartRef = useRef(null);

  useEffect(() => {
    // Line Chart
    if (lineChartRef.current) {
      new Chart(lineChartRef.current, {
        type: 'line',
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
              data: [
                542,
                480,
                430,
                550,
                530,
                453,
                380,
                434,
                568,
                610,
                700,
                900
              ],
            },
          ],
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

    // Bar Chart
    if (barChartRef.current) {
      new Chart(barChartRef.current, {
        type: 'bar',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [{
            label: 'Sales',
            backgroundColor: 'rgb(23, 125, 255)',
            borderColor: 'rgb(23, 125, 255)',
            data: [3, 2, 9, 5, 4, 6, 4, 6, 7, 8, 7, 4],
          }],
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

    // Pie Chart
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

    // Doughnut Chart
    if (doughnutChartRef.current) {
      new Chart(doughnutChartRef.current, {
        type: 'doughnut',
        data: {
          labels: ['Red', 'Blue', 'Yellow'],
          datasets: [{
            label: 'Doughnut Chart',
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

    // Radar Chart
    if (radarChartRef.current) {
      new Chart(radarChartRef.current, {
        type: 'radar',
        data: {
          labels: ['Eating', 'Drinking', 'Sleeping', 'Designing', 'Coding', 'Cycling', 'Running'],
          datasets: [{
            label: 'Activity',
            backgroundColor: 'rgba(179, 181, 198, 0.2)',
            borderColor: 'rgba(179, 181, 198, 1)',
            pointBackgroundColor: 'rgba(179, 181, 198, 1)',
            data: [65, 59, 90, 81, 56, 55, 40],
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            r: {
              beginAtZero: true,
            },
          },
        },
      });
    }

    // Bubble Chart
    if (bubbleChartRef.current) {
      new Chart(bubbleChartRef.current, {
        type: 'bubble',
        data: {
          datasets: [{
            label: 'Bubble Chart',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            data: [
              { x: 10, y: 20, r: 15 },
              { x: 15, y: 30, r: 25 },
              { x: 20, y: 40, r: 35 },
            ],
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
          },
        },
      });
    }

    // Multiple Line Chart
    if (multipleLineChartRef.current) {
      new Chart(multipleLineChartRef.current, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
          datasets: [
            {
              label: 'Dataset 1',
              borderColor: '#FF5733',
              backgroundColor: 'rgba(255, 87, 51, 0.2)',
              data: [10, 20, 30, 40, 50, 60, 70],
            },
            {
              label: 'Dataset 2',
              borderColor: '#33FF57',
              backgroundColor: 'rgba(51, 255, 87, 0.2)',
              data: [70, 60, 50, 40, 30, 20, 10],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              beginAtZero: true,
            },
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    }

    // Multiple Bar Chart
    if (multipleBarChartRef.current) {
      new Chart(multipleBarChartRef.current, {
        type: 'bar',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [
            {
              label: 'Dataset 1',
              backgroundColor: '#FF5733',
              data: [10, 20, 30, 40, 50, 60],
            },
            {
              label: 'Dataset 2',
              backgroundColor: '#33FF57',
              data: [60, 50, 40, 30, 20, 10],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              stacked: true,
            },
            y: {
              stacked: true,
              beginAtZero: true,
            },
          },
        },
      });
    }
  }, []);

  return (
    <div className="wrapper">
      <Sidebar />

      <div className="main-panel">
        <Header />

        <div className="container">
          <div className="page-inner">
            <h3 className="fw-bold mb-3">Chart.js</h3>
            <div className="page-category">
              Simple yet flexible JavaScript charting for designers &
              developers. Please checkout their
              <a href="http://www.chartjs.org/"
                target="_blank"
                rel="noopener noreferrer">
                full documentation
              </a>
              .
            </div>
            <div className="row">
              <div className="col-md-6">
                <div className="card">
                  <div className="card-header">
                    <div className="card-title">Line Chart</div>
                  </div>
                  <div className="card-body">
                    <div className="chart-container">
                      <canvas ref={lineChartRef}></canvas>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card">
                  <div className="card-header">
                    <div className="card-title">Bar Chart</div>
                  </div>
                  <div className="card-body">
                    <div className="chart-container">
                      <canvas ref={barChartRef}></canvas>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card">
                  <div className="card-header">
                    <div className="card-title">Pie Chart</div>
                  </div>
                  <div className="card-body">
                    <div className="chart-container">
                      <canvas ref={pieChartRef}></canvas>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card">
                  <div className="card-header">
                    <div className="card-title">Doughnut Chart</div>
                  </div>
                  <div className="card-body">
                    <div className="chart-container">
                      <canvas ref={doughnutChartRef}></canvas>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card">
                  <div className="card-header">
                    <div className="card-title">Radar Chart</div>
                  </div>
                  <div className="card-body">
                    <div className="chart-container">
                      <canvas ref={radarChartRef}></canvas>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card">
                  <div className="card-header">
                    <div className="card-title">Bubble Chart</div>
                  </div>
                  <div className="card-body">
                    <div className="chart-container">
                      <canvas ref={bubbleChartRef}></canvas>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card">
                  <div className="card-header">
                    <div className="card-title">Multiple Line Chart</div>
                  </div>
                  <div className="card-body">
                    <div className="chart-container">
                      <canvas ref={multipleLineChartRef}></canvas>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card">
                  <div className="card-header">
                    <div className="card-title">Multiple Bar Chart</div>
                  </div>
                  <div className="card-body">
                    <div className="chart-container">
                      <canvas ref={multipleBarChartRef}></canvas>
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

export default Charts;
