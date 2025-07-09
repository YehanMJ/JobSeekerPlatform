package lk.acpt.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CourseDTO {
    private Integer id;
    private String title;
    private String description;
    private String duration;
    private String level;
    private String category;
    private List<String> prerequisites;
    private List<CourseModuleDTO> modules;
    private LocalDateTime createdAt;
    private Integer trainerId;
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CourseModuleDTO {
        private Long id;
        private String title;
        private String description;
        private String duration;
    }
}
