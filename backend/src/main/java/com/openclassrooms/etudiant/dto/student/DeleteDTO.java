package com.openclassrooms.etudiant.dto.student;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DeleteDTO {
    @NotNull
    private Long id;


}
