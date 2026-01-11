package lk.acpt.demo.service.impl;

import lk.acpt.demo.entity.JobOffer;
import lk.acpt.demo.repositories.JobOfferRepository;
import lk.acpt.demo.service.JobOfferService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class JobOfferServiceImpl implements JobOfferService {
    @Autowired
    private JobOfferRepository jobOfferRepository;

    @Override
    public List<JobOffer> getAllJobOffers() {
        return jobOfferRepository.findAll();
    }

    @Override
    public JobOffer getJobOfferById(Integer id) {
        return jobOfferRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("JobOffer not found with id: " + id));
    }

    @Override
    public JobOffer createJobOffer(JobOffer jobOffer) {
        return jobOfferRepository.save(jobOffer);
    }

    @Override
    public JobOffer updateJobOffer(Integer id, JobOffer jobOffer) {
        JobOffer existing = getJobOfferById(id);
        existing.setTitle(jobOffer.getTitle());
        existing.setDescription(jobOffer.getDescription());
        existing.setEmployer(jobOffer.getEmployer());
        return jobOfferRepository.save(existing);
    }

    @Override
    public void deleteJobOffer(Integer id) {
        jobOfferRepository.deleteById(id);
    }
}