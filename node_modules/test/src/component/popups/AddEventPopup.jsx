import React, { useState, useEffect } from 'react';

// 색상 배열
const colors = [
    '#D95319',
    '#EDB120',
    '#77AC30',
    '#0072BD',
    '#7E7E7E',
];

const AddEventPopup = ({ isOpen, onClose, onSave }) => {
    // 현재 날짜 및 시간 포맷팅 함수
    const getCurrentDateTime = () => {
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000; // 밀리초 단위로 변환
        const localNow = new Date(now.getTime() - offset);
        return localNow.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:MM" 포맷
    };

    const [title, setTitle] = useState('');
    const [start, setStart] = useState(getCurrentDateTime());
    const [end, setEnd] = useState(getCurrentDateTime());
    const [content, setContent] = useState('');
    const [selectedColor, setSelectedColor] = useState(colors[0]);
    const [allDay, setAllDay] = useState(false); // 하루종일 상태

    useEffect(() => {
        if (isOpen) {
            const now = getCurrentDateTime();
            setStart(now);
            setEnd(now);
        }
    }, [isOpen]);

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

    const handleSave = () => {
        onSave({ title, start, end, content, color: selectedColor, allDay });
    };

    return (
        <div className={`popup-overlay popup ${isOpen ? 'open' : ''}`}>
            <div className="popup-content-left">
                <div className='popup-body'>
                    <div className='popup-color-header'>
                        <h3>일정 추가</h3>
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
                    <button onClick={handleSave} className="btn btn-primary">저장</button>
                </div>
            </div>
        </div>
    );
};

export default AddEventPopup;
