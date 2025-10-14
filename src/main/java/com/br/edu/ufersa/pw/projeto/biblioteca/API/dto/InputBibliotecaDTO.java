package com.br.edu.ufersa.pw.projeto.biblioteca.API.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class InputBibliotecaDTO {

    @NotBlank(message = "O ID do filme não pode estar vazio.")
    @Size(max = 50, message = "O ID do filme é muito longo.")
    private String filmId;

    // Construtor padrão
    public InputBibliotecaDTO() {}

    // Construtor com todos os campos
    public InputBibliotecaDTO(String filmId) {
        this.filmId = filmId;
    }

    // Getters e Setters
    public String getFilmId() {
        return filmId;
    }

    public void setFilmId(String filmId) {
        this.filmId = filmId;
    }
}