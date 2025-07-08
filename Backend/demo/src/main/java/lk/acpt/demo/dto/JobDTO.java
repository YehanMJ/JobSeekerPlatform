package lk.acpt.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class JobDTO {
    private Integer id;
    private String title;
    private String description;
    private String requirements;
    private Integer employerId;
    private String location;
    private String jobTime;
    private String salary;
    private LocalDateTime deadline;
    private String modality;
    private String category;
}
