  // CollapsiblePanel.js
  import React, { useState } from 'react';

  const CollapsiblePanel = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(true);

    const togglePanel = () => {
      setIsOpen(!isOpen);
    };

    return (
      <div className="collapsible-panel">
        <div className="panel-header" onClick={togglePanel}>
          <h2>{title}</h2>
          <button>{isOpen ? 'Collapse' : 'Expand'}</button>
        </div>
        {isOpen && <div className="panel-content">{children}</div>}
      </div>
    );
  };

  export default CollapsiblePanel;
