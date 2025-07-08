package lk.acpt.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TrainerDTO {
    private Integer id;
    private String username;
    private String firstName;
    private String lastName;
    private String expertise;
    private String email;
    private String role;
    private String password;
    private String profilePictureUrl;
    private String bio;
    private String experience;
    private String certifications;
    private String achievements;
}
