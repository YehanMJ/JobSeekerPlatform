package lk.acpt.demo.repositories;

import lk.acpt.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Project: Assignment 1 (COMP2003-Object Oriented Software Engineering)
 * Author: Yehanmenura Jayalath
 * Date Modified: 6/9/2025
 **/
public interface UserRepo extends JpaRepository<User,Integer> {

}
