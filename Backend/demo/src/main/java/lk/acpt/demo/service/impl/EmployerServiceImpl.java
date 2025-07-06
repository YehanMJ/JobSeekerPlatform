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
        // Encode password with Base64
        String encodedPassword = java.util.Base64.getEncoder().encodeToString(employer.getPassword().getBytes(java.nio.charset.StandardCharsets.UTF_8));
        employer.setPassword(encodedPassword);
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

    @Override
    public Employer uploadProfilePicture(Integer id, org.springframework.web.multipart.MultipartFile file) {
        Employer employer = getEmployerById(id);
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Invalid file. Please upload an image file.");
        }
        String uploadDir = System.getProperty("user.dir") + java.io.File.separator + "uploads" + java.io.File.separator + "profile";
        java.io.File dir = new java.io.File(uploadDir);
        if (!dir.exists()) dir.mkdirs();
        String username = employer.getUsername();
        String fileName = "profile_" + username + "_" + System.currentTimeMillis() + "_" + file.getOriginalFilename();
        java.io.File dest = new java.io.File(dir, fileName);
        try {
            file.transferTo(dest);
        } catch (java.io.IOException e) {
            throw new RuntimeException("Failed to save profile picture.", e);
        }
        String fullUrl = "http://localhost:8080/uploads/profile/" + fileName;
        employer.setProfilePictureUrl(fullUrl);
        return employerRepository.save(employer);
    }
}
