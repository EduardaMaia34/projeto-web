package com.br.edu.ufersa.pw.projeto.livro.API.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class InputLivroDTO {
    @NotBlank(message = "O título é obrigatório.")
    @Size(max = 255, message = "O título deve ter no máximo 255 caracteres.")
    private String titulo;

    @NotBlank(message = "O nome do autor é obrigatório.")
    private String autor;

    @NotBlank(message = "A descrição é obrigatória.")
    private String descricao;


    private Long[] interessesIds;


    public InputLivroDTO() {}

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getAutor() { return autor; }
    public void setAutor(String autor) { this.autor = autor; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public Long[] getInteressesIds() { return interessesIds; }

    public void setInteressesIds(Long[] interessesIds) {
        this.interessesIds = interessesIds;
    }
}
