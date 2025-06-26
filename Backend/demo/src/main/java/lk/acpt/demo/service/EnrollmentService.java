package lk.acpt.demo.service;

import lk.acpt.demo.entity.Enrollment;
import java.util.List;

public interface EnrollmentService {
    List<Enrollment> getAllEnrollments();
    Enrollment getEnrollmentById(Integer id);
    Enrollment createEnrollment(Enrollment enrollment);
    Enrollment updateEnrollment(Integer id, Enrollment enrollment);
    void deleteEnrollment(Integer id);
}