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

    // Método para verificar se o livro já existe na biblioteca do usuário (usando LivroId)
    Optional<Biblioteca> findByUserIdAndLivroId(Long userId, String livroId);

    // Método para buscar a watchlist completa do usuário, ordenada pela data de adição
    Page<Biblioteca> findByUserIdOrderByAddedAtDesc(Long userId, Pageable pageable);

    // Método para buscar livros por usuário e status de leitura
    Page<Biblioteca> findByUserIdAndStatusOrderByAddedAtDesc(Long userId, Estado status, Pageable pageable);

    // Método para deletar uma entrada (usando LivroId)
    void deleteByUserIdAndLivroId(Long userId, String livroId);
}
