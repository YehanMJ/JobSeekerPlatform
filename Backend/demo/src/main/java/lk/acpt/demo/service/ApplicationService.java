package lk.acpt.demo.service;

import lk.acpt.demo.entity.Application;

import java.util.List;

/**
 * Project: Assignment 1 (COMP2003-Object Oriented Software Engineering)
 * Author: Yehanmenura Jayalath
 * Date Modified: 6/25/2025
 **/
public interface ApplicationService {
    List<Application> getAllApplications();
    Application getApplicationById(Integer id);
    Application createApplication(Application application);
    Application updateApplication(Integer id, Application application);
    void deleteApplication(Integer id);
}
