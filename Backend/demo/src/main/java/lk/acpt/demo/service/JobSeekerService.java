package lk.acpt.demo.service;

import lk.acpt.demo.entity.JobSeeker;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface JobSeekerService {
    List<JobSeeker> getAllJobSeekers();
    JobSeeker getJobSeekerById(Integer id);
    JobSeeker createJobSeeker(JobSeeker jobSeeker, MultipartFile file);
    JobSeeker updateJobSeeker(Integer id, JobSeeker jobSeeker);
    void deleteJobSeeker(Integer id);
    JobSeeker uploadCv(Integer id, MultipartFile file);
    JobSeeker uploadProfilePicture(Integer id, MultipartFile file);
}
