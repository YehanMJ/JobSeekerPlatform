package lk.acpt.demo.controllers;

import lk.acpt.demo.entity.User;
import lk.acpt.demo.service.UserService;
import lk.acpt.demo.dto.UserRegisterDTO;
import lk.acpt.demo.dto.UserLoginDTO;
import lk.acpt.demo.dto.UserRegisterResponseDTO;
import lk.acpt.demo.dto.UserLoginResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {
    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<UserRegisterResponseDTO> register(@RequestBody UserRegisterDTO userRegisterDTO) {
        User user = new User();
        user.setUsername(userRegisterDTO.getUsername());
        user.setEmail(userRegisterDTO.getEmail());
        user.setPassword(userRegisterDTO.getPassword());
        user.setRole(userRegisterDTO.getRole());
        User registeredUser = userService.register(user);
        UserRegisterResponseDTO response = new UserRegisterResponseDTO();
        response.setId(registeredUser.getId());
        response.setEmail(registeredUser.getEmail());
        response.setStatus(registeredUser.getId() != null ? "registered" : "not registered");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<UserLoginResponseDTO> login(@RequestBody UserLoginDTO userLoginDTO) {
        String token = userService.login(userLoginDTO.getUsername(), userLoginDTO.getPassword());
        if (token != null) {
            UserLoginResponseDTO response = new UserLoginResponseDTO();
            response.setUsername(userLoginDTO.getUsername());
            response.setToken(token);
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(401).body(null);
        }
    }
}
