package com.br.edu.ufersa.pw.projeto.livro.API.dto;

import com.br.edu.ufersa.pw.projeto.livro.Model.entity.Livro;
import com.br.edu.ufersa.pw.projeto.user.Model.entity.Interesse;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.stream.Collectors;

// commit
public class ReturnLivroDTO {

    private Long id;

    private String titulo;
    private String autor;
    private String descricao;

    private String urlCapa;

    private LocalDateTime dataCriacao;

    private Set<String> interesses;
    private int ano;

    private Double mediaAvaliacao;

    // --- CONSTRUTORES ---

    public ReturnLivroDTO() {}

    // Construtor principal para facilitar a conversão da Entity para o DTO
    public ReturnLivroDTO(Long id, String titulo, String autor, String descricao, LocalDateTime dataCriacao, Set<String> interesses, String urlCapa, int ano) {
        this.id = id;
        this.titulo = titulo;
        this.autor = autor;
        this.descricao = descricao;
        this.dataCriacao = dataCriacao;
        this.interesses = interesses;
        this.urlCapa = urlCapa;
        this.ano = ano;

    }

    public ReturnLivroDTO(Livro livro) {
        this.id = livro.getId();
        this.titulo = livro.getTitulo();
        this.autor = livro.getAutor();
        this.descricao = livro.getDescricao();
        this.dataCriacao = livro.getDataCriacao();
        this.urlCapa = livro.getUrlCapa();
        this.ano = livro.getAno();

        if (livro.getInteresses() != null) {
            this.interesses = livro.getInteresses()
                    .stream()
                    .map(Interesse::getNome)
                    .collect(Collectors.toSet());
        }

        this.mediaAvaliacao = 0.0;
    }

    // --- GETTERS E SETTERS CORRIGIDOS ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitulo() { // Corrigido de getNome()
        return titulo;
    }

    public void setTitulo(String titulo) { // Corrigido de setNome()
        this.titulo = titulo;
    }

    public String getAutor() { // Corrigido de getEmail()
        return autor;
    }

    public void setAutor(String autor) { // Corrigido de setEmail()
        this.autor = autor;
    }

    public String getDescricao() { // Novo campo para Livro
        return descricao;
    }

    public void setDescricao(String descricao) { // Novo campo para Livro
        this.descricao = descricao;
    }

    public LocalDateTime getDataCriacao() {
        return dataCriacao;
    }

    public void setDataCriacao(LocalDateTime dataCriacao) {
        this.dataCriacao = dataCriacao;
    }

     public Set<String> getInteresses() {
        return interesses;
     }

     public void setInteresses(Set<String> interesses) {
        this.interesses = interesses;
     }

    public String getUrlCapa() {
        return urlCapa;
    }

    public void setUrlCapa(String urlCapa) {
        this.urlCapa = urlCapa;
    }

    public int getAno() {
        return ano;
    }
    public void setAno(int ano) {
        this.ano = ano;
    }

    public Double getMediaAvaliacao() {
        return mediaAvaliacao;
    }

    public void setMediaAvaliacao(Double mediaAvaliacao) {
        this.mediaAvaliacao = mediaAvaliacao;
    }
}