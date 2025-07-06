package lk.acpt.demo.controllers;

import lk.acpt.demo.dto.CourseDTO;
import lk.acpt.demo.entity.Course;
import lk.acpt.demo.repositories.CourseRepository;
import lk.acpt.demo.util.JWTTokenGenerator;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/api/courses")
public class CourseController {
    private static CourseRepository courseRepository;
    private final ModelMapper modelMapper;
    private final JWTTokenGenerator jwtTokenGenerator;

    @Autowired
    public CourseController(CourseRepository courseRepository, ModelMapper modelMapper, lk.acpt.demo.util.JWTTokenGenerator jwtTokenGenerator) {
        CourseController.courseRepository = courseRepository;
        this.modelMapper = modelMapper;
        this.jwtTokenGenerator = jwtTokenGenerator;
    }

    @GetMapping
    public ResponseEntity<List<CourseDTO>> getAll(@RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        if (jwtTokenGenerator.verifyToken(authorizationHeader)) {
            List<CourseDTO> dtos = courseRepository.findAll().stream()
                .map(course -> {
                    CourseDTO dto = new CourseDTO();
                    dto.setId(course.getId());
                    dto.setName(course.getTitle());
                    dto.setDescription(course.getDescription());
                    dto.setTrainerId(course.getTrainer() != null ? course.getTrainer().getId() : null);
                    return dto;
                })
                .toList();
            return ResponseEntity.ok(dtos);
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseDTO> getById(@PathVariable Integer id, @RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        if (jwtTokenGenerator.verifyToken(authorizationHeader)) {
            return courseRepository.findById(id)
                .map(course -> {
                    CourseDTO dto = new CourseDTO();
                    dto.setId(course.getId());
                    dto.setName(course.getTitle());
                    dto.setDescription(course.getDescription());
                    dto.setTrainerId(course.getTrainer() != null ? course.getTrainer().getId() : null);
                    return ResponseEntity.ok(dto);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @PostMapping
    public ResponseEntity<CourseDTO> create(@RequestBody CourseDTO dto, @RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        if (jwtTokenGenerator.verifyToken(authorizationHeader)) {
            Course course = modelMapper.map(dto, Course.class);
            CourseDTO saved = modelMapper.map(courseRepository.save(course), CourseDTO.class);
            return new ResponseEntity<>(saved, HttpStatus.CREATED);
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CourseDTO> update(@PathVariable Integer id, @RequestBody CourseDTO dto, @RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        if (jwtTokenGenerator.verifyToken(authorizationHeader)) {
            return courseRepository.findById(id)
                .map(course -> {
                    modelMapper.map(dto, course);
                    return ResponseEntity.ok(modelMapper.map(courseRepository.save(course), CourseDTO.class));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
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
}
