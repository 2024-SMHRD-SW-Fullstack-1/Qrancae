import React, { useState, useEffect } from 'react';
import axios from 'axios';

const colors = [
    '#D95319',
    '#EDB120',
    '#77AC30',
    '#0072BD',
    '#7E7E7E',
];

const EditEventPopup = ({ isOpen, onClose, event, onSave }) => {
    console.log(event);

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
        // 입력된 값 그대로 사용
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
            onClose();
        });
    };

    useEffect(() => {
        // 시작 날짜와 종료 날짜 간의 유효성 검사를 수행합니다.
        const startDateTime = new Date(start);
        const endDateTime = new Date(end);

        if (startDateTime > endDateTime) {
            setEnd(start); // 종료 날짜를 시작 날짜와 동일하게 설정
        }
    }, [start]);

    useEffect(() => {
        // 종료 날짜와 시작 날짜 간의 유효성 검사를 수행합니다.
        const startDateTime = new Date(start);
        const endDateTime = new Date(end);

        if (endDateTime < startDateTime) {
            setStart(end); // 시작 날짜를 종료 날짜와 동일하게 설정
        }
    }, [end]);

    if (!isOpen) return null;

    return (
        <div className={`popup-overlay popup ${isOpen ? 'open' : ''}`}>
            <div className="popup-content-left">
                <div className='popup-body'>
                    <div className='popup-color-header'>
                        <h3>일정 수정</h3>
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
                    </div>
                    <input
                        className="form-control input-full"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="제목"
                    />
                    <div className="check-allday">
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
                    <div className="date-range">
                        <input
                            type={allDay ? 'date' : 'datetime-local'}
                            value={allDay ? start.slice(0, 10) : start}
                            onChange={(e) => setStart(e.target.value)}
                            placeholder="시작 날짜"
                            className="form-control"
                        />
                        <span className="arrow">
                            <i className='fas fa-arrow-right'></i>
                        </span>
                        <input
                            type={allDay ? 'date' : 'datetime-local'}
                            value={allDay ? end.slice(0, 10) : end}
                            onChange={(e) => setEnd(e.target.value)}
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
                    />
                </div>
                <div className="popup-buttons">
                    <button onClick={onClose} className="btn btn-primary btn-border close-btn">취소</button>
                    <button onClick={handleDelete} className="btn btn-primary">삭제</button>
                    <button onClick={handleSave} className="btn btn-primary">수정</button>
                </div>
            </div>
        </div>
    );
};

export default EditEventPopup;
