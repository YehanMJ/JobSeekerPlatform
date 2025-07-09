package lk.acpt.demo.controllers;

import lk.acpt.demo.dto.CourseDTO;
import lk.acpt.demo.entity.Course;
import lk.acpt.demo.entity.CourseModule;
import lk.acpt.demo.entity.Trainer;
import lk.acpt.demo.repositories.CourseRepository;
import lk.acpt.demo.repositories.TrainerRepository;
import lk.acpt.demo.util.JWTTokenGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@CrossOrigin
@RestController
@RequestMapping("/api/courses")
public class CourseController {
    private final CourseRepository courseRepository;
    private final TrainerRepository trainerRepository;
    private final JWTTokenGenerator jwtTokenGenerator;

    @Autowired
    public CourseController(CourseRepository courseRepository, TrainerRepository trainerRepository, 
                           JWTTokenGenerator jwtTokenGenerator) {
        this.courseRepository = courseRepository;
        this.trainerRepository = trainerRepository;
        this.jwtTokenGenerator = jwtTokenGenerator;
    }

    @GetMapping
    public ResponseEntity<List<CourseDTO>> getAll(@RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        if (jwtTokenGenerator.verifyToken(authorizationHeader)) {
            List<CourseDTO> dtos = courseRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseDTO> getById(@PathVariable Integer id, @RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        if (jwtTokenGenerator.verifyToken(authorizationHeader)) {
            return courseRepository.findById(id)
                .map(course -> ResponseEntity.ok(convertToDTO(course)))
                .orElseGet(() -> ResponseEntity.notFound().build());
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @PostMapping
    public ResponseEntity<CourseDTO> create(@RequestBody CourseDTO dto, @RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        if (jwtTokenGenerator.verifyToken(authorizationHeader)) {
            try {
                Course course = convertToEntity(dto);
                Course saved = courseRepository.save(course);
                return new ResponseEntity<>(convertToDTO(saved), HttpStatus.CREATED);
            } catch (Exception e) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CourseDTO> update(@PathVariable Integer id, @RequestBody CourseDTO dto, @RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        if (jwtTokenGenerator.verifyToken(authorizationHeader)) {
            Optional<Course> existingCourse = courseRepository.findById(id);
            if (existingCourse.isPresent()) {
                try {
                    Course course = convertToEntity(dto);
                    course.setId(id);
                    Course updated = courseRepository.save(course);
                    return ResponseEntity.ok(convertToDTO(updated));
                } catch (Exception e) {
                    return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
                }
            }
            return ResponseEntity.notFound().build();
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id, @RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        if (jwtTokenGenerator.verifyToken(authorizationHeader)) {
            if (courseRepository.existsById(id)) {
                courseRepository.deleteById(id);
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.notFound().build();
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    private CourseDTO convertToDTO(Course course) {
        CourseDTO dto = new CourseDTO();
        dto.setId(course.getId());
        dto.setTitle(course.getTitle());
        dto.setDescription(course.getDescription());
        dto.setDuration(course.getDuration());
        dto.setLevel(course.getLevel());
        dto.setCategory(course.getCategory());
        dto.setPrerequisites(course.getPrerequisites());
        dto.setCreatedAt(course.getCreatedAt());
        dto.setTrainerId(course.getTrainer() != null ? course.getTrainer().getId() : null);
        
        if (course.getModules() != null) {
            dto.setModules(course.getModules().stream()
                .map(module -> {
                    CourseDTO.CourseModuleDTO moduleDTO = new CourseDTO.CourseModuleDTO();
                    moduleDTO.setId(module.getId());
                    moduleDTO.setTitle(module.getTitle());
                    moduleDTO.setDescription(module.getDescription());
                    moduleDTO.setDuration(module.getDuration());
                    return moduleDTO;
                })
                .collect(Collectors.toList()));
        }
        
        return dto;
    }

    private Course convertToEntity(CourseDTO dto) {
        Course course = new Course();
        course.setTitle(dto.getTitle());
        course.setDescription(dto.getDescription());
        course.setDuration(dto.getDuration());
        course.setLevel(dto.getLevel());
        course.setCategory(dto.getCategory());
        course.setPrerequisites(dto.getPrerequisites());
        course.setCreatedAt(dto.getCreatedAt());
        
        if (dto.getTrainerId() != null) {
            Optional<Trainer> trainer = trainerRepository.findById(dto.getTrainerId());
            trainer.ifPresent(course::setTrainer);
        }
        
        if (dto.getModules() != null) {
            List<CourseModule> modules = dto.getModules().stream()
                .map(moduleDTO -> {
                    CourseModule module = new CourseModule();
                    module.setTitle(moduleDTO.getTitle());
                    module.setDescription(moduleDTO.getDescription());
                    module.setDuration(moduleDTO.getDuration());
                    module.setCourse(course);
                    return module;
                })
                .collect(Collectors.toList());
            course.setModules(modules);
        }
        
        return course;
    }
}
