package com.br.edu.ufersa.pw.projeto.livro.Model.repository;

import com.br.edu.ufersa.pw.projeto.livro.Model.entity.Livro;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LivroRepository extends JpaRepository<Livro, Long> {

    List<Livro> findByTituloContainingIgnoreCase(String titulo);

    List<Livro> findByAutor(String autor);

    boolean existsByTituloAndAutor(String titulo, String autor);
}
