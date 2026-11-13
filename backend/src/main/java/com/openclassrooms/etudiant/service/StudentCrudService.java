package com.openclassrooms.etudiant.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.openclassrooms.etudiant.dto.student.CreateDTO;
import com.openclassrooms.etudiant.dto.student.UpdateDTO;
import com.openclassrooms.etudiant.dto.student.DeleteDTO;

import com.openclassrooms.etudiant.entities.User;
import com.openclassrooms.etudiant.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StudentCrudService {
    private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
    public User create(CreateDTO createDTO) {
        if (this.verifyExistingUser(createDTO.getLogin())) {
            throw new IllegalArgumentException("User with login " + createDTO.getLogin() + " already exists");
        }
        try {
            User user = new User();
            user.setLogin(createDTO.getLogin());
            user.setFirstName(createDTO.getFirstName());
            user.setLastName(createDTO.getLastName());
            user.setPassword("PASSWORDHAVETOBECHANGED");
            return userRepository.save(user);
        } catch (Exception e) {
            throw new RuntimeException("Error creating user: " + e.getMessage(), e);
        }
    }

	public User update(UpdateDTO updateDTO) {
		try {
			User user = userRepository.getReferenceById(updateDTO.getId());
					//.orElseThrow(() -> new IllegalArgumentException("User with id " + updateDTO.getId() + " not found"));
			user.setFirstName(updateDTO.getFirstName() != null ? updateDTO.getFirstName() : user.getFirstName());
			user.setLastName(updateDTO.getLastName() != null ? updateDTO.getLastName() : user.getLastName());
			user.setPassword(updateDTO.getPassword() != null ? passwordEncoder.encode(updateDTO.getPassword()) : user.getPassword());

			return userRepository.save(user);
		} catch (Exception e) {
			throw new RuntimeException("Error updating user ... : " + e.getMessage(), e);
		}
	}

	public boolean delete(DeleteDTO deleteDTO) {
		try {
			User user = userRepository.getReferenceById(deleteDTO.getId());
					//.orElseThrow(() -> new IllegalArgumentException("User with id " + deleteDTO.getId() + " not found"));
			userRepository.delete(user);
			return true;
		} catch (Exception e) {
			throw new RuntimeException("Error deleting user: " + e.getMessage(), e);
		}
	}

    private boolean verifyExistingUser(String login) {
        return userRepository.findByLogin(login).isPresent();
    }

}
