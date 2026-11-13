package com.openclassrooms.etudiant.dto.student;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateDTO {
    @NotNull
    private Long id;

    private String firstName;
    private String lastName;
    private String login;
    private String password;
}
