package lk.acpt.demo.controllers;

import lk.acpt.demo.dto.JobOfferDTO;
import lk.acpt.demo.entity.JobOffer;
import lk.acpt.demo.repositories.EmployerRepository;
import lk.acpt.demo.repositories.JobOfferRepository;
import lk.acpt.demo.repositories.JobRepository;
import lk.acpt.demo.util.JWTTokenGenerator;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/job-offers")
public class JobOfferController {
    private static JobOfferRepository jobOfferRepository;
    private static EmployerRepository employerRepository;
    private static JobRepository jobRepository;
    private final ModelMapper modelMapper;
    private final JWTTokenGenerator jwtTokenGenerator;

    @Autowired
    public JobOfferController(JobOfferRepository jobOfferRepository, EmployerRepository employerRepository, JobRepository jobRepository, ModelMapper modelMapper, lk.acpt.demo.util.JWTTokenGenerator jwtTokenGenerator) {
        JobOfferController.jobOfferRepository = jobOfferRepository;
        JobOfferController.employerRepository = employerRepository;
        JobOfferController.jobRepository = jobRepository;
        this.modelMapper = modelMapper;
        this.jwtTokenGenerator = jwtTokenGenerator;
    }

    @GetMapping
    public ResponseEntity<List<JobOfferDTO>> getAll(@RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        if (jwtTokenGenerator.verifyToken(authorizationHeader)) {
            List<JobOfferDTO> dtos = jobOfferRepository.findAll().stream()
                .map(offer -> {
                    JobOfferDTO dto = modelMapper.map(offer, JobOfferDTO.class);
                    if (offer.getJob() != null) dto.setJobId(offer.getJob().getId());
                    if (offer.getEmployer() != null) dto.setEmployerId(offer.getEmployer().getId());
                    return dto;
                })
                .toList();
            return ResponseEntity.ok(dtos);
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobOfferDTO> getById(@PathVariable Integer id, @RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        if (jwtTokenGenerator.verifyToken(authorizationHeader)) {
            return jobOfferRepository.findById(id)
                .map(offer -> {
                    JobOfferDTO dto = modelMapper.map(offer, JobOfferDTO.class);
                    if (offer.getJob() != null) dto.setJobId(offer.getJob().getId());
                    if (offer.getEmployer() != null) dto.setEmployerId(offer.getEmployer().getId());
                    return ResponseEntity.ok(dto);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @PostMapping
    public ResponseEntity<JobOfferDTO> create(@RequestBody JobOfferDTO dto, @RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        if (jwtTokenGenerator.verifyToken(authorizationHeader)) {
            JobOffer offer = modelMapper.map(dto, JobOffer.class);
            if (dto.getJobId() != null) {
                offer.setJob(jobRepository.findById(dto.getJobId()).orElse(null));
            }
            JobOfferDTO saved = modelMapper.map(jobOfferRepository.save(offer), JobOfferDTO.class);
            if (offer.getJob() != null) saved.setJobId(offer.getJob().getId());
            if (offer.getEmployer() != null) saved.setEmployerId(offer.getEmployer().getId());
            return new ResponseEntity<>(saved, HttpStatus.CREATED);
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobOfferDTO> update(@PathVariable Integer id, @RequestBody JobOfferDTO dto, @RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        if (jwtTokenGenerator.verifyToken(authorizationHeader)) {
            return jobOfferRepository.findById(id)
                .map(offer -> {
                    modelMapper.map(dto, offer);
                    if (dto.getJobId() != null) {
                        offer.setJob(jobRepository.findById(dto.getJobId()).orElse(null));
                    }
                    JobOffer updated = jobOfferRepository.save(offer);
                    JobOfferDTO updatedDto = modelMapper.map(updated, JobOfferDTO.class);
                    if (updated.getJob() != null) updatedDto.setJobId(updated.getJob().getId());
                    if (updated.getEmployer() != null) updatedDto.setEmployerId(updated.getEmployer().getId());
                    return ResponseEntity.ok(updatedDto);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id, @RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        if (jwtTokenGenerator.verifyToken(authorizationHeader)) {
            if (jobOfferRepository.existsById(id)) {
                jobOfferRepository.deleteById(id);
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.notFound().build();
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }
}
