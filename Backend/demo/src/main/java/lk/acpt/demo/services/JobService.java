package lk.acpt.demo.services;

import lk.acpt.demo.dto.JobDTO;
import java.util.List;
import java.util.Optional;

public interface JobService {
    List<JobDTO> getAllJobs();
    Optional<JobDTO> getJobById(Integer id);
    JobDTO createJob(JobDTO jobDTO);
    Optional<JobDTO> updateJob(Integer id, JobDTO jobDTO);
    boolean deleteJob(Integer id);
    boolean existsById(Integer id);
}
