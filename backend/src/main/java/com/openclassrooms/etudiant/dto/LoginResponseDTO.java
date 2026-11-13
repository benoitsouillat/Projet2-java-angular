package com.openclassrooms.etudiant.dto;

import lombok.Data;

@Data 
public class LoginResponseDTO {
    private String login;
    private String token;
    private Number code;
    private String message;
}
