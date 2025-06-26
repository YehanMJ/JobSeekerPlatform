package lk.acpt.demo.controllers;

import lk.acpt.demo.dto.JobSeekerDTO;
import lk.acpt.demo.entity.JobSeeker;
import lk.acpt.demo.repositories.JobSeekerRepository;
import lk.acpt.demo.util.JWTTokenGenerator;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/job-seekers")
public class JobSeekerController {
    private static JobSeekerRepository jobSeekerRepository;
    private final ModelMapper modelMapper;
    private final JWTTokenGenerator jwtTokenGenerator;

    @Autowired
    public JobSeekerController(JobSeekerRepository jobSeekerRepository, ModelMapper modelMapper, lk.acpt.demo.util.JWTTokenGenerator jwtTokenGenerator) {
        JobSeekerController.jobSeekerRepository = jobSeekerRepository;
        this.modelMapper = modelMapper;
        this.jwtTokenGenerator = jwtTokenGenerator;
    }

    @GetMapping
    public ResponseEntity<List<JobSeekerDTO>> getAll(@RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        if (jwtTokenGenerator.verifyToken(authorizationHeader)) {
            List<JobSeekerDTO> dtos = jobSeekerRepository.findAll().stream()
                .map(seeker -> modelMapper.map(seeker, JobSeekerDTO.class))
                .toList();
            return ResponseEntity.ok(dtos);
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobSeekerDTO> getById(@PathVariable Integer id, @RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        if (jwtTokenGenerator.verifyToken(authorizationHeader)) {
            return jobSeekerRepository.findById(id)
                .map(seeker -> ResponseEntity.ok(modelMapper.map(seeker, JobSeekerDTO.class)))
                .orElseGet(() -> ResponseEntity.notFound().build());
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @PostMapping
    public ResponseEntity<JobSeekerDTO> create(@RequestBody JobSeekerDTO dto, @RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        if (jwtTokenGenerator.verifyToken(authorizationHeader)) {
            JobSeeker seeker = modelMapper.map(dto, JobSeeker.class);
            JobSeekerDTO saved = modelMapper.map(jobSeekerRepository.save(seeker), JobSeekerDTO.class);
            return new ResponseEntity<>(saved, HttpStatus.CREATED);
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobSeekerDTO> update(@PathVariable Integer id, @RequestBody JobSeekerDTO dto, @RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        if (jwtTokenGenerator.verifyToken(authorizationHeader)) {
            return jobSeekerRepository.findById(id)
                .map(seeker -> {
                    modelMapper.map(dto, seeker);
                    return ResponseEntity.ok(modelMapper.map(jobSeekerRepository.save(seeker), JobSeekerDTO.class));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id, @RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        if (jwtTokenGenerator.verifyToken(authorizationHeader)) {
            if (jobSeekerRepository.existsById(id)) {
                jobSeekerRepository.deleteById(id);
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.notFound().build();
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }
}
