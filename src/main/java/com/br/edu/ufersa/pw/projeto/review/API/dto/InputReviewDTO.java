package com.br.edu.ufersa.pw.projeto.review.API.dto;

import com.br.edu.ufersa.pw.projeto.user.API.dto.InputUserDTO;

import java.util.Objects;

public class InputReviewDTO {
    private String review;
    private double nota;
    private Long livroId;

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

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        InputReviewDTO that = (InputReviewDTO) o;
        return Objects.equals(getReview(), that.getReview()) && Objects.equals(getNota(), that.getNota());
    }

    @Override
    public int hashCode() {
        return Objects.hash(getReview(), getNota());
    }
}
