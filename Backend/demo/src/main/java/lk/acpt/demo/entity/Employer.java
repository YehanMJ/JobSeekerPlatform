package lk.acpt.demo.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Project: Assignment 1 (COMP2003-Object Oriented Software Engineering)
 * Author: Yehanmenura Jayalath
 * Date Modified: 6/24/2025
 **/
@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Employer extends User {
    private String companyName;
    private String profilePictureUrl;
    private String companyLogoUrl;
    private String location;
    @Column(columnDefinition = "TEXT")
    private String overview;
    private String industry;
    private String companySize;
    private String website;
}
