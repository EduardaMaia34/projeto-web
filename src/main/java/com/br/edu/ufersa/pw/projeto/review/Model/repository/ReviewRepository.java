package com.br.edu.ufersa.pw.projeto.review.Model.repository;

import com.br.edu.ufersa.pw.projeto.review.Model.entity.Review;
import com.br.edu.ufersa.pw.projeto.user.Model.entity.User;
import com.br.edu.ufersa.pw.projeto.livro.Model.entity.Livro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review,Long> {
    List<Review> findByLivro_TituloContainingIgnoreCase(String titulo);
    List<Review> findByLivroId(Long livroId);
    List<Review> findByUserId(Long userId);
    Optional<Review> findByUser_NomeIgnoreCase(String nome);
    List<Review> findByUserIn(List<User> users);
    List<Review> findByData(LocalDateTime data);

    @Query("SELECT r FROM Review r WHERE r.user.id IN :userIds ORDER BY r.data DESC")
    List<Review> findReviewsByUserIds(List<Long> userIds);
    boolean existsByUserIdAndLivroId(Long userId, Long livroId);


    boolean existsByUserAndLivro(User user, Livro livro);
}


