package lk.acpt.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmployerDTO {
    private Integer id;
    private String username;
    private String company;
    private String email;
    private String role;
    private String password;
    private String profilePictureUrl;
    private String companyLogoUrl;
    private String location;
    private String overview;
    private String industry;
    private String companySize;
    private String website;
}
