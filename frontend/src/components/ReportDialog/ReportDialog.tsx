// components/ReportDialog/ReportDialog.tsx
import React, { useState } from 'react';

interface ReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onReport: (reason: string) => void;
  contentType: string;
}

const REPORT_REASONS = [
  { id: 'spam', label: 'Spam or misleading content' },
  { id: 'harassment', label: 'Harassment or bullying' },
  { id: 'inappropriate', label: 'Inappropriate content' },
  { id: 'copyright', label: 'Copyright violation' },
  { id: 'other', label: 'Other reason' }
];

const ReportDialog: React.FC<ReportDialogProps> = ({ 
  isOpen, 
  onClose, 
  onReport, 
  contentType 
}) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    const finalReason = selectedReason === 'other' 
      ? `Other: ${customReason}`
      : REPORT_REASONS.find(r => r.id === selectedReason)?.label || selectedReason;
    
    if (finalReason) {
      onReport(finalReason);
      setSelectedReason('');
      setCustomReason('');
      onClose();
    }
  };

  const canSubmit = selectedReason && (selectedReason !== 'other' || customReason.trim());

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.4)', // Lighter overlay
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px' // Added padding so it's not edge-to-edge
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '320px', // Smaller max width
        maxHeight: '70vh', // Smaller height
        overflow: 'auto',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
      }}>
        <h3 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: '16px',
          marginBottom: '12px',
          color: '#1C1C1C'
        }}>
          Report {contentType}
        </h3>
        
        <p style={{ 
          marginBottom: '16px', 
          color: '#666',
          fontSize: '13px',
          lineHeight: '1.4'
        }}>
          Why are you reporting this?
        </p>
        
        <div style={{ marginBottom: '16px' }}>
          {REPORT_REASONS.map((reason) => (
            <label key={reason.id} style={{
              display: 'flex',
              alignItems: 'flex-start',
              marginBottom: '10px',
              cursor: 'pointer',
              padding: '4px 0'
            }}>
              <input
                type="radio"
                name="reportReason"
                value={reason.id}
                checked={selectedReason === reason.id}
                onChange={(e) => setSelectedReason(e.target.value)}
                style={{
                  marginRight: '8px',
                  marginTop: '2px'
                }}
              />
              <span style={{
                fontSize: '13px',
                color: '#333',
                lineHeight: '1.4'
              }}>
                {reason.label}
              </span>
            </label>
          ))}
        </div>
        
        {selectedReason === 'other' && (
          <div style={{ marginBottom: '16px' }}>
            <textarea
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Please describe the reason..."
              style={{
                width: '100%',
                minHeight: '60px',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontFamily: 'Arial, sans-serif',
                fontSize: '13px',
                resize: 'vertical'
              }}
            />
          </div>
        )}
        
        <div style={{
          display: 'flex',
          gap: '10px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              background: 'white',
              cursor: 'pointer',
              fontSize: '13px',
              fontFamily: 'Arial, sans-serif'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              background: canSubmit ? '#FF4444' : '#ccc',
              color: 'white',
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              fontSize: '13px',
              fontFamily: 'Arial, sans-serif'
            }}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportDialog;