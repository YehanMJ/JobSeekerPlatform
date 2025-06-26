package lk.acpt.demo.service.impl;

import lk.acpt.demo.entity.JobSeeker;
import lk.acpt.demo.repositories.JobSeekerRepository;
import lk.acpt.demo.service.JobSeekerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class JobSeekerServiceImpl implements JobSeekerService {
    @Autowired
    private JobSeekerRepository jobSeekerRepository;

    @Override
    public List<JobSeeker> getAllJobSeekers() {
        return jobSeekerRepository.findAll();
    }

    @Override
    public JobSeeker getJobSeekerById(Integer id) {
        return jobSeekerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("JobSeeker not found with id: " + id));
    }

    @Override
    public JobSeeker createJobSeeker(JobSeeker jobSeeker) {
        return jobSeekerRepository.save(jobSeeker);
    }

    @Override
    public JobSeeker updateJobSeeker(Integer id, JobSeeker jobSeeker) {
        JobSeeker existing = getJobSeekerById(id);
        existing.setResumeUrl(jobSeeker.getResumeUrl());
        // set other fields as needed
        return jobSeekerRepository.save(existing);
    }

    @Override
    public void deleteJobSeeker(Integer id) {
        jobSeekerRepository.deleteById(id);
    }
}
