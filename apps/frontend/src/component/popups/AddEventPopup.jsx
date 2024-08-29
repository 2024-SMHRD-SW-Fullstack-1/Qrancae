import React, { useState, useEffect } from 'react';

const colors = [
    '#FFB3B3', // Light Pink
    '#FFDFB3', // Light Yellow
    '#B3FFB3', // Light Green
    '#B3D9FF', // Light Blue
    '#DAB3FF', // Light Purple
];

const AddEventPopup = ({ isOpen, onClose, onSave, defaultStartDate }) => {
    const [title, setTitle] = useState('');
    const [start, setStart] = useState(defaultStartDate || '');
    const [end, setEnd] = useState('');
    const [content, setContent] = useState('');
    const [selectedColor, setSelectedColor] = useState(colors[0]);

    useEffect(() => {
        setStart(defaultStartDate || '');
    }, [defaultStartDate]);

    const handleSave = () => {
        onSave({ title, start, end, content, color: selectedColor });
    };

    return (
        <div className={`popup-overlay popup ${isOpen ? 'open' : ''}`}>
            <div className="popup-content">
                <div className='popup-body'>
                    <h3>일정 추가</h3>
                    {/* <label
                        htmlFor="inlineinput"
                        className="col-md-3 col-form-label"
                    >일정제목
                    </label> */}
                    <div className="col-md-12 p-0">
                        <label
                            htmlFor="inlineinput"
                            className="col-md-3 col-form-label"
                        >Inline Input</label
                        >
                        <input
                            className="form-control input-full"
                            id="inlineinput"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="제목"
                        />
                    </div>
                    <input
                        type="datetime-local"
                        value={start}
                        onChange={(e) => setStart(e.target.value)}
                        placeholder="시작 날짜"
                    />
                    <input
                        type="datetime-local"
                        value={end}
                        onChange={(e) => setEnd(e.target.value)}
                        placeholder="종료 날짜"
                    />
                    <div className="col-md-12 p-0">
                        <label
                            htmlFor="inlineinput"
                            className="col-md-3 col-form-label"
                        >메모</label
                        >
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="메모"
                            className="form-control" id="comment" rows="1" />
                    </div>
                    <div className="color-picker">
                        <label>색상 선택</label>
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
                <div className="popup-buttons">
                    <button onClick={onClose} className="btn btn-primary btn-border close-btn">취소</button>
                    <button onClick={handleSave} className="btn btn-primary">저장</button>
                </div>
            </div>
        </div>
    );
};

export default AddEventPopup;
