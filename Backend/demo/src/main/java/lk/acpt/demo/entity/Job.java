package lk.acpt.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Project: Assignment 1 (COMP2003-Object Oriented Software Engineering)
 * Author: Yehanmenura Jayalath
 * Date Modified: 6/9/2025
 **/
@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Job {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(length = 255)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(columnDefinition = "TEXT")
    private String requirements;
    
    private Long employerId;
    
    @Column(length = 255)
    private String location;
    
    @Column(length = 50)
    private String jobTime; // e.g., "full-time", "half-time"
    
    @Column(length = 100)
    private String salary;
    
    private LocalDateTime deadline;
    
    @Column(length = 50)
    private String modality; // e.g., "Onsite", "Remote", "Hybrid"
    
    @Column(length = 255)
    private String category;
}
