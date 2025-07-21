package lk.acpt.demo.repositories;

import lk.acpt.demo.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Integer> {
    
    @Query("SELECT e FROM Enrollment e WHERE e.course.id = :courseId AND e.jobSeeker.id = :jobSeekerId")
    List<Enrollment> findByCourseIdAndJobSeekerId(@Param("courseId") Integer courseId, @Param("jobSeekerId") Integer jobSeekerId);
    
    @Query("SELECT e FROM Enrollment e WHERE e.jobSeeker.id = :jobSeekerId")
    List<Enrollment> findByJobSeekerId(@Param("jobSeekerId") Integer jobSeekerId);
    
    @Query("SELECT e FROM Enrollment e WHERE e.course.id = :courseId")
    List<Enrollment> findByCourseId(@Param("courseId") Integer courseId);
}
