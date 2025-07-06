package lk.acpt.demo.entity;

import jakarta.persistence.Entity;
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
public class JobSeeker extends User {
    private String resumeUrl;
    private String profilePictureUrl;

}
