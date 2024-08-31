import React from 'react'

const ModalPopup = ({ isOpen, onClose, message }) => {
    if (!isOpen) return null;

    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <div className='popup-body'>
                    {message}
                </div>
                <div className="popup-buttons">
                    <button onClick={onClose} className="btn btn-primary">확인</button>
                </div>
            </div>
        </div>
    );
}

export default ModalPopup