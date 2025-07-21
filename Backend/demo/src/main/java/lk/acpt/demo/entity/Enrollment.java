package lk.acpt.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Project: Assignment 1 (COMP2003-Object Oriented Software Engineering)
 * Author: Yehanmenura Jayalath
 * Date Modified: 6/24/2025
 **/
@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Enrollment {
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Integer id;
    
    @ManyToOne
    private JobSeeker jobSeeker;
    
    @ManyToOne
    private Course course;
    
    @Column(name = "enrollment_date")
    private LocalDateTime enrollmentDate;
    
    @Column(name = "status")
    private String status; // ENROLLED, COMPLETED, DROPPED, IN_PROGRESS
    
    @Column(name = "progress")
    private Double progress; // Progress percentage (0-100)
    
    @PrePersist
    public void prePersist() {
        if (enrollmentDate == null) {
            enrollmentDate = LocalDateTime.now();
        }
        if (status == null) {
            status = "ENROLLED";
        }
        if (progress == null) {
            progress = 0.0;
        }
    }
}
