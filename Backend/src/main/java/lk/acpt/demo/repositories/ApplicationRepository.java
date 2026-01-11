package lk.acpt.demo.repositories;

import lk.acpt.demo.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Integer> {
    List<Application> findByJobSeeker_Id(Integer jobSeekerId);
    List<Application> findByJob_Id(Integer jobId);
}
