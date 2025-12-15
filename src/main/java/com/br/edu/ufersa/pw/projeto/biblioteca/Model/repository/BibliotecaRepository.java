package com.br.edu.ufersa.pw.projeto.biblioteca.Model.repository;

import com.br.edu.ufersa.pw.projeto.biblioteca.Model.entity.Biblioteca;
import com.br.edu.ufersa.pw.projeto.user.Model.entity.Estado;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BibliotecaRepository extends JpaRepository<Biblioteca, Long> {

    Optional<Biblioteca> findByUserIdAndLivroId(Long userId, Long livroId);

    // --- ADICIONE ESTES DOIS MÉTODOS QUE FALTAVAM ---
    void deleteByUserIdAndLivroId(Long userId, Long livroId);

    void deleteByUserId(Long userId); // Usado pelo UserService

    void deleteByLivroId(Long livroId); // Usado pelo LivroService
    // ------------------------------------------------

    boolean existsByUserIdAndLivroId(Long userId, Long livroId);

    Page<Biblioteca> findByUserIdAndStatusOrderByAddedAtDesc(Long userId, Estado status, Pageable pageable);

    long countByUserIdAndStatus(Long userId, Estado status);
}