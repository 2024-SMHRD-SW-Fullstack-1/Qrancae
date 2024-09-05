import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AIModal from './AIModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons'; // 엄지척 아이콘

const AIButton = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Loading');

  const handleClick = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/runMaintenanceAdvisor');
      setRecommendations(response.data);
      setModalIsOpen(true);
    } catch (error) {
      console.error("API 요청 실패: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingText(prev => (prev === 'Loading....' ? 'Loading' : prev + '.'));
      }, 500);
      return () => clearInterval(interval);
    }
  }, [loading]);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <FontAwesomeIcon
        icon={faThumbsUp}
        size="2x"
        onClick={handleClick}
        style={{ cursor: 'pointer', color: loading ? '#aaa' : '#007bff' }}
      />
      {loading && <div className="loading-text">{loadingText}</div>}
      <AIModal
        isOpen={modalIsOpen}
        onClose={() => setModalIsOpen(false)}
        recommendations={recommendations}
      />
    </div>
  );
};

export default AIButton;
