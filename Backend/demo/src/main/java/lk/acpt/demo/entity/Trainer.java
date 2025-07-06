package lk.acpt.demo.entity;

import jakarta.persistence.Entity;
import lombok.Data;

/**
 * Project: Assignment 1 (COMP2003-Object Oriented Software Engineering)
 * Author: Yehanmenura Jayalath
 * Date Modified: 6/24/2025
 **/
@Data
@Entity
public class Trainer extends User {
    private String expertise;
    private String profilePictureUrl;
}
