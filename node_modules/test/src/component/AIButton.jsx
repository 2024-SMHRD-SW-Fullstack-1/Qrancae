import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AIModal from './AIModal';

const AIButton = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [loading, setLoading] = useState(false); // 로딩 상태 추가
  const [loadingText, setLoadingText] = useState('Loading'); // 로딩 텍스트 상태 추가

  const handleClick = async () => {
    setLoading(true); // API 요청 전 로딩 상태를 true로 설정
    try {
      const response = await axios.get('http://localhost:5000/runMaintenanceAdvisor');
      setRecommendations(response.data);
      setModalIsOpen(true);
    } catch (error) {
      console.error("API 요청 실패: ", error);
    } finally {
      setLoading(false); // API 응답이 끝나면 로딩 상태를 false로 설정
    }
  };

  // 로딩 텍스트 애니메이션 효과
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingText(prev => {
          if (prev === 'Loading....') return 'Loading';
          return prev + '.';
        });
      }, 500); // 0.5초 간격으로 텍스트 변경
      return () => clearInterval(interval); // 클린업
    }
  }, [loading]);

  return (
    <div>
      <button onClick={handleClick} disabled={loading}>
        AI
      </button>
      {loading && <div className="loading-text">{loadingText}</div>} {/* 로딩 중일 때 로딩 텍스트 표시 */}
      <AIModal
        isOpen={modalIsOpen}
        onClose={() => setModalIsOpen(false)}
        recommendations={recommendations}
      />
    </div>
  );
};

export default AIButton;
