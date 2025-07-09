package lk.acpt.demo.service.impl;

import lk.acpt.demo.entity.Trainer;
import lk.acpt.demo.repositories.TrainerRepository;
import lk.acpt.demo.service.TrainerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class TrainerServiceImpl implements TrainerService {
    @Autowired
    private TrainerRepository trainerRepository;

    @Override
    public List<Trainer> getAllTrainers() {
        return trainerRepository.findAll();
    }

    @Override
    public Trainer getTrainerById(Integer id) {
        return trainerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trainer not found with id: " + id));
    }

    @Override
    public Trainer createTrainer(Trainer trainer) {
        // Encode password with Base64
        String encodedPassword = java.util.Base64.getEncoder().encodeToString(trainer.getPassword().getBytes(java.nio.charset.StandardCharsets.UTF_8));
        trainer.setPassword(encodedPassword);
        return trainerRepository.save(trainer);
    }

    @Override
    public Trainer updateTrainer(Integer id, Trainer trainer) {
        Trainer existing = getTrainerById(id);
        existing.setExpertise(trainer.getExpertise());
        
        // Update new trainer profile fields
        if (trainer.getBio() != null) {
            existing.setBio(trainer.getBio());
        }
        if (trainer.getExperience() != null) {
            existing.setExperience(trainer.getExperience());
        }
        if (trainer.getCertifications() != null) {
            existing.setCertifications(trainer.getCertifications());
        }
        if (trainer.getAchievements() != null) {
            existing.setAchievements(trainer.getAchievements());
        }
        
        return trainerRepository.save(existing);
    }

    @Override
    public void deleteTrainer(Integer id) {
        trainerRepository.deleteById(id);
    }

    @Override
    public Trainer uploadProfilePicture(Integer id, org.springframework.web.multipart.MultipartFile file) {
        Trainer trainer = getTrainerById(id);
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Invalid file. Please upload an image file.");
        }

        // Delete old profile picture if it exists
        deleteOldProfilePicture(trainer.getProfilePictureUrl());

        String uploadDir = System.getProperty("user.dir") + java.io.File.separator + "uploads" + java.io.File.separator + "profile";
        java.io.File dir = new java.io.File(uploadDir);
        if (!dir.exists()) dir.mkdirs();
        String username = trainer.getUsername();
        String fileName = "profile_" + username + "_" + System.currentTimeMillis() + "_" + file.getOriginalFilename();
        java.io.File dest = new java.io.File(dir, fileName);
        try {
            file.transferTo(dest);
        } catch (java.io.IOException e) {
            throw new RuntimeException("Failed to save profile picture.", e);
        }
        String fullUrl = "http://localhost:8080/uploads/profile/" + fileName;
        trainer.setProfilePictureUrl(fullUrl);
        return trainerRepository.save(trainer);
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