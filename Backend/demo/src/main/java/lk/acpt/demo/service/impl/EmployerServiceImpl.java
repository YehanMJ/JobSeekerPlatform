package lk.acpt.demo.service.impl;

import lk.acpt.demo.entity.Employer;
import lk.acpt.demo.repositories.EmployerRepository;
import lk.acpt.demo.service.EmployerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class EmployerServiceImpl implements EmployerService {
    @Autowired
    private EmployerRepository employerRepository;

    @Override
    public List<Employer> getAllEmployers() {
        return employerRepository.findAll();
    }

    @Override
    public Employer getEmployerById(Integer id) {
        return employerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employer not found with id: " + id));
    }

    @Override
    public Employer createEmployer(Employer employer) {
        return employerRepository.save(employer);
    }

    @Override
    public Employer updateEmployer(Integer id, Employer employer) {
        Employer existing = getEmployerById(id);
        existing.setCompanyName(employer.getCompanyName());
        // set other fields as needed
        return employerRepository.save(existing);
    }

    @Override
    public void deleteEmployer(Integer id) {
        employerRepository.deleteById(id);
    }
}
