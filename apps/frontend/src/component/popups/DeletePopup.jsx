import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const DeletePopup = ({ isOpen, closePopup, handleDeleteSelected }) => {
    return (
        <Modal show={isOpen} onHide={closePopup} centered>
            <Modal.Header closeButton>
                <Modal.Title>케이블 삭제</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ textAlign: 'center', marginTop: '2rem', marginBottom: '2rem' }}>
                <h5 style={{ margin: 0 }}>선택된 케이블을 삭제하시겠습니까?</h5>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={closePopup}>취소</Button>
                <Button variant="primary" onClick={() => { handleDeleteSelected(); closePopup(); }}>
                    확인
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DeletePopup;
