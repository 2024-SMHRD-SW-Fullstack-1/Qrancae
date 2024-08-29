import React from 'react';

const Rack = () => {
    const numRows = 32;
    const numCols = 10;

    const columnWidth = `${100 / (numCols + 1)}%`;

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
                                    width: columnWidth
                                }}
                            >
                                {/* 줄 */}
                                {32 - rowIndex}
                            </td>
                            {Array.from({ length: numCols }, (_, colIndex) => (
                                <td
                                    key={colIndex}
                                    style={{
                                        border: '5px solid black',
                                        height: '10px',
                                        backgroundColor: rowIndex === 2 && colIndex === 5
                                            ? '#FF4000' // 주황색으로 변경
                                            : '#D3D3D3', // 기본 배경색
                                        width: columnWidth
                                    }}
                                >
                                </td>
                            ))}
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
