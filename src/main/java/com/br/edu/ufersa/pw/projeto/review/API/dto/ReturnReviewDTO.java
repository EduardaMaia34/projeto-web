package com.br.edu.ufersa.pw.projeto.review.API.dto;

import com.br.edu.ufersa.pw.projeto.review.Model.entity.Review;

public class ReturnReviewDTO {
    private String review;
    private double nota;
    private Long livroId;
    private String autor;

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

    public ReturnReviewDTO(Review review) {
        this.nota = review.getNota();
        this.review = review.getReview();
        this.livroId = review.getLivro().getId();
        this.autor = review.getUser().getNome();
    }
}
