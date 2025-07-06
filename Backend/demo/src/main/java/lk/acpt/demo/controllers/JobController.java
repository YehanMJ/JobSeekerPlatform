package lk.acpt.demo.controllers;

import lk.acpt.demo.dto.JobDTO;
import lk.acpt.demo.entity.Job;
import lk.acpt.demo.repositories.JobRepository;
import lk.acpt.demo.util.JWTTokenGenerator;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/api/jobs")
public class JobController {
    private static JobRepository jobRepository;
    private final ModelMapper modelMapper;
    private final JWTTokenGenerator jwtTokenGenerator;

    @Autowired
    public JobController(JobRepository jobRepository, ModelMapper modelMapper, lk.acpt.demo.util.JWTTokenGenerator jwtTokenGenerator) {
        JobController.jobRepository = jobRepository;
        this.modelMapper = modelMapper;
        this.jwtTokenGenerator = jwtTokenGenerator;
    }

    @GetMapping
    public ResponseEntity<List<JobDTO>> getAll(@RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        if (jwtTokenGenerator.verifyToken(authorizationHeader)) {
            List<JobDTO> dtos = jobRepository.findAll().stream()
                .map(job -> modelMapper.map(job, JobDTO.class))
                .toList();
            return ResponseEntity.ok(dtos);
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobDTO> getById(@PathVariable Integer id, @RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        if (jwtTokenGenerator.verifyToken(authorizationHeader)) {
            return jobRepository.findById(id)
                .map(job -> ResponseEntity.ok(modelMapper.map(job, JobDTO.class)))
                .orElseGet(() -> ResponseEntity.notFound().build());
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @PostMapping
    public ResponseEntity<JobDTO> create(@RequestBody JobDTO dto, @RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        if (jwtTokenGenerator.verifyToken(authorizationHeader)) {
            Job job = modelMapper.map(dto, Job.class);
            JobDTO saved = modelMapper.map(jobRepository.save(job), JobDTO.class);
            return new ResponseEntity<>(saved, HttpStatus.CREATED);
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobDTO> update(@PathVariable Integer id, @RequestBody JobDTO dto, @RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        if (jwtTokenGenerator.verifyToken(authorizationHeader)) {
            return jobRepository.findById(id)
                .map(job -> {
                    modelMapper.map(dto, job);
                    return ResponseEntity.ok(modelMapper.map(jobRepository.save(job), JobDTO.class));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id, @RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        if (jwtTokenGenerator.verifyToken(authorizationHeader)) {
            if (jobRepository.existsById(id)) {
                jobRepository.deleteById(id);
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.notFound().build();
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }
}
