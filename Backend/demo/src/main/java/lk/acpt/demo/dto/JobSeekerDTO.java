package lk.acpt.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class JobSeekerDTO {
    private Integer id;
    private String username;
    private String firstName;
    private String lastName;
    private String email;
    private String resume;
    private String role;
    private String password;
    private String profilePictureUrl;
    private String about;
    private String skills;
    private String experience;
}
