package com.br.edu.ufersa.pw.projeto.livro.Model.repository;
//commit
import com.br.edu.ufersa.pw.projeto.livro.Model.entity.Livro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LivroRepository extends JpaRepository<Livro, Long> {

    List<Livro> findByTituloContainingIgnoreCase(String titulo);

    List<Livro> findByAutor(String autor);

    boolean existsByTituloAndAutor(String titulo, String autor);

    @Query("SELECT l FROM Livro l WHERE " +
            "LOWER(l.titulo) LIKE LOWER(CONCAT('%', :termo, '%')) OR " +
            "LOWER(l.autor) LIKE LOWER(CONCAT('%', :termo, '%'))")
    List<Livro> findByTituloOrAutorContainingIgnoreCase(@Param("termo") String termo);
}
