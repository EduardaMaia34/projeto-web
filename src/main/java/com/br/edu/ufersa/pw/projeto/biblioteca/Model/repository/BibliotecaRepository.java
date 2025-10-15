package com.br.edu.ufersa.pw.projeto.biblioteca.Model.repository;

import com.br.edu.ufersa.pw.projeto.biblioteca.Model.entity.Biblioteca;
import com.br.edu.ufersa.pw.projeto.user.Model.entity.Estado;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface BibliotecaRepository extends JpaRepository<Biblioteca, Long> {

    Optional<Biblioteca> findByUserIdAndLivroId(Long userId, String livroId);

    Page<Biblioteca> findByUserIdOrderByAddedAtDesc(Long userId, Pageable pageable);

    Page<Biblioteca> findByUserIdAndStatusOrderByAddedAtDesc(Long userId, Estado status, Pageable pageable);

    void deleteByUserIdAndLivroId(Long userId, String livroId);

    @Transactional
    void deleteByUserId(Long userId);
}
