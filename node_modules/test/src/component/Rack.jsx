import React, { useState, useEffect } from 'react';

const Rack = ({ highlightPosition }) => {
    const numRows = 42; // 총 행 수
    const numCols = 10; // 총 열 수

    // 포트가 채워진 상태를 저장할 상태 변수
    const [filledPorts, setFilledPorts] = useState({});

    // 랙 번호와 포트 번호로 인덱스 계산
    const getRowIndex = (rackNumber) => numRows - rackNumber;
    const getColIndex = (portNumber) => (portNumber - 1) % numCols;

    const columnWidth = `${100 / (numCols + 1)}%`;

    // 하이라이트 여부를 결정하는 함수
    const isHighlighted = (rowIndex, colIndex) => {
        if (!highlightPosition) return false;

        const { rackNumber, portNumber } = highlightPosition;
        const targetRow = getRowIndex(parseInt(rackNumber, 10));
        const targetCol = getColIndex(parseInt(portNumber, 10));

        return rowIndex === targetRow && colIndex === targetCol;
    };

    // 포트 번호 계산 함수
    const calculatePortNumber = (rowIndex, colIndex) => {
        const rackNumber = numRows - rowIndex;
        return rackNumber * numCols - (numCols - colIndex - 1);
    };

    // 포트가 채워진 경우에만 포트 번호 표시
    const getPortNumber = (rowIndex, colIndex) => {
        const portNumber = calculatePortNumber(rowIndex, colIndex);
        return filledPorts[portNumber] ? portNumber : '';
    };

    // 클릭된 케이블의 포트 번호로 해당 포트를 채우는 함수
    const fillPort = () => {
        if (highlightPosition) {
            const { rackNumber, portNumber } = highlightPosition;
            const rowIndex = getRowIndex(parseInt(rackNumber, 10));
            const colIndex = getColIndex(parseInt(portNumber, 10));
            const portNum = calculatePortNumber(rowIndex, colIndex);

            setFilledPorts((prev) => {
                const updatedPorts = { ...prev, [portNum]: true };
                console.log(`Port filled: Rack ${rackNumber}, Port ${portNumber}, Row ${rowIndex}, Col ${colIndex}`);
                return updatedPorts;
            });
        }
    };

    // 컴포넌트가 렌더링될 때 포트를 채우는 로직
    useEffect(() => {
        fillPort();
    }, [highlightPosition]);

    // 콘솔에 상태 출력
    useEffect(() => {
        console.log('Current filled ports:', filledPorts);
    }, [filledPorts]);

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
                                    width: columnWidth,
                                    textAlign: 'center'
                                }}
                            >
                                {/* 줄 */}
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
                                                isHighlighted(rowIndex, colIndex) || isFilled
                                                    ? '#FF4000' // 주황색으로 하이라이트
                                                    : '#D3D3D3', // 기본 배경색
                                            width: columnWidth,
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
                                    width: columnWidth,
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