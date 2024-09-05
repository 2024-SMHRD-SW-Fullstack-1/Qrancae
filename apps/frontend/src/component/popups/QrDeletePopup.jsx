// QrDeletePopup.jsx
import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const QrDeletePopup = ({ show, handleClose, modalMessage, onConfirm, onCancel }) => {
    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>케이블 삭제</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ marginTop: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
                선택된 케이블 : <b>{modalMessage}</b>
            </Modal.Body>
            <Modal.Footer className="modal-footer-custom">
                <p style={{ color: 'red' }}>해당 케이블의 모든 데이터가 삭제됩니다.</p>
                <div>
                    {onCancel && (
                        <Button variant="secondary" onClick={onCancel} style={{ marginRight: '0.5rem' }}>
                            취소
                        </Button>
                    )}
                    <Button variant="primary" onClick={onConfirm}>
                        삭제
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default QrDeletePopup;
