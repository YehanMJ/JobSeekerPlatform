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
import org.springframework.web.multipart.MultipartFile;
import lk.acpt.demo.service.JobSeekerService;

import java.util.List;
@CrossOrigin
@RestController
@RequestMapping("/api/job-seekers")
public class JobSeekerController {
    private static JobSeekerRepository jobSeekerRepository;
    private final ModelMapper modelMapper;
    private final JWTTokenGenerator jwtTokenGenerator;
    private final JobSeekerService jobSeekerService;

    @Autowired
    public JobSeekerController(JobSeekerRepository jobSeekerRepository, ModelMapper modelMapper, lk.acpt.demo.util.JWTTokenGenerator jwtTokenGenerator, JobSeekerService jobSeekerService) {
        JobSeekerController.jobSeekerRepository = jobSeekerRepository;
        this.modelMapper = modelMapper;
        this.jwtTokenGenerator = jwtTokenGenerator;
        this.jobSeekerService = jobSeekerService;
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

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<JobSeekerDTO> create(
            @RequestPart("jobSeeker") JobSeekerDTO dto,
            @RequestPart("file") MultipartFile file,
            @RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        // Registration should not require JWT
        JobSeeker seeker = modelMapper.map(dto, JobSeeker.class);
        // Ensure username is set before saving
        if (dto.getUsername() != null) {
            seeker.setUsername(dto.getUsername());
        }
        JobSeeker saved = jobSeekerService.createJobSeeker(seeker, file);
        JobSeekerDTO savedDto = modelMapper.map(saved, JobSeekerDTO.class);
        return new ResponseEntity<>(savedDto, HttpStatus.CREATED);
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

    @PostMapping("/{id}/upload-cv")
    public ResponseEntity<?> uploadCv(@PathVariable Integer id, @RequestParam("file") MultipartFile file, @RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        if (!jwtTokenGenerator.verifyToken(authorizationHeader)) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        try {
            JobSeeker updated = jobSeekerService.uploadCv(id, file);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/{id}/profile-picture")
    public ResponseEntity<JobSeekerDTO> uploadProfilePicture(
            @PathVariable Integer id,
            @RequestParam("file") MultipartFile file,
            @RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        if (!jwtTokenGenerator.verifyToken(authorizationHeader)) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        JobSeeker updated = jobSeekerService.uploadProfilePicture(id, file);
        JobSeekerDTO dto = modelMapper.map(updated, JobSeekerDTO.class);
        return ResponseEntity.ok(dto);
    }
}
