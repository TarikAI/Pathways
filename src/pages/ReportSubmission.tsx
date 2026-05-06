import React, { useState } from 'react';
import { UploadCloud, File, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ReportSubmission = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1>Submit Report</h1>
        <p style={{ color: '#666', marginTop: '8px' }}>Upload your weekly or final training report for supervisor review.</p>
      </div>

      <div className="card">
        <form>
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Report Type</label>
            <select className="form-control">
              <option value="weekly_1">Week 1 Report</option>
              <option value="weekly_2">Week 2 Report</option>
              <option value="weekly_3">Week 3 Report</option>
              <option value="weekly_4">Week 4 Report</option>
              <option value="weekly_5" selected>Week 5 Report</option>
              <option value="final">Final Report</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Upload Document</label>
            <div className="upload-area">
              <UploadCloud size={48} className="upload-icon" />
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Click or drag file to this area to upload</h3>
              <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Support for a single or bulk upload. Strictly prohibit from uploading company data or other band files.</p>
              <p style={{ color: '#999', fontSize: '12px', marginTop: '8px' }}>Supported formats: PDF, DOCX, ZIP</p>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '32px' }}>
            <label className="form-label">Additional Comments (Optional)</label>
            <textarea className="form-control" rows={4} placeholder="Enter any notes or comments for your supervisor..."></textarea>
          </div>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary">
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportSubmission;
