package com.br.edu.ufersa.pw.projeto.biblioteca.Model.repository;

import com.br.edu.ufersa.pw.projeto.biblioteca.Model.entity.Biblioteca;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface BibliotecaRepository extends JpaRepository<Biblioteca, Long> {

    // 1. busca da biblioteca do usuario

    Page<Biblioteca> findByUserIdOrderByAddedAtDesc(Long userId, Pageable pageable);

    // 2. verificar

    Optional<Biblioteca> findByUserIdAndFilmId(Long userId, String filmId);

    // 3. delete

    @Transactional
    void deleteByUserIdAndFilmId(Long userId, String filmId);

    // 4. conta quantos filmes o usuario tem

    long countByUserId(Long userId);
}