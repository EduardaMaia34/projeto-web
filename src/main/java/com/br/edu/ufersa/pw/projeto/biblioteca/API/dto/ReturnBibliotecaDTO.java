package com.br.edu.ufersa.pw.projeto.biblioteca.API.dto;

import com.br.edu.ufersa.pw.projeto.biblioteca.Model.entity.Biblioteca;
import com.br.edu.ufersa.pw.projeto.user.Model.entity.Estado;
import com.br.edu.ufersa.pw.projeto.livro.API.dto.ReturnLivroDTO;

import java.time.LocalDateTime;

public class ReturnBibliotecaDTO {

    private Long id;
    private Long userId;
    private String livroId;
    private LocalDateTime addedAt;
    private Estado status;
    private ReturnLivroDTO livro;
    private Double nota;

    public ReturnBibliotecaDTO() {}

    public ReturnBibliotecaDTO(Biblioteca biblioteca) {
        this.id = biblioteca.getId();
        this.userId = biblioteca.getUser().getId();
        this.livroId = biblioteca.getLivroId();
        this.addedAt = biblioteca.getAddedAt();
        this.status = biblioteca.getStatus();

    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getLivroId() { return livroId; }
    public void setLivroId(String livroId) { this.livroId = livroId; }
    public LocalDateTime getAddedAt() { return addedAt; }
    public void setAddedAt(LocalDateTime addedAt) { this.addedAt = addedAt; }
    public Estado getStatus() { return status; }
    public void setStatus(Estado status) { this.status = status; }

    public ReturnLivroDTO getLivro() { return livro; }
    public void setLivro(ReturnLivroDTO livro) { this.livro = livro; }

    public Double getNota() { return nota; }
    public void setNota(Double nota) { this.nota = nota; }
}