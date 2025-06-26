package lk.acpt.demo.service;

import lk.acpt.demo.entity.JobSeeker;
import java.util.List;

public interface JobSeekerService {
    List<JobSeeker> getAllJobSeekers();
    JobSeeker getJobSeekerById(Integer id);
    JobSeeker createJobSeeker(JobSeeker jobSeeker);
    JobSeeker updateJobSeeker(Integer id, JobSeeker jobSeeker);
    void deleteJobSeeker(Integer id);
}
