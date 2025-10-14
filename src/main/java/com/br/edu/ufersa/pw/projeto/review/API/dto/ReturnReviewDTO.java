package com.br.edu.ufersa.pw.projeto.review.API.dto;

import com.br.edu.ufersa.pw.projeto.review.Model.entity.Review;

import java.time.LocalDateTime;

public class ReturnReviewDTO {
    private String review;
    private double nota;
    private Long livroId;
    private String autor;
    private LocalDateTime data;

    public  String getReview() {
        return review;
    }
    public void setReview(String review) {
        this.review = review;
    }

    public double getNota() {
        return nota;
    }
    public void setNota(double nota) {
        this.nota = nota;
    }

    public Long getLivroId() {
        return livroId;
    }
    public void setLivroId(Long livroId) {
        this.livroId = livroId;
    }

    public String getAutor() {
        return autor;
    }

    public void setAutor(String autor) {
        this.autor = autor;
    }

    public LocalDateTime getData() {
        return data;
    }

    public void setData(LocalDateTime data) {
        this.data = data;
    }

    public ReturnReviewDTO(Review review) {
        this.nota = review.getNota();
        this.review = review.getReview();
        this.livroId = review.getLivro().getId();
        this.autor = review.getUser().getNome();
        this.data = review.getData();
    }
}
