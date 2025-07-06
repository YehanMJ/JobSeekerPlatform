package lk.acpt.demo.service.impl;

import lk.acpt.demo.entity.JobSeeker;
import lk.acpt.demo.repositories.JobSeekerRepository;
import lk.acpt.demo.service.JobSeekerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;

@Service
public class JobSeekerServiceImpl implements JobSeekerService {
    @Autowired
    private JobSeekerRepository jobSeekerRepository;

    @Override
    public List<JobSeeker> getAllJobSeekers() {
        return jobSeekerRepository.findAll();
    }

    @Override
    public JobSeeker getJobSeekerById(Integer id) {
        return jobSeekerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("JobSeeker not found with id: " + id));
    }

    @Override
    public JobSeeker createJobSeeker(JobSeeker jobSeeker, MultipartFile file) {
        if (file == null || file.isEmpty() || !file.getOriginalFilename().endsWith(".pdf")) {
            throw new RuntimeException("Invalid file. Please upload a PDF file.");
        }
        // Encode password with Base64
        String encodedPassword = java.util.Base64.getEncoder().encodeToString(jobSeeker.getPassword().getBytes(java.nio.charset.StandardCharsets.UTF_8));
        jobSeeker.setPassword(encodedPassword);
        // Save the jobseeker first to get the username
        JobSeeker savedJobSeeker = jobSeekerRepository.save(jobSeeker);
        String uploadDir = System.getProperty("user.dir") + File.separator + "uploads" + File.separator + "cv";
        File dir = new File(uploadDir);
        if (!dir.exists()) dir.mkdirs();
        String username = savedJobSeeker.getUsername();
        String fileName = "cv_" + username + "_" + System.currentTimeMillis() + ".pdf";
        File dest = new File(dir, fileName);
        try {
            file.transferTo(dest);
        } catch (IOException e) {
            throw new RuntimeException("Failed to save file.", e);
        }
        savedJobSeeker.setResumeUrl("/" + uploadDir + fileName);
        return jobSeekerRepository.save(savedJobSeeker);
    }

    @Override
    public JobSeeker updateJobSeeker(Integer id, JobSeeker jobSeeker) {
        JobSeeker existing = getJobSeekerById(id);
        existing.setResumeUrl(jobSeeker.getResumeUrl());
        // set other fields as needed
        return jobSeekerRepository.save(existing);
    }

    @Override
    public void deleteJobSeeker(Integer id) {
        jobSeekerRepository.deleteById(id);
    }

    @Override
    public JobSeeker uploadCv(Integer id, MultipartFile file) {
        JobSeeker jobSeeker = getJobSeekerById(id);
        if (file == null || file.isEmpty() || !file.getOriginalFilename().endsWith(".pdf")) {
            throw new RuntimeException("Invalid file. Please upload a PDF file.");
        }
        String uploadDir = "uploads/cv/";
        File dir = new File(uploadDir);
        if (!dir.exists()) dir.mkdirs();
        // Use username instead of id in the file name
        String username = jobSeeker.getUsername();
        String fileName = "cv_" + username + "_" + System.currentTimeMillis() + ".pdf";
        File dest = new File(dir, fileName);
        try {
            file.transferTo(dest);
        } catch (IOException e) {
            throw new RuntimeException("Failed to save file.", e);
        }
        jobSeeker.setResumeUrl("/" + uploadDir + fileName);
        return jobSeekerRepository.save(jobSeeker);
    }

    @Override
    public JobSeeker uploadProfilePicture(Integer id, MultipartFile file) {
        JobSeeker jobSeeker = getJobSeekerById(id);
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Invalid file. Please upload an image file.");
        }
        String uploadDir = System.getProperty("user.dir") + File.separator + "uploads" + File.separator + "profile";
        File dir = new File(uploadDir);
        if (!dir.exists()) dir.mkdirs();
        String username = jobSeeker.getUsername();
        String fileName = "profile_" + username + "_" + System.currentTimeMillis() + "_" + file.getOriginalFilename();
        File dest = new File(dir, fileName);
        try {
            file.transferTo(dest);
        } catch (IOException e) {
            throw new RuntimeException("Failed to save profile picture.", e);
        }
        String fullUrl = "http://localhost:8080/uploads/profile/" + fileName;
        jobSeeker.setProfilePictureUrl(fullUrl);
        return jobSeekerRepository.save(jobSeeker);
    }
}
