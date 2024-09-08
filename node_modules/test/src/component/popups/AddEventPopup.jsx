import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import styles from '../Login.module.css';

const colors = [
    '#FF6384',
    '#36A2EB',
    '#FFCE56',
    '#FF9F40',
    '#4CAF50',
];

const AddEventPopup = ({ isOpen, onClose, onSave }) => {
    const getCurrentDateTime = () => {
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        const localNow = new Date(now.getTime() - offset);
        return localNow.toISOString().slice(0, 16);
    };

    const [title, setTitle] = useState('');
    const [start, setStart] = useState(getCurrentDateTime());
    const [end, setEnd] = useState(getCurrentDateTime());
    const [content, setContent] = useState('');
    const [selectedColor, setSelectedColor] = useState(colors[0]);
    const [allDay, setAllDay] = useState(false);
    const [showError, setShowError] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const now = getCurrentDateTime();
            setStart(now);
            setEnd(now);
            setShowError(false); // Reset error when opening popup
        }
    }, [isOpen]);

    useEffect(() => {
        const startDateTime = new Date(start);
        const endDateTime = new Date(end);

        if (startDateTime > endDateTime) {
            setEnd(start);
        }
    }, [start]);

    useEffect(() => {
        const startDateTime = new Date(start);
        const endDateTime = new Date(end);

        if (endDateTime < startDateTime) {
            setStart(end);
        }
    }, [end]);

    const handleStartChange = (e) => {
        const value = e.target.value;

        if (allDay) {
            const datePart = value.slice(0, 10); // '2024-09-18'
            setStart(`${datePart}T00:00`);
        } else {
            setStart(value);
        }
    };

    const handleEndChange = (e) => {
        const value = e.target.value;

        if (allDay) {
            const datePart = value.slice(0, 10); // '2024-09-18'
            setEnd(`${datePart}T00:00`);
        } else {
            setEnd(value);
        }
    };

    const handleSave = () => {
        if (title.trim() === '') {
            setShowError(true);
            return;
        }

        onSave({ title, start, end, content, color: selectedColor, allDay });
        onClose(); // Close the modal after saving
    };

    return (
        <Modal show={isOpen} onHide={onClose} centered className="add-event-popup">
            <Modal.Dialog className="custom-modal-dialog" style={{ width: '700px' }}>
                <Modal.Header closeButton>
                    <Modal.Title>일정 추가</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.5rem' }}>
                        <label>제목</label>
                        {showError && (
                            <div className={styles.error} style={{ margin: 0 }}>*제목을 입력해주세요.</div>
                        )}
                    </div>
                    <input
                        className="form-control input-full"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="제목을 입력해주세요."
                        style={{ marginBottom: '0.5rem' }}
                    />
                    <div className="check-allday" style={{ marginBottom: '0.5rem' }}>
                        <span>하루종일</span>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={allDay}
                                onChange={(e) => setAllDay(e.target.checked)}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>
                    <div className="date-range" style={{ marginBottom: '0.5rem' }}>
                        <input
                            type={allDay ? 'date' : 'datetime-local'}
                            value={allDay ? start.slice(0, 10) : start}
                            onChange={handleStartChange}
                            placeholder="시작 날짜"
                            className="form-control"
                            style={{ marginBottom: '0.5rem' }}
                        />
                        <span className="arrow">
                            <i className='fas fa-arrow-right'></i>
                        </span>
                        <input
                            type={allDay ? 'date' : 'datetime-local'}
                            value={allDay ? end.slice(0, 10) : end}
                            onChange={handleEndChange}
                            placeholder="종료 날짜"
                            className="form-control"
                            style={{ marginBottom: '0.5rem' }}
                        />
                    </div>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="메모를 입력해주세요."
                        className="form-control"
                        rows="2"
                    />
                </Modal.Body>
                <Modal.Footer className="modal-footer-custom">
                    <div className="color-picker">
                        <div className="color-options">
                            {colors.map((color) => (
                                <div
                                    key={color}
                                    className={`colorinput color-option ${selectedColor === color ? 'selected' : ''}`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => setSelectedColor(color)}
                                ></div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <Button variant="secondary" onClick={onClose} style={{ marginRight: '0.5rem' }}>
                            취소
                        </Button>
                        <Button variant="primary" onClick={handleSave}>
                            저장
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal.Dialog>
        </Modal>
    );
};

export default AddEventPopup;
