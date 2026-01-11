package lk.acpt.demo.controllers;

import lk.acpt.demo.dto.ApplicationDTO;
import lk.acpt.demo.entity.Application;
import lk.acpt.demo.entity.Job;
import lk.acpt.demo.entity.JobSeeker;
import lk.acpt.demo.repositories.ApplicationRepository;
import lk.acpt.demo.repositories.JobRepository;
import lk.acpt.demo.repositories.JobSeekerRepository;
import lk.acpt.demo.service.ApplicationService;
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
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationService applicationService;
    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final JobSeekerRepository jobSeekerRepository;
    private final ModelMapper modelMapper;
    private final JWTTokenGenerator jwtTokenGenerator;

    @Autowired
    public ApplicationController(ApplicationService applicationService, ApplicationRepository applicationRepository, 
                                JobRepository jobRepository, JobSeekerRepository jobSeekerRepository,
                                ModelMapper modelMapper, JWTTokenGenerator jwtTokenGenerator) {
        this.applicationService = applicationService;
        this.applicationRepository = applicationRepository;
        this.jobRepository = jobRepository;
        this.jobSeekerRepository = jobSeekerRepository;
        this.modelMapper = modelMapper;
        this.jwtTokenGenerator = jwtTokenGenerator;
    }

    @GetMapping
    public ResponseEntity<List<ApplicationDTO>> getAll(@RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        if (jwtTokenGenerator.verifyToken(authorizationHeader)) {
            List<ApplicationDTO> dtos = applicationService.getAllApplications().stream()
                .map(app -> modelMapper.map(app, ApplicationDTO.class))
                .toList();
            return ResponseEntity.ok(dtos);
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApplicationDTO> getById(@PathVariable Integer id, @RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        if (jwtTokenGenerator.verifyToken(authorizationHeader)) {
            try {
                Application app = applicationService.getApplicationById(id);
                return ResponseEntity.ok(modelMapper.map(app, ApplicationDTO.class));
            } catch (RuntimeException e) {
                return ResponseEntity.notFound().build();
            }
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @PostMapping
    public ResponseEntity<ApplicationDTO> create(@RequestBody ApplicationDTO dto, @RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        if (jwtTokenGenerator.verifyToken(authorizationHeader)) {
            try {
                // Find the Job and JobSeeker entities
                Optional<Job> job = jobRepository.findById(dto.getJobId());
                Optional<JobSeeker> jobSeeker = jobSeekerRepository.findById(dto.getJobSeekerId());
                
                if (job.isEmpty() || jobSeeker.isEmpty()) {
                    return ResponseEntity.badRequest().build();
                }
                
                // Create the Application entity
                Application app = new Application();
                app.setJob(job.get());
                app.setJobSeeker(jobSeeker.get());
                app.setStatus(dto.getStatus() != null ? dto.getStatus() : "PENDING");
                
                // Save the application
                Application savedApp = applicationService.createApplication(app);
                ApplicationDTO savedDto = modelMapper.map(savedApp, ApplicationDTO.class);
                
                return new ResponseEntity<>(savedDto, HttpStatus.CREATED);
            } catch (Exception e) {
                return ResponseEntity.badRequest().build();
            }
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApplicationDTO> update(@PathVariable Integer id, @RequestBody ApplicationDTO dto, @RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        if (jwtTokenGenerator.verifyToken(authorizationHeader)) {
            try {
                // Find the existing application
                Application existingApp = applicationService.getApplicationById(id);
                
                // Update the status (the most common update for applications)
                if (dto.getStatus() != null) {
                    existingApp.setStatus(dto.getStatus());
                }
                
                // If jobId or jobSeekerId is provided, update the relationships
                if (dto.getJobId() != null) {
                    Optional<Job> job = jobRepository.findById(dto.getJobId());
                    if (job.isPresent()) {
                        existingApp.setJob(job.get());
                    }
                }
                
                if (dto.getJobSeekerId() != null) {
                    Optional<JobSeeker> jobSeeker = jobSeekerRepository.findById(dto.getJobSeekerId());
                    if (jobSeeker.isPresent()) {
                        existingApp.setJobSeeker(jobSeeker.get());
                    }
                }
                
                Application updatedApp = applicationService.updateApplication(id, existingApp);
                ApplicationDTO updatedDto = modelMapper.map(updatedApp, ApplicationDTO.class);
                
                return ResponseEntity.ok(updatedDto);
            } catch (RuntimeException e) {
                return ResponseEntity.notFound().build();
            }
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id, @RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        if (jwtTokenGenerator.verifyToken(authorizationHeader)) {
            try {
                applicationService.deleteApplication(id);
                return ResponseEntity.noContent().build();
            } catch (RuntimeException e) {
                return ResponseEntity.notFound().build();
            }
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }
    
    @GetMapping("/jobseeker/{jobSeekerId}")
    public ResponseEntity<List<ApplicationDTO>> getByJobSeeker(@PathVariable Integer jobSeekerId, @RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        if (jwtTokenGenerator.verifyToken(authorizationHeader)) {
            List<ApplicationDTO> dtos = applicationRepository.findByJobSeeker_Id(jobSeekerId).stream()
                .map(app -> modelMapper.map(app, ApplicationDTO.class))
                .toList();
            return ResponseEntity.ok(dtos);
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }
}
