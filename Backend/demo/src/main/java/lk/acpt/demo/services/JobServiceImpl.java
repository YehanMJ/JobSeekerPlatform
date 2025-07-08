package lk.acpt.demo.services;

import lk.acpt.demo.dto.JobDTO;
import lk.acpt.demo.entity.Job;
import lk.acpt.demo.repositories.JobRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class JobServiceImpl implements JobService {

    private final JobRepository jobRepository;
    private final ModelMapper modelMapper;

    @Autowired
    public JobServiceImpl(JobRepository jobRepository, ModelMapper modelMapper) {
        this.jobRepository = jobRepository;
        this.modelMapper = modelMapper;
    }

    @Override
    public List<JobDTO> getAllJobs() {
        return jobRepository.findAll().stream()
                .map(job -> modelMapper.map(job, JobDTO.class))
                .toList();
    }

    @Override
    public Optional<JobDTO> getJobById(Integer id) {
        return jobRepository.findById(id)
                .map(job -> modelMapper.map(job, JobDTO.class));
    }

    @Override
    public JobDTO createJob(JobDTO jobDTO) {
        Job job = modelMapper.map(jobDTO, Job.class);
        Job savedJob = jobRepository.save(job);
        return modelMapper.map(savedJob, JobDTO.class);
    }

    @Override
    public Optional<JobDTO> updateJob(Integer id, JobDTO jobDTO) {
        return jobRepository.findById(id)
                .map(existingJob -> {
                    modelMapper.map(jobDTO, existingJob);
                    Job updatedJob = jobRepository.save(existingJob);
                    return modelMapper.map(updatedJob, JobDTO.class);
                });
    }

    @Override
    public boolean deleteJob(Integer id) {
        if (jobRepository.existsById(id)) {
            jobRepository.deleteById(id);
            return true;
        }
        return false;
    }

    @Override
    public boolean existsById(Integer id) {
        return jobRepository.existsById(id);
    }
}
