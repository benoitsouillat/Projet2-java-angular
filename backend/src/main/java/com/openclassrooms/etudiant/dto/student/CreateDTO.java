package com.openclassrooms.etudiant.dto.student;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data 
public class CreateDTO {
    @NotBlank 
    private String firstName;

    @NotBlank 
    private String lastName;

    @NotBlank 
    private String login;
}
