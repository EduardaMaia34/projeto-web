package com.br.edu.ufersa.pw.projeto.biblioteca.API.dto;

import com.br.edu.ufersa.pw.projeto.user.Model.entity.Estado;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class InputBibliotecaDTO {

    @NotBlank(message = "O ID do filme não pode estar vazio.")
    @Size(max = 50, message = "O ID do filme é muito longo.")
    private String livroId;
    private Estado status;
    // Construtor padrão
    public InputBibliotecaDTO() {}

    // Construtor com todos os campos
    public InputBibliotecaDTO(String livroId, Estado status) {
        this.livroId = livroId;
        this.status = status;
    }

    // Getters e Setters
    public String getLivroId() {
        return livroId;
    }

    public void setLivroId(String livroId) {
        this.livroId = livroId;
    }

    public Estado getStatus() {
        return status;
    }
    public void setStatus(Estado status) {
        this.status = status;
    }
}