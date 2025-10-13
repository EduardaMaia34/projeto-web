package com.br.edu.ufersa.pw.projeto.livro.Model.repository;

import com.br.edu.ufersa.pw.projeto.livro.Model.entity.Estilos;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EstiloRepository extends JpaRepository<Estilos, Long> {


    boolean existsByNome(String nome);

    Optional<Estilos> findByNome(String nome);

}