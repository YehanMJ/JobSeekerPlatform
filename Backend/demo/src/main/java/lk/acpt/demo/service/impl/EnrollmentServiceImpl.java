package lk.acpt.demo.service.impl;

import lk.acpt.demo.entity.Enrollment;
import lk.acpt.demo.repositories.EnrollmentRepository;
import lk.acpt.demo.service.EnrollmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class EnrollmentServiceImpl implements EnrollmentService {
    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Override
    public List<Enrollment> getAllEnrollments() {
        return enrollmentRepository.findAll();
    }

    @Override
    public Enrollment getEnrollmentById(Integer id) {
        return enrollmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Enrollment not found with id: " + id));
    }

    @Override
    public Enrollment createEnrollment(Enrollment enrollment) {
        return enrollmentRepository.save(enrollment);
    }

    @Override
    public Enrollment updateEnrollment(Integer id, Enrollment enrollment) {
        Enrollment existing = getEnrollmentById(id);
        existing.setJobSeeker(enrollment.getJobSeeker());
        existing.setCourse(enrollment.getCourse());
        return enrollmentRepository.save(existing);
    }

    @Override
    public void deleteEnrollment(Integer id) {
        enrollmentRepository.deleteById(id);
    }
}
