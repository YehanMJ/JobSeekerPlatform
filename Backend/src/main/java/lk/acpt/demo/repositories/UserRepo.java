package lk.acpt.demo.repositories;

import lk.acpt.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Project: Assignment 1 (COMP2003-Object Oriented Software Engineering)
 * Author: Yehanmenura Jayalath
 * Date Modified: 6/9/2025
 **/
@Repository
public interface UserRepo extends JpaRepository<User,Integer> {
    User findByUsername(String username);
}
