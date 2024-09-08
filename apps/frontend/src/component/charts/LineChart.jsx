import React, { useRef, useEffect, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import axios from 'axios';

Chart.register(...registerables);

const LineChart = ({ year }) => {
  const lineChartRef = useRef(null);
  const [logData, setLogData] = useState({});

  useEffect(() => {
    // 차트 인스턴스 제거
    const chartInstance =
      lineChartRef.current && Chart.getChart(lineChartRef.current);
    if (chartInstance) {
      chartInstance.destroy();
    }

    // 데이터 가져오기
    axios({
      url: `${process.env.REACT_APP_API_URL}/logChart/${year}`,
      method: 'get',
    })
      .then((res) => {
        console.log('해당 연도 로그 내역', res.data);
        setLogData(res.data);
      })
      .catch((error) => {
        console.error('Error fetching log data:', error);
      });
  }, [year]); // year가 변경될 때만 데이터 가져오기 및 차트 새로 그리기

  useEffect(() => {
    // 차트 데이터가 업데이트되면 차트를 새로 그리기
    if (lineChartRef.current && Object.keys(logData).length > 0) {
      new Chart(lineChartRef.current, {
        type: 'line',
        data: {
          labels: [
            '1월',
            '2월',
            '3월',
            '4월',
            '5월',
            '6월',
            '7월',
            '8월',
            '9월',
            '10월',
            '11월',
            '12월',
          ],
          datasets: [
            {
              label: '월별 로그 내역',
              borderColor: '#1D3557',
              pointBorderColor: '#FFF',
              pointBackgroundColor: '#1D3557',
              pointBorderWidth: 2,
              pointHoverRadius: 4,
              pointHoverBorderWidth: 1,
              pointRadius: 4,
              backgroundColor: 'transparent',
              fill: true,
              borderWidth: 2,
              data: [
                logData.Jan || 0,
                logData.Feb || 0,
                logData.Mar || 0,
                logData.Apr || 0,
                logData.May || 0,
                logData.Jun || 0,
                logData.Jul || 0,
                logData.Aug || 0,
                logData.Sep || 0,
                logData.Oct || 0,
                logData.Nov || 0,
                logData.Dec || 0,
              ],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 10,
                color: '#1D3557',
                font: {
                  size: 16,
                  family: "'NanumSquareNeo'",
                },
              },
            },
            tooltip: {
              bodySpacing: 4,
              mode: 'nearest',
              intersect: 0,
              position: 'nearest',
              xPadding: 10,
              yPadding: 10,
              caretPadding: 10,
            },
          },
          layout: {
            padding: { left: 15, right: 15, top: 15, bottom: 15 },
          },
          scales: {
            x: {
              ticks: {
                font: {
                  size: 12, // x축 텍스트 크기 설정
                },
              },
            },
            y: {
              ticks: {
                font: {
                  size: 12, // y축 텍스트 크기 설정
                },
              },
            },
          },
          font: {
            family: "'NanumSquareNeo'",
            size: 12,
          },
        },
      });
    }
  }, [logData]); // logData가 변경될 때만 차트 새로 그리기

  return (
    <div className="chart-container">
      <canvas ref={lineChartRef}></canvas>
    </div>
  );
};

export default LineChart;
