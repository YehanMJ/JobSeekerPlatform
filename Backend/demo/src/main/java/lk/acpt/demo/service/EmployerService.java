package lk.acpt.demo.service;

import lk.acpt.demo.entity.Employer;
import java.util.List;

public interface EmployerService {
    List<Employer> getAllEmployers();
    Employer getEmployerById(Integer id);
    Employer createEmployer(Employer employer);
    Employer updateEmployer(Integer id, Employer employer);
    void deleteEmployer(Integer id);
    Employer uploadProfilePicture(Integer id, org.springframework.web.multipart.MultipartFile file);
    Employer uploadCompanyLogo(Integer id, org.springframework.web.multipart.MultipartFile file);
}