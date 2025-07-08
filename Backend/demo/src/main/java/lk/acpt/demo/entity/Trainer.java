package lk.acpt.demo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * Project: Assignment 1 (COMP2003-Object Oriented Software Engineering)
 * Author: Yehanmenura Jayalath
 * Date Modified: 6/24/2025
 **/
@Data
@EqualsAndHashCode(callSuper = false)
@Entity
public class Trainer extends User {
    private String expertise;
    private String profilePictureUrl;
    
    @Column(columnDefinition = "TEXT")
    private String bio;
    
    @Column(columnDefinition = "TEXT")
    private String experience;
    
    @Column(columnDefinition = "TEXT")
    private String certifications;
    
    @Column(columnDefinition = "TEXT")
    private String achievements;
}
