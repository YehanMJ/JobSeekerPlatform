package lk.acpt.demo.controllers;

import lk.acpt.demo.dto.EnrollmentDTO;
import lk.acpt.demo.entity.Course;
import lk.acpt.demo.entity.Enrollment;
import lk.acpt.demo.entity.JobSeeker;
import lk.acpt.demo.repositories.CourseRepository;
import lk.acpt.demo.repositories.EnrollmentRepository;
import lk.acpt.demo.repositories.JobSeekerRepository;
import lk.acpt.demo.util.JWTTokenGenerator;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin
@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentController {
    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final JobSeekerRepository jobSeekerRepository;
    private final ModelMapper modelMapper;
    private final JWTTokenGenerator jwtTokenGenerator;

    @Autowired
    public EnrollmentController(EnrollmentRepository enrollmentRepository, 
                               CourseRepository courseRepository,
                               JobSeekerRepository jobSeekerRepository,
                               ModelMapper modelMapper, 
                               JWTTokenGenerator jwtTokenGenerator) {
        this.enrollmentRepository = enrollmentRepository;
        this.courseRepository = courseRepository;
        this.jobSeekerRepository = jobSeekerRepository;
        this.modelMapper = modelMapper;
        this.jwtTokenGenerator = jwtTokenGenerator;
    }

    @GetMapping
    public ResponseEntity<List<EnrollmentDTO>> getAll(@RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        if (jwtTokenGenerator.verifyToken(authorizationHeader)) {
            List<EnrollmentDTO> dtos = enrollmentRepository.findAll().stream()
                .map(enrollment -> modelMapper.map(enrollment, EnrollmentDTO.class))
                .toList();
            return ResponseEntity.ok(dtos);
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EnrollmentDTO> getById(@PathVariable Integer id, @RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        if (jwtTokenGenerator.verifyToken(authorizationHeader)) {
            return enrollmentRepository.findById(id)
                .map(enrollment -> ResponseEntity.ok(modelMapper.map(enrollment, EnrollmentDTO.class)))
                .orElseGet(() -> ResponseEntity.notFound().build());
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @PostMapping
    public ResponseEntity<EnrollmentDTO> create(@RequestBody EnrollmentDTO dto, @RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        if (jwtTokenGenerator.verifyToken(authorizationHeader)) {
            Enrollment enrollment = modelMapper.map(dto, Enrollment.class);
            EnrollmentDTO saved = modelMapper.map(enrollmentRepository.save(enrollment), EnrollmentDTO.class);
            return new ResponseEntity<>(saved, HttpStatus.CREATED);
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EnrollmentDTO> update(@PathVariable Integer id, @RequestBody EnrollmentDTO dto, @RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        if (jwtTokenGenerator.verifyToken(authorizationHeader)) {
            return enrollmentRepository.findById(id)
                .map(enrollment -> {
                    modelMapper.map(dto, enrollment);
                    return ResponseEntity.ok(modelMapper.map(enrollmentRepository.save(enrollment), EnrollmentDTO.class));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id, @RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        if (jwtTokenGenerator.verifyToken(authorizationHeader)) {
            if (enrollmentRepository.existsById(id)) {
                enrollmentRepository.deleteById(id);
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.notFound().build();
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    // New endpoint for course enrollment
    @PostMapping("/enroll")
    public ResponseEntity<EnrollmentDTO> enrollInCourse(
            @RequestParam Integer courseId,
            @RequestParam Integer jobSeekerId,
            @RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        
        if (!jwtTokenGenerator.verifyToken(authorizationHeader)) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        try {
            // Check if course exists
            Optional<Course> courseOpt = courseRepository.findById(courseId);
            if (courseOpt.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }

            // Check if job seeker exists
            Optional<JobSeeker> jobSeekerOpt = jobSeekerRepository.findById(jobSeekerId);
            if (jobSeekerOpt.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }

            // Check if already enrolled
            List<Enrollment> existingEnrollments = enrollmentRepository.findByCourseIdAndJobSeekerId(courseId, jobSeekerId);
            if (!existingEnrollments.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.CONFLICT); // Already enrolled
            }

            // Create new enrollment
            Enrollment enrollment = new Enrollment();
            enrollment.setCourse(courseOpt.get());
            enrollment.setJobSeeker(jobSeekerOpt.get());
            enrollment.setStatus("ENROLLED");
            enrollment.setProgress(0.0);

            Enrollment savedEnrollment = enrollmentRepository.save(enrollment);
            
            // Convert to DTO
            EnrollmentDTO enrollmentDTO = convertToDTO(savedEnrollment);
            
            return new ResponseEntity<>(enrollmentDTO, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Helper method to convert Enrollment to DTO with additional details
    private EnrollmentDTO convertToDTO(Enrollment enrollment) {
        EnrollmentDTO dto = modelMapper.map(enrollment, EnrollmentDTO.class);
        dto.setCourseId(enrollment.getCourse().getId());
        dto.setJobSeekerId(enrollment.getJobSeeker().getId());
        dto.setCourseTitle(enrollment.getCourse().getTitle());
        dto.setJobSeekerName(enrollment.getJobSeeker().getFirstName() + " " + enrollment.getJobSeeker().getLastName());
        return dto;
    }

    // Get enrollments by job seeker
    @GetMapping("/jobseeker/{jobSeekerId}")
    public ResponseEntity<List<EnrollmentDTO>> getEnrollmentsByJobSeeker(
            @PathVariable Integer jobSeekerId,
            @RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        
        if (!jwtTokenGenerator.verifyToken(authorizationHeader)) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        List<Enrollment> enrollments = enrollmentRepository.findByJobSeekerId(jobSeekerId);
        List<EnrollmentDTO> dtos = enrollments.stream()
                .map(this::convertToDTO)
                .toList();
        
        return ResponseEntity.ok(dtos);
    }

    // Get enrollments by course (for trainers to see their trainees)
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<EnrollmentDTO>> getEnrollmentsByCourse(
            @PathVariable Integer courseId,
            @RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        
        if (!jwtTokenGenerator.verifyToken(authorizationHeader)) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        List<Enrollment> enrollments = enrollmentRepository.findByCourseId(courseId);
        List<EnrollmentDTO> dtos = enrollments.stream()
                .map(this::convertToDTO)
                .toList();
        
        return ResponseEntity.ok(dtos);
    }

    // Get all enrollments for courses created by a specific trainer
    @GetMapping("/trainer/{trainerId}")
    public ResponseEntity<List<EnrollmentDTO>> getEnrollmentsByTrainer(
            @PathVariable Integer trainerId,
            @RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        
        if (!jwtTokenGenerator.verifyToken(authorizationHeader)) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        // First get all courses by this trainer
        List<Course> trainerCourses = courseRepository.findAll().stream()
                .filter(course -> course.getTrainer() != null && course.getTrainer().getId().equals(trainerId))
                .toList();

        // Then get all enrollments for these courses
        List<EnrollmentDTO> allEnrollments = trainerCourses.stream()
                .flatMap(course -> enrollmentRepository.findByCourseId(course.getId()).stream())
                .map(this::convertToDTO)
                .toList();
        
        return ResponseEntity.ok(allEnrollments);
    }
}
