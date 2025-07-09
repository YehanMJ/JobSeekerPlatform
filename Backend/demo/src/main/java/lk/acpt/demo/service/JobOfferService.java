package lk.acpt.demo.service;

import lk.acpt.demo.entity.JobOffer;
import java.util.List;

public interface JobOfferService {
    List<JobOffer> getAllJobOffers();
    JobOffer getJobOfferById(Integer id);
    JobOffer createJobOffer(JobOffer jobOffer);
    JobOffer updateJobOffer(Integer id, JobOffer jobOffer);
    void deleteJobOffer(Integer id);
}
