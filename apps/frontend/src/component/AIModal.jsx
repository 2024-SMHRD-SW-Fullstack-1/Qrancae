import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import styles from './AIModal.module.css';
import axios from 'axios';

Modal.setAppElement('#root'); // Modal의 접근성 설정

const AIModal = ({ isOpen, onClose, recommendations }) => {
  // 추천 목록을 상태로 관리
  const [recommendationList, setRecommendationList] = useState([]);

  useEffect(() => {
    if (recommendations.length > 0) {
      console.log('모달에서 받은 추천 목록:', recommendations);
      setRecommendationList(recommendations);
    }
  }, [recommendations]);

  // 확인 버튼 클릭 시 maint_advice 업데이트
  const handleConfirm = async (cable_idx) => {
    try {
      // 서버에 cable_idx를 전송해 maint_advice를 '추천'으로 업데이트
      await axios.post('http://localhost:5000/updateAdvice', { cable_idx });

      // 업데이트 후 해당 케이블을 추천 목록에서 제거
      const updatedRecommendations = recommendationList.filter(rec => rec.cable_idx !== cable_idx);
      setRecommendationList(updatedRecommendations); // 상태 업데이트

    } catch (error) {
      console.error("API 요청 실패: ", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} className={styles.modal} overlayClassName={styles.overlay}>
      <h2 className={styles.title}>점검 추천 결과</h2>
      <ul className={styles.list}>
        {recommendationList.length > 0 ? (
          recommendationList.map((rec, index) => (
            <li key={index} className={styles.listItem}>
              케이블: {rec.cable_idx}, 랙 번호: {rec.s_rack_number}, 랙 위치: {rec.s_rack_location}, 포트 번호: {rec.s_port_number}, 점검: 추천
              <button onClick={() => handleConfirm(rec.cable_idx)} className={styles.confirmButton}>확인</button>
            </li>
          ))
        ) : (
          <p className={styles.noRecommendation}>추천된 점검 사항이 없습니다.</p>
        )}
      </ul>
      <button onClick={onClose} className={styles.closeButton}>닫기</button>
    </Modal>
  );
};

export default AIModal;
