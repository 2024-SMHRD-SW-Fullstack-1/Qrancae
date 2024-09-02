import React, { useState } from 'react';
import axios from 'axios';

const AIButton = () => {
    const [adviceData, setAdviceData] = useState([]);  // 여러 개의 데이터를 담기 위한 배열
    const [showPopup, setShowPopup] = useState(false); // 팝업 표시 여부

    const handleClick = () => {
        axios.get('/qrancae/api/getMaintenanceAdvice')
            .then(response => {
                const data = response.data;
                // 예상되는 응답 형태: [{ cable_idx: 1, maint_advice: '추천' }, { cable_idx: 2, maint_advice: '비추천' }]
                setAdviceData(data);
                setShowPopup(true);
            })
            .catch(error => {
                console.error("There was an error fetching the maintenance advice!", error);
            });
    };

    const handleClosePopup = () => {
        setShowPopup(false);
    };

    return (
        <div>
            <button onClick={handleClick} className="ai-button">AI</button>
            
            {showPopup && (
                <div className="popup">
                    <div className="popup-content">
                        <h2>점검 추천 결과</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Cable Index</th>
                                    <th>Recommendation</th>
                                </tr>
                            </thead>
                            <tbody>
                                {adviceData.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.cable_idx}</td>
                                        <td>{item.maint_advice}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button onClick={handleClosePopup} className="btn btn-secondary">
                            닫기
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIButton;