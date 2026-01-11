package lk.acpt.demo.dto;

import lombok.Data;

@Data
public class UserDetailsDTO {
    private Integer id;
    private String email;
    private String password;
    private String role;
    private String username;
    private String firstName;
    private String lastName;
    private String companyName;
    private String resumeUrl;
    private String expertise;
    private String profilePictureUrl;
    private String about;
    private String skills;
    private String experience;
    // Employer company fields
    private String companyLogoUrl;
    private String location;
    private String overview;
    private String industry;
    private String companySize;
    private String website;
    // Trainer specific fields
    private String bio;
    private String certifications;
    private String achievements;
}

