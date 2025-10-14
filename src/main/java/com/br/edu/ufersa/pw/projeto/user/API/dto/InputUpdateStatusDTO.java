package com.br.edu.ufersa.pw.projeto.user.API.dto;

import com.br.edu.ufersa.pw.projeto.user.Model.entity.Estado;
import jakarta.validation.constraints.NotNull;

public class InputUpdateStatusDTO {

    @NotNull(message = "O campo 'status' é obrigatório.")
    private Estado status;

    // Construtor, Getters e Setters

    public Estado getStatus() {
        return status;
    }

    public void setStatus(Estado status) {
        this.status = status;
    }
}