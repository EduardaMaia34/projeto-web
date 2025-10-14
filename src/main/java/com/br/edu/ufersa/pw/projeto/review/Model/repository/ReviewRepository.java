package com.br.edu.ufersa.pw.projeto.review.Model.repository;

import com.br.edu.ufersa.pw.projeto.review.Model.entity.Review;
import com.br.edu.ufersa.pw.projeto.user.Model.entity.User;
import com.br.edu.ufersa.pw.projeto.livro.Model.entity.Livro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review,Long> {
        List<Review> findByLivro_TituloContainingIgnoreCase(String titulo);
        List<Review> findByLivroId(Long livroId);
        List<Review> findByUserId(Long userId);
        Optional<Review> findByUser_NomeIgnoreCase(String nome);
        boolean existsByUserAndLivro(User user, Livro livro);
    }
