package com.br.edu.ufersa.pw.projeto.biblioteca.API.dto;

import com.br.edu.ufersa.pw.projeto.biblioteca.Model.entity.Biblioteca;
import java.time.LocalDateTime;

public class ReturnBibliotecaDTO {

    private Long id;
    private Long userId; // ID do Usuário
    private String filmId;
    private LocalDateTime addedAt;

    // Construtor padrão
    public ReturnBibliotecaDTO() {}

    // Construtor baseado na Entidade Biblioteca (ideal para a camada Service)
    public ReturnBibliotecaDTO(Biblioteca biblioteca) {
        this.id = biblioteca.getId();
        // Garantindo que o user_id seja carregado. O campo 'user' na Entity é LAZY.
        this.userId = biblioteca.getUser().getId();
        this.filmId = biblioteca.getFilmId();
        this.addedAt = biblioteca.getAddedAt();
    }

    // Getters e Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getFilmId() {
        return filmId;
    }

    public void setFilmId(String filmId) {
        this.filmId = filmId;
    }

    public LocalDateTime getAddedAt() {
        return addedAt;
    }

    public void setAddedAt(LocalDateTime addedAt) {
        this.addedAt = addedAt;
    }
}