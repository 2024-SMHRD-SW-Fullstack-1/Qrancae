import React from 'react';
import Modal from 'react-modal';
import styles from './AIModal.module.css'; // 새로운 CSS 모듈 임포트

Modal.setAppElement('#root'); // Modal의 접근성 설정

const AIModal = ({ isOpen, onClose, recommendations }) => {
  // 중복된 케이블 번호 제거
  const uniqueRecommendations = Array.from(new Set(recommendations.map(rec => rec.cable_idx)))
    .map(cable_idx => {
      return recommendations.find(rec => rec.cable_idx === cable_idx);
    });

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} className={styles.modal} overlayClassName={styles.overlay}>
      <h2 className={styles.title}>점검 추천 결과</h2>
      <ul className={styles.list}>
        {uniqueRecommendations.length > 0 ? (
          uniqueRecommendations.map((rec, index) => (
            <li key={index} className={styles.listItem}>
              케이블: {rec.cable_idx}, 점검: 추천
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
