package lk.acpt.demo.dto;

import lombok.Data;

@Data
public class UserDetailsDTO {
    private Integer id;
    private String email;
    private String password;
    private String role;
    private String username;
    private String companyName;
    private String resumeUrl;
    private String expertise;
    private String profilePictureUrl;
}

