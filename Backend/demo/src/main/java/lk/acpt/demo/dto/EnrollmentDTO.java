package lk.acpt.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EnrollmentDTO {
    private Integer id;
    private Integer courseId;
    private Integer jobSeekerId;
    private String status;
    private LocalDateTime enrollmentDate;
    private Double progress;
    
    // Additional fields for detailed responses
    private String courseTitle;
    private String jobSeekerName;
}
