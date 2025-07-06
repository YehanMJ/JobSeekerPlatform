package lk.acpt.demo.controllers;

import lk.acpt.demo.dto.EmployerDTO;
import lk.acpt.demo.entity.Employer;
import lk.acpt.demo.repositories.EmployerRepository;
import lk.acpt.demo.service.EmployerService;
import lk.acpt.demo.util.JWTTokenGenerator;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/api/employers")
public class EmployerController {
    private static EmployerRepository employerRepository;
    private final ModelMapper modelMapper;
    private final JWTTokenGenerator jwtTokenGenerator;
    private final EmployerService employerService;

    @Autowired
    public EmployerController(EmployerRepository employerRepository, ModelMapper modelMapper, lk.acpt.demo.util.JWTTokenGenerator jwtTokenGenerator, EmployerService employerService) {
        EmployerController.employerRepository = employerRepository;
        this.modelMapper = modelMapper;
        this.jwtTokenGenerator = jwtTokenGenerator;
        this.employerService = employerService;
    }

    @GetMapping
    public ResponseEntity<List<EmployerDTO>> getAll(@RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        if (jwtTokenGenerator.verifyToken(authorizationHeader)) {
            List<EmployerDTO> dtos = employerRepository.findAll().stream()
                .map(employer -> modelMapper.map(employer, EmployerDTO.class))
                .toList();
            return ResponseEntity.ok(dtos);
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmployerDTO> getById(@PathVariable Integer id, @RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        if (jwtTokenGenerator.verifyToken(authorizationHeader)) {
            return employerRepository.findById(id)
                .map(employer -> ResponseEntity.ok(modelMapper.map(employer, EmployerDTO.class)))
                .orElseGet(() -> ResponseEntity.notFound().build());
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @PostMapping
    public ResponseEntity<EmployerDTO> create(@RequestBody EmployerDTO dto, @RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        Employer employer = modelMapper.map(dto, Employer.class);
        Employer saved = employerService.createEmployer(employer);
        EmployerDTO savedDto = modelMapper.map(saved, EmployerDTO.class);
        return new ResponseEntity<>(savedDto, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmployerDTO> update(@PathVariable Integer id, @RequestBody EmployerDTO dto, @RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        if (jwtTokenGenerator.verifyToken(authorizationHeader)) {
            return employerRepository.findById(id)
                .map(employer -> {
                    modelMapper.map(dto, employer);
                    return ResponseEntity.ok(modelMapper.map(employerRepository.save(employer), EmployerDTO.class));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id, @RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        if (jwtTokenGenerator.verifyToken(authorizationHeader)) {
            if (employerRepository.existsById(id)) {
                employerRepository.deleteById(id);
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.notFound().build();
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @PostMapping("/{id}/profile-picture")
    public ResponseEntity<EmployerDTO> uploadProfilePicture(
            @PathVariable Integer id,
            @RequestParam("file") MultipartFile file,
            @RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        if (!jwtTokenGenerator.verifyToken(authorizationHeader)) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        Employer updated = employerService.uploadProfilePicture(id, file);
        EmployerDTO dto = modelMapper.map(updated, EmployerDTO.class);
        return ResponseEntity.ok(dto);
    }
}
