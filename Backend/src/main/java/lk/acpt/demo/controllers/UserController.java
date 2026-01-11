package lk.acpt.demo.controllers;

import lk.acpt.demo.entity.User;
import lk.acpt.demo.service.UserService;
import lk.acpt.demo.dto.UserRegisterDTO;
import lk.acpt.demo.dto.UserLoginDTO;
import lk.acpt.demo.dto.UserRegisterResponseDTO;
import lk.acpt.demo.dto.UserLoginResponseDTO;
import lk.acpt.demo.util.JWTTokenGenerator;
import lk.acpt.demo.repositories.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.modelmapper.ModelMapper;
import lk.acpt.demo.dto.UserDetailsDTO;
@CrossOrigin
@RestController
@RequestMapping("/api/user")
public class UserController {
    @Autowired
    private UserService userService;

    @Autowired
    private JWTTokenGenerator jwtTokenGenerator;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private ModelMapper modelMapper;

    @PostMapping("/register")
    public ResponseEntity<UserRegisterResponseDTO> register(@RequestBody UserRegisterDTO userRegisterDTO) {
        User user = modelMapper.map(userRegisterDTO, User.class);
        User registeredUser = userService.register(user);
        UserRegisterResponseDTO response = modelMapper.map(registeredUser, UserRegisterResponseDTO.class);
        response.setStatus(registeredUser.getId() != null ? "registered" : "not registered");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<UserLoginResponseDTO> login(@RequestBody UserLoginDTO userLoginDTO) {
        String token = userService.login(userLoginDTO.getUsername(), userLoginDTO.getPassword());
        if (token != null) {
            User user = userService.getUserByUsername(userLoginDTO.getUsername());
            UserLoginResponseDTO response = modelMapper.map(user, UserLoginResponseDTO.class);
            response.setToken(token);
            response.setRole(user.getRole()); // Ensure role is set
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(401).body(null);
        }
    }

    @GetMapping("/all")
    public ResponseEntity<Iterable<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/userauth")
    public ResponseEntity<UserDetailsDTO> userAuth(@RequestHeader("Authorization") String jwtToken, @RequestParam Integer id) {
        boolean isValid = jwtTokenGenerator.verifyToken(jwtToken);
        if (!isValid) {
            return ResponseEntity.status(401).body(null);
        }
        User user = userRepo.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        UserDetailsDTO userDto = modelMapper.map(user, UserDetailsDTO.class);
        return ResponseEntity.ok(userDto);
    }
}
