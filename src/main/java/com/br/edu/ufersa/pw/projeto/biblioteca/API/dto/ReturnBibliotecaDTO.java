package com.br.edu.ufersa.pw.projeto.biblioteca.API.dto;

import com.br.edu.ufersa.pw.projeto.biblioteca.Model.entity.Biblioteca;
import com.br.edu.ufersa.pw.projeto.user.Model.entity.Estado;
import com.br.edu.ufersa.pw.projeto.livro.API.dto.ReturnLivroDTO;

public class ReturnBibliotecaDTO {

    private Long id;
    private String livroId; // Mantemos como String no DTO para o Frontend, se preferir
    private Estado status;
    private ReturnLivroDTO livro;
    private Double nota;

    public ReturnBibliotecaDTO(Biblioteca biblioteca) {
        this.id = biblioteca.getId();

        // --- CORREÇÃO AQUI ---
        // Antes: this.livroId = biblioteca.getLivroId();
        // Agora: Pegamos do objeto Livro aninhado
        if (biblioteca.getLivro() != null) {
            this.livroId = String.valueOf(biblioteca.getLivro().getId());
        }
        // ---------------------

        this.status = biblioteca.getStatus();
    }

    // Getters e Setters...
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getLivroId() { return livroId; }
    public void setLivroId(String livroId) { this.livroId = livroId; }

    public Estado getStatus() { return status; }
    public void setStatus(Estado status) { this.status = status; }

    public ReturnLivroDTO getLivro() { return livro; }
    public void setLivro(ReturnLivroDTO livro) { this.livro = livro; }

    public Double getNota() { return nota; }
    public void setNota(Double nota) { this.nota = nota; }
}