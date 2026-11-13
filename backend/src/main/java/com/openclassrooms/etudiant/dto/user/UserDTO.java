package com.openclassrooms.etudiant.dto.user;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserDTO {
    @NotNull
    private Long id;

    private String firstName;
    private String lastName;
    private String login;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
}
