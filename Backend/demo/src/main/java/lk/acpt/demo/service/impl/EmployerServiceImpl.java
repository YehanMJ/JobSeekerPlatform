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
        existing.setLocation(employer.getLocation());
        existing.setOverview(employer.getOverview());
        existing.setIndustry(employer.getIndustry());
        existing.setCompanySize(employer.getCompanySize());
        existing.setWebsite(employer.getWebsite());
        // Update other basic fields
        existing.setUsername(employer.getUsername());
        existing.setEmail(employer.getEmail());
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

        // Delete old profile picture if it exists
        deleteOldProfilePicture(employer.getProfilePictureUrl());

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

    @Override
    public Employer uploadCompanyLogo(Integer id, org.springframework.web.multipart.MultipartFile file) {
        Employer employer = getEmployerById(id);
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Invalid file. Please upload an image file.");
        }

        // Delete old company logo if it exists
        deleteOldCompanyLogo(employer.getCompanyLogoUrl());

        String uploadDir = System.getProperty("user.dir") + java.io.File.separator + "uploads" + java.io.File.separator + "company-logos";
        java.io.File dir = new java.io.File(uploadDir);
        if (!dir.exists()) dir.mkdirs();
        String username = employer.getUsername();
        String fileName = "company_logo_" + username + "_" + System.currentTimeMillis() + "_" + file.getOriginalFilename();
        java.io.File dest = new java.io.File(dir, fileName);
        try {
            file.transferTo(dest);
        } catch (java.io.IOException e) {
            throw new RuntimeException("Failed to save company logo.", e);
        }
        String fullUrl = "http://localhost:8080/uploads/company-logos/" + fileName;
        employer.setCompanyLogoUrl(fullUrl);
        return employerRepository.save(employer);
    }

    private void deleteOldCompanyLogo(String companyLogoUrl) {
        if (companyLogoUrl != null && !companyLogoUrl.isEmpty()) {
            try {
                // Extract filename from URL
                String fileName = companyLogoUrl.substring(companyLogoUrl.lastIndexOf("/") + 1);
                String uploadDir = System.getProperty("user.dir") + java.io.File.separator + "uploads" + java.io.File.separator + "company-logos";
                java.io.File oldFile = new java.io.File(uploadDir, fileName);
                if (oldFile.exists()) {
                    oldFile.delete();
                }
            } catch (Exception e) {
                // Log the error but don't stop the upload process
                System.err.println("Failed to delete old company logo: " + e.getMessage());
            }
        }
    }

    private void deleteOldProfilePicture(String profilePictureUrl) {
        if (profilePictureUrl != null && !profilePictureUrl.isEmpty()) {
            try {
                // Extract filename from URL
                String fileName = profilePictureUrl.substring(profilePictureUrl.lastIndexOf("/") + 1);
                String uploadDir = System.getProperty("user.dir") + java.io.File.separator + "uploads" + java.io.File.separator + "profile";
                java.io.File oldFile = new java.io.File(uploadDir, fileName);
                if (oldFile.exists()) {
                    oldFile.delete();
                }
            } catch (Exception e) {
                // Log the error but don't stop the upload process
                System.err.println("Failed to delete old profile picture: " + e.getMessage());
            }
        }
    }
}
