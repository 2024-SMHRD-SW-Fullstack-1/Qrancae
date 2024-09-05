import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const ModalPopup = ({ isOpen, onClose, message }) => {
    return (
        <Modal show={isOpen} onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>알림</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ textAlign: 'center', marginTop: '2rem', marginBottom: '2rem' }}>
                <h5 style={{ margin: 0 }}>{message}</h5>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={onClose}>
                    확인
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalPopup;
