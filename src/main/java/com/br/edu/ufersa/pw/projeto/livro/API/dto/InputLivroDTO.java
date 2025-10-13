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

    // Adicione os IDs dos estilos (opcional, dependendo do seu design de API)
    private Long[] estiloIds;

    // Construtor vazio
    public InputLivroDTO() {}

    // Getters e Setters
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getAutor() { return autor; }
    public void setAutor(String autor) { this.autor = autor; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public Long[] getEstiloIds() { return estiloIds; }
    public void setEstiloIds(Long[] estiloIds) { this.estiloIds = estiloIds; }
}
