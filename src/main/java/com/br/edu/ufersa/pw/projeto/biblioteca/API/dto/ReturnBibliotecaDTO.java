package com.br.edu.ufersa.pw.projeto.biblioteca.API.dto;

import com.br.edu.ufersa.pw.projeto.biblioteca.Model.entity.Biblioteca;
import com.br.edu.ufersa.pw.projeto.user.Model.entity.Estado;

import java.time.LocalDateTime;

public class ReturnBibliotecaDTO {

    private Long id;
    private Long userId; // ID do Usuário
    private String livroId;
    private LocalDateTime addedAt;
    private Estado status;

    // Construtor padrão
    public ReturnBibliotecaDTO() {}

    // Construtor baseado na Entidade Biblioteca (ideal para a camada Service)
    public ReturnBibliotecaDTO(Biblioteca biblioteca) {
        this.id = biblioteca.getId();
        this.userId = biblioteca.getUser().getId();
        this.livroId = biblioteca.getLivroId();
        this.addedAt = biblioteca.getAddedAt();
        this.status = biblioteca.getStatus();
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

    public String getLivroId() {
        return livroId;
    }

    public void setLivroId(String livroId) {
        this.livroId = livroId;
    }

    public LocalDateTime getAddedAt() {
        return addedAt;
    }

    public void setAddedAt(LocalDateTime addedAt) {
        this.addedAt = addedAt;
    }
    public Estado getStatus() { return status; }
    public void setStatus(Estado status) { this.status = status; }
}