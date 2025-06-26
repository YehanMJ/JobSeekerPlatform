package lk.acpt.demo.controllers;

import lk.acpt.demo.dto.TrainerDTO;
import lk.acpt.demo.entity.Trainer;
import lk.acpt.demo.repositories.TrainerRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lk.acpt.demo.util.JWTTokenGenerator;

import java.util.List;

@RestController
@RequestMapping("/api/trainers")
public class TrainerController {
    private static TrainerRepository trainerRepository;
    private final ModelMapper modelMapper;
    private final JWTTokenGenerator jwtTokenGenerator;

    @Autowired
    public TrainerController(TrainerRepository trainerRepository, ModelMapper modelMapper, JWTTokenGenerator jwtTokenGenerator) {
        TrainerController.trainerRepository = trainerRepository;
        this.modelMapper = modelMapper;
        this.jwtTokenGenerator = jwtTokenGenerator;
    }

    @GetMapping
    public ResponseEntity<List<TrainerDTO>> getAll(@RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        if (jwtTokenGenerator.verifyToken(authorizationHeader)) {
            List<TrainerDTO> dtos = trainerRepository.findAll().stream()
                .map(trainer -> modelMapper.map(trainer, TrainerDTO.class))
                .toList();
            return ResponseEntity.ok(dtos);
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TrainerDTO> getById(@PathVariable Integer id, @RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        if (jwtTokenGenerator.verifyToken(authorizationHeader)) {
            return trainerRepository.findById(id)
                .map(trainer -> ResponseEntity.ok(modelMapper.map(trainer, TrainerDTO.class)))
                .orElseGet(() -> ResponseEntity.notFound().build());
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @PostMapping
    public ResponseEntity<TrainerDTO> create(@RequestBody TrainerDTO dto, @RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        if (jwtTokenGenerator.verifyToken(authorizationHeader)) {
            Trainer trainer = modelMapper.map(dto, Trainer.class);
            TrainerDTO saved = modelMapper.map(trainerRepository.save(trainer), TrainerDTO.class);
            return new ResponseEntity<>(saved, HttpStatus.CREATED);
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TrainerDTO> update(@PathVariable Integer id, @RequestBody TrainerDTO dto, @RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        if (jwtTokenGenerator.verifyToken(authorizationHeader)) {
            return trainerRepository.findById(id)
                .map(trainer -> {
                    modelMapper.map(dto, trainer);
                    return ResponseEntity.ok(modelMapper.map(trainerRepository.save(trainer), TrainerDTO.class));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id, @RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        if (jwtTokenGenerator.verifyToken(authorizationHeader)) {
            if (trainerRepository.existsById(id)) {
                trainerRepository.deleteById(id);
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.notFound().build();
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }
}
