package lk.acpt.demo.controllers;

import lk.acpt.demo.entity.JobSeeker;
import lk.acpt.demo.repositories.JobSeekerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "*")
public class FileController {
    
    @Autowired
    private JobSeekerRepository jobSeekerRepository;
    
    @PostMapping("/fix-resume-urls")
    public ResponseEntity<String> fixResumeUrls() {
        try {
            List<JobSeeker> jobSeekers = jobSeekerRepository.findAll();
            int fixedCount = 0;
            
            for (JobSeeker jobSeeker : jobSeekers) {
                if (jobSeeker.getResumeUrl() != null && !jobSeeker.getResumeUrl().isEmpty()) {
                    String currentUrl = jobSeeker.getResumeUrl();
                    
                    // Fix URLs that start with system path
                    if (currentUrl.contains("\\uploads\\cv\\") || currentUrl.contains("/uploads/cv/")) {
                        // Extract filename from the path
                        String fileName = currentUrl.substring(currentUrl.lastIndexOf("\\") + 1);
                        if (fileName.contains("/")) {
                            fileName = fileName.substring(fileName.lastIndexOf("/") + 1);
                        }
                        
                        // Create proper URL
                        String newUrl = "http://localhost:8080/uploads/cv/" + fileName;
                        jobSeeker.setResumeUrl(newUrl);
                        jobSeekerRepository.save(jobSeeker);
                        fixedCount++;
                    }
                }
            }
            
            return ResponseEntity.ok("Fixed " + fixedCount + " resume URLs");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fixing resume URLs: " + e.getMessage());
        }
    }
    
    @GetMapping("/test-resume-urls")
    public ResponseEntity<String> testResumeUrls() {
        try {
            List<JobSeeker> jobSeekers = jobSeekerRepository.findAll();
            StringBuilder result = new StringBuilder();
            
            for (JobSeeker jobSeeker : jobSeekers) {
                if (jobSeeker.getResumeUrl() != null && !jobSeeker.getResumeUrl().isEmpty()) {
                    result.append("User: ").append(jobSeeker.getUsername())
                          .append(" - Resume URL: ").append(jobSeeker.getResumeUrl())
                          .append("\n");
                }
            }
            
            return ResponseEntity.ok(result.toString());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error testing resume URLs: " + e.getMessage());
        }
    }
}
