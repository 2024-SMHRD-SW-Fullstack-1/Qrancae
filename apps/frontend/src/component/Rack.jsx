import React, { useState, useEffect } from 'react';

const Rack = ({ highlightPosition }) => {
    const numRows = 42; // 총 행 수
    const numCols = 10; // 총 열 수

    // 포트가 채워진 상태를 저장
    const [filledPorts, setFilledPorts] = useState({});

    // 포트 번호 계산 함수
    const calculatePortNumber = (rowIndex, colIndex) => {
        // 포트 번호는 왼쪽 아래가 1, 오른쪽 위가 420
        return (numRows - rowIndex - 1) * numCols + (colIndex + 1);
    };

    // 하이라이트 여부를 결정
    const isHighlighted = (rowIndex, colIndex) => {
        if (!highlightPosition) return false;

        const { rackNumber, portNumber } = highlightPosition;
        const targetRow = numRows - rackNumber;
        const targetCol = (portNumber - 1) % numCols;

        return rowIndex === targetRow && colIndex === targetCol;
    };

    // 포트가 채워진 경우에만 포트 번호 표시
    const getPortNumber = (rowIndex, colIndex) => {
        const portNumber = calculatePortNumber(rowIndex, colIndex);
        return filledPorts[portNumber] ? portNumber : '';
    };

    // 컴포넌트가 렌더링될 때 포트를 채우는 로직
    useEffect(() => {
        if (highlightPosition) {
            const { portNumber } = highlightPosition;
            setFilledPorts({ [portNumber]: true }); // 이전 정보 제거
        } else {
            setFilledPorts({});
        }
    }, [highlightPosition]);

    return (
        <div style={{ padding: '20px' }}>
            <table
                style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    backgroundColor: '#D3D3D3'
                }}
            >
                <tbody>
                    {Array.from({ length: numRows }, (_, rowIndex) => (
                        <tr key={rowIndex}>
                            <td
                                style={{
                                    backgroundColor: 'white',
                                    width: `${100 / (numCols + 1)}%`,
                                    textAlign: 'center'
                                }}
                            >
                                {/* 줄 번호 */}
                                {numRows - rowIndex}
                            </td>
                            {Array.from({ length: numCols }, (_, colIndex) => {
                                const portNumber = calculatePortNumber(rowIndex, colIndex);
                                const isFilled = filledPorts[portNumber];

                                return (
                                    <td
                                        key={colIndex}
                                        style={{
                                            border: '1px solid black',
                                            height: '20px',
                                            backgroundColor:
                                                isHighlighted(rowIndex) || isFilled
                                                    ? '#FF4000' // 주황색으로 하이라이트
                                                    : '#D3D3D3', // 기본 배경색
                                            width: `${100 / (numCols + 1)}%`,
                                            textAlign: 'center',
                                            cursor: 'default' // 클릭 불가능
                                        }}
                                    >
                                        {/* 포트 번호 표시 */}
                                        {getPortNumber(rowIndex, colIndex)}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td style={{ backgroundColor: 'white' }}></td>
                        {Array.from({ length: numCols }, (_, colIndex) => (
                            <td
                                key={colIndex}
                                style={{
                                    backgroundColor: 'white',
                                    width: `${100 / (numCols + 1)}%`,
                                    textAlign: 'center'
                                }}
                            >
                                {colIndex + 1}
                            </td>
                        ))}
                    </tr>
                </tfoot>
            </table>
        </div>
    );
};

export default Rack;
