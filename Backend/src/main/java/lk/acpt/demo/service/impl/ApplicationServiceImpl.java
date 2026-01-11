package lk.acpt.demo.service.impl;

import lk.acpt.demo.entity.Application;
import lk.acpt.demo.repositories.ApplicationRepository;
import lk.acpt.demo.service.ApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ApplicationServiceImpl implements ApplicationService {
    @Autowired
    private ApplicationRepository applicationRepository;

    @Override
    public List<Application> getAllApplications() {
        return applicationRepository.findAll();
    }

    @Override
    public Application getApplicationById(Integer id) {
        return applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found with id: " + id));
    }

    @Override
    public Application createApplication(Application application) {
        return applicationRepository.save(application);
    }

    @Override
    public Application updateApplication(Integer id, Application application) {
        Application existing = getApplicationById(id);
        existing.setJobSeeker(application.getJobSeeker());
        existing.setJob(application.getJob());
        existing.setStatus(application.getStatus());
        return applicationRepository.save(existing);
    }

    @Override
    public void deleteApplication(Integer id) {
        applicationRepository.deleteById(id);
    }
}
