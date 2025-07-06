// Job Seeker: Resume Upload Component
import React from 'react';

const ResumeUpload = () => {
  return (
    <div>
      <h3>Upload Resume</h3>
      <form>
        <input type="file" accept=".pdf,.doc,.docx" />
        <button type="submit">Upload</button>
      </form>
    </div>
  );
};

export default ResumeUpload;
