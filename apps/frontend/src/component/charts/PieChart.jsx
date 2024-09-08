import React, { useRef, useEffect, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import axios from 'axios';

Chart.register(...registerables);

const PieChart = ({ year, month, range }) => {
  const pieChartRef = useRef(null);
  const [defectData, setDefectData] = useState([]);

  useEffect(() => {
    // 차트 인스턴스 제거
    const chartInstance =
      pieChartRef.current && Chart.getChart(pieChartRef.current);
    if (chartInstance) {
      chartInstance.destroy();
    }

    // 데이터 가져오기
    axios({
      url: `${process.env.REACT_APP_API_URL}/defectChart`,
      method: 'get',
      params: { year, month, range },
    })
      .then((res) => {
        console.log('불량률', res.data);
        setDefectData(res.data);
      })
      .catch((error) => {
        console.error('Error fetching log data:', error);
      });
  }, [year, month, range]);

  useEffect(() => {
    // 기존 차트 인스턴스 제거
    const chartInstance =
      pieChartRef.current && Chart.getChart(pieChartRef.current);
    if (chartInstance) {
      chartInstance.destroy();
    }

    // 새로운 차트 데이터와 설정
    const labels =
      defectData.length > 0
        ? defectData.map((item) => Object.keys(item)[0])
        : ['데이터 없음'];
    const data =
      defectData.length > 0
        ? defectData.map((item) => {
            const value = Object.values(item)[0];
            return parseFloat(value.toFixed(2)); // 소수점 이하 2자리로 반올림
          })
        : [1]; // 데이터가 없을 때 기본값 1로 설정

    const chartData = {
      labels: labels,
      datasets: [
        {
          label: 'Pie Chart',
          backgroundColor:
            defectData.length > 0
              ? ['#FF6384', '#36A2EB', '#FFCE56', '#FF9F40']
              : ['#FF6384'],
          data: data,
        },
      ],
    };

    // 차트 생성
    new Chart(pieChartRef.current, {
      type: 'pie',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              font: {
                size: 14,
                family: "'NanumSquareNeo'",
              },
            },
          },
          tooltip: {
            callbacks: {
              label: function (tooltipItem) {
                return tooltipItem.label + ': ' + tooltipItem.raw.toFixed(2);
              },
            },
          },
        },
      },
    });
  }, [defectData]);

  const formatPercentage = (value) => {
    const formatted = parseFloat(value).toFixed(2);
    return formatted.endsWith('.00') ? formatted.slice(0, -3) : formatted;
  };

  return (
    <div className="chart-and-table-container">
      <div className="chart-container defect-rate-chart">
        <canvas ref={pieChartRef}></canvas>
      </div>
      <table className="table table-striped table-bordered mt-3 defect-rate-table">
        <thead>
          <tr>
            <th scope="col">순위</th>
            <th scope="col">랙 번호</th>
            <th scope="col">불량률</th>
          </tr>
        </thead>
        <tbody>
          {defectData.length === 0 ? (
            <tr>
              <td colSpan="3" className="text-center">
                데이터가 없습니다.
              </td>
            </tr>
          ) : (
            defectData.map((item, index) => {
              const label = Object.keys(item)[0];
              const value = Object.values(item)[0];
              return (
                <tr key={label}>
                  <td>{index + 1}</td>
                  <td>{label}</td>
                  <td>{formatPercentage(value * 100)}%</td>{' '}
                  {/* 불량률을 백분율로 표시 */}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PieChart;
