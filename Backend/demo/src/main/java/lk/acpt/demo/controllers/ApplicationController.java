package lk.acpt.demo.controllers;

import lk.acpt.demo.dto.ApplicationDTO;
import lk.acpt.demo.entity.Application;
import lk.acpt.demo.repositories.ApplicationRepository;
import lk.acpt.demo.util.JWTTokenGenerator;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/applications")
public class ApplicationController {

    private static ApplicationRepository applicationRepository;
    private final ModelMapper modelMapper;
    private final JWTTokenGenerator jwtTokenGenerator;

    @Autowired
    public ApplicationController(ApplicationRepository applicationRepository, ModelMapper modelMapper, JWTTokenGenerator jwtTokenGenerator) {
        ApplicationController.applicationRepository = applicationRepository;
        this.modelMapper = modelMapper;
        this.jwtTokenGenerator = jwtTokenGenerator;
    }

    @GetMapping
    public ResponseEntity<List<ApplicationDTO>> getAll(@RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        if (jwtTokenGenerator.verifyToken(authorizationHeader)) {
            List<ApplicationDTO> dtos = applicationRepository.findAll().stream()
                .map(app -> modelMapper.map(app, ApplicationDTO.class))
                .toList();
            return ResponseEntity.ok(dtos);
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApplicationDTO> getById(@PathVariable Integer id, @RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        if (jwtTokenGenerator.verifyToken(authorizationHeader)) {
            return applicationRepository.findById(id)
                .map(app -> ResponseEntity.ok(modelMapper.map(app, ApplicationDTO.class)))
                .orElseGet(() -> ResponseEntity.notFound().build());
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @PostMapping
    public ResponseEntity<ApplicationDTO> create(@RequestBody ApplicationDTO dto, @RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        if (jwtTokenGenerator.verifyToken(authorizationHeader)) {
            Application app = modelMapper.map(dto, Application.class);
            ApplicationDTO saved = modelMapper.map(applicationRepository.save(app), ApplicationDTO.class);
            return new ResponseEntity<>(saved, HttpStatus.CREATED);
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApplicationDTO> update(@PathVariable Integer id, @RequestBody ApplicationDTO dto, @RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        if (jwtTokenGenerator.verifyToken(authorizationHeader)) {
            return applicationRepository.findById(id)
                .map(app -> {
                    modelMapper.map(dto, app);
                    return ResponseEntity.ok(modelMapper.map(applicationRepository.save(app), ApplicationDTO.class));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id, @RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        if (jwtTokenGenerator.verifyToken(authorizationHeader)) {
            if (applicationRepository.existsById(id)) {
                applicationRepository.deleteById(id);
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.notFound().build();
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }
}
