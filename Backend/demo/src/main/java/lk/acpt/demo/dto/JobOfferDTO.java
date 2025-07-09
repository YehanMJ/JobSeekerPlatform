package lk.acpt.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class JobOfferDTO {
    private Integer id;
    private String title;
    private String description;
    private Integer employerId;
    private Integer jobId;
}
