import React, { useState } from 'react';
import { Resizable } from 'react-resizable';
import 'react-resizable/css/styles.css';
import '../../styles/ResizableComp.css'
function ResizableComp() {
  const [width, setWidth] = useState(400); // Initial width
  const handleMouseDown = (e) => {
    e.preventDefault(); // Prevent default behavior like text selection
    document.body.style.userSelect = 'none'; // Disable text selection

    const startX = e.clientX;
    const startWidth = width;

    const onMouseMove = (moveEvent) => {
      const newWidth = startWidth - (moveEvent.clientX - startX);
      if (newWidth > 50 && newWidth < 900) { // Min and max constraints
        setWidth(newWidth);
      }
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.userSelect = ''; // Re-enable text selection
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };
  return (
    <div className='history-main-wraper'>
      <div className='history-main'>
        <h1 className='rotated-text'>Events History</h1>
      </div>
    </div>
    //   <div
    //   style={{
    //     width: `${width}px`,
    //     height: 'auto',
    //     position: 'relative',
    //     border: '2px solid #e0e0e0',
    //     borderTop:'none',
    //     boxSizing: 'border-box',
    //     padding: '20px',
    //   }}
    // >
    //   <div
    //     style={{
    //       position: 'absolute',
    //       top: 0,
    //       left: 0,
    //       height: '100%',
    //       width: '10px',
    //       cursor: 'ew-resize',
    //       zIndex: 10,
    //     }}
    //     onMouseDown={handleMouseDown}
    //   />
    //   Recent Changes
    // </div>
  );
}

export default ResizableComp
