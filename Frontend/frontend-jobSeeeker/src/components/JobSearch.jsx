// Job Seeker: Job Search & Apply Component
import React from 'react';

const JobSearch = () => {
  return (
    <div>
      <h3>Job Search & Apply</h3>
      {/* Job search and application UI */}
      <input type="text" placeholder="Search jobs..." />
      <button>Search</button>
      <div>
        {/* List of jobs will go here */}
        <p>No jobs found.</p>
      </div>
    </div>
  );
};

export default JobSearch;
