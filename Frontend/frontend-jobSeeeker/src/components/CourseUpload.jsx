// Trainer: Course Upload Component
import React from 'react';

const CourseUpload = () => {
  return (
    <div>
      <h3>Upload Course</h3>
      {/* Form for uploading course materials */}
      <form>
        <input type="text" placeholder="Course Title" required />
        <input type="file" />
        <button type="submit">Upload</button>
      </form>
    </div>
  );
};

export default CourseUpload;
