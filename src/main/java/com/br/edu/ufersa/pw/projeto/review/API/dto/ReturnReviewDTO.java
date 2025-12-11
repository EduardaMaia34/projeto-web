package com.br.edu.ufersa.pw.projeto.review.API.dto;

import com.br.edu.ufersa.pw.projeto.review.Model.entity.Review;
import com.br.edu.ufersa.pw.projeto.livro.Model.entity.Livro;

import java.time.LocalDateTime;

public class ReturnReviewDTO {

    private Long id;
    private String review;
    private double nota;
    private String autor;
    private LocalDateTime data;

    private LivroReviewDTO livro;

    public ReturnReviewDTO(Review review) {
        this.id = review.getId();
        this.nota = review.getNota();
        this.review = review.getReview();
        this.data = review.getData();
        this.autor = review.getUser().getNome();

        this.livro = new LivroReviewDTO(review.getLivro());
    }

    public ReturnReviewDTO() {}



    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getReview() { return review; }
    public void setReview(String review) { this.review = review; }

    public double getNota() { return nota; }
    public void setNota(double nota) { this.nota = nota; }

    public String getAutor() { return autor; }
    public void setAutor(String autor) { this.autor = autor; }

    public LocalDateTime getData() { return data; }
    public void setData(LocalDateTime data) { this.data = data; }

    public LivroReviewDTO getLivro() { return livro; }
    public void setLivro(LivroReviewDTO livro) { this.livro = livro; }


    public static class LivroReviewDTO {
        private Long id;
        private String titulo;
        private Integer ano;
        private String urlCapa;

        public LivroReviewDTO(Livro livro) {
            this.id = livro.getId();
            this.titulo = livro.getTitulo();
            this.ano = livro.getAno();
            this.urlCapa = livro.getUrlCapa();
        }

        public LivroReviewDTO() {}

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getTitulo() { return titulo; }
        public void setTitulo(String titulo) { this.titulo = titulo; }
        public Integer getAno() { return ano; }
        public void setAno(Integer ano) { this.ano = ano; }
        public String getUrlCapa() { return urlCapa; }
        public void setUrlCapa(String urlCapa) { this.urlCapa = urlCapa; }
    }
}