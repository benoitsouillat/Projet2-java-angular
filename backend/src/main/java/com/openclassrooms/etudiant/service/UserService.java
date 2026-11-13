package com.openclassrooms.etudiant.service;

import com.openclassrooms.etudiant.dto.LoginResponseDTO;
import com.openclassrooms.etudiant.dto.user.UserDTO;
import com.openclassrooms.etudiant.entities.User;
import com.openclassrooms.etudiant.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public void register(User user) {
        Assert.notNull(user, "User must not be null");
        log.info("Registering new user");

        Optional<User> optionalUser = userRepository.findByLogin(user.getLogin());
        if (optionalUser.isPresent()) {
            throw new IllegalArgumentException("User with login " + user.getLogin() + " already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
    }

    public LoginResponseDTO login(String login, String password) {
        Assert.notNull(login, "Login must not be null");
        Assert.notNull(password, "Password must not be null");
        Optional<User> user = userRepository.findByLogin(login);
        if (!user.isPresent()) {
            return this.createResponse(login, null, 404, "User not found");
        }
        try {
			UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
					.username(user.get().getLogin())
					.password(user.get().getPassword())
					.build();

			if (this.passwordVerify(password, userDetails)) {
				String token = jwtService.generateToken(userDetails);
				return this.createResponse(login, token, 200, password);
			}
			else {
				return this.createResponse(login, null, 401, "Invalid password");
			}
		}
		catch (Exception e) {
			log.error("Error during login: {}", e.getMessage());
			return this.createResponse(login, null, 500, "Internal server error");
		}
    }

    private boolean passwordVerify(String password, UserDetails userDetails) {
        return passwordEncoder.matches(password, userDetails.getPassword());
    }

    private LoginResponseDTO createResponse(String login, String token, Number code, String message) {
        LoginResponseDTO responseDTO = new LoginResponseDTO();
        responseDTO.setLogin(login);
        responseDTO.setToken(token);
        responseDTO.setCode(code);
        responseDTO.setMessage(message);

        return responseDTO;
    }

    public boolean isAuthenticated(String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            return false;
        }
        return jwtService.validateToken(token.substring(7));
    }

	public UserDTO getCurrentUserInfo(String token) {
		if (token == null || !token.startsWith("Bearer ")) {
			return null;
		}
		String login = jwtService.extractUsername(token.substring(7));
		Optional<User> userOptional = userRepository.findByLogin(login);
		if (userOptional.isPresent()) {
			User user = userOptional.get();
			UserDTO userDTO = new UserDTO();
			userDTO.setId(user.getId());
			userDTO.setFirstName(user.getFirstName());
			userDTO.setLastName(user.getLastName());
			userDTO.setLogin(user.getLogin());
			userDTO.setCreatedAt(user.getCreated_at());
			userDTO.setUpdatedAt(user.getUpdated_at());
			return userDTO;
		}
		return null;
	}

	public UserDTO getUserById(Long id) {
		Optional<User> userOptional = userRepository.findById(id);
		if (userOptional.isPresent()) {
			User user = userOptional.get();
			UserDTO userDTO = new UserDTO();
			userDTO.setId(user.getId());
			userDTO.setFirstName(user.getFirstName());
			userDTO.setLastName(user.getLastName());
			userDTO.setLogin(user.getLogin());
			userDTO.setCreatedAt(user.getCreated_at());
			userDTO.setUpdatedAt(user.getUpdated_at());
			return userDTO;
		}
		return null;
	}

	public List<UserDTO> getAllUsers() {
		return userRepository.findAll().stream().map(user -> {
			UserDTO userDTO = new UserDTO();
			userDTO.setId(user.getId());
			userDTO.setFirstName(user.getFirstName());
			userDTO.setLastName(user.getLastName());
			userDTO.setLogin(user.getLogin());
			userDTO.setCreatedAt(user.getCreated_at());
			userDTO.setUpdatedAt(user.getUpdated_at());
			return userDTO;
		}).collect(Collectors.toList());
	}
}
