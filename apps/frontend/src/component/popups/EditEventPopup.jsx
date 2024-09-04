import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import axios from 'axios';

const colors = [
    '#FF6384',
    '#36A2EB',
    '#FFCE56',
    '#FF9F40',
    '#4CAF50',
];

const EditEventPopup = ({ isOpen, onClose, event, onSave, getCalendarList }) => {
    const [title, setTitle] = useState(event?.title || '');
    const [content, setContent] = useState(event?.content || '');
    const [start, setStart] = useState(event?.start || '');
    const [end, setEnd] = useState(event?.end || '');
    const [color, setColor] = useState(event?.color || '#ffffff');
    const [allDay, setAllDay] = useState(event?.allDay === "O" || false);

    useEffect(() => {
        if (event) {
            setTitle(event.title || '');
            setContent(event.content || '');
            setStart(event.start || '');
            setEnd(event.end || '');
            setColor(event.color || '#ffffff');
            setAllDay(event.allDay === "O" || false);
        }
    }, [event]);

    const handleSave = () => {
        const updatedEvent = {
            ...event,
            title,
            content,
            start,
            end,
            color,
            allDay,
            id: event.id,
        };

        onSave(updatedEvent);
        onClose();
    };

    const handleDelete = () => {
        axios({
            url: `http://localhost:8089/qrancae/deleteCalendar/${event.id}`,
            method: 'get',
        }).then(() => {
            getCalendarList();
            onClose();
        });
    };

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

    return (
        <Modal show={isOpen} onHide={onClose} centered className="edit-event-popup">
            <Modal.Dialog className="custom-modal-dialog" style={{ width: '700px' }}>
                <Modal.Header closeButton>
                    <Modal.Title>일정 수정</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <input
                        className="form-control input-full"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="제목"
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
                        />
                        <span className="arrow" style={{ marginBottom: '0.5rem' }}>
                            <i className='fas fa-arrow-right'></i>
                        </span>
                        <input
                            type={allDay ? 'date' : 'datetime-local'}
                            value={allDay ? end.slice(0, 10) : end}
                            onChange={handleEndChange}
                            placeholder="종료 날짜"
                            className="form-control"
                        />
                    </div>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="메모"
                        className="form-control"
                        rows="2"
                        style={{ marginBottom: '0.5rem' }}
                    />
                </Modal.Body>
                <Modal.Footer className="modal-footer-custom">
                    <div className="color-picker">
                        <div className="color-options">
                            {colors.map((item) => (
                                <div
                                    key={item}
                                    className={`colorinput color-option ${item === color ? 'selected' : ''}`}
                                    style={{ backgroundColor: item }}
                                    onClick={() => setColor(item)}
                                ></div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label onClick={handleDelete} className='btn btn-label-primary' style={{ marginRight: '0.5rem' }}>
                            삭제
                        </label>
                        <Button onClick={handleSave} className='btn btn-primary'>
                            수정
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal.Dialog>
        </Modal>
    );
};

export default EditEventPopup;
