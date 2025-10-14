package com.br.edu.ufersa.pw.projeto.user.Model.repository;
import com.br.edu.ufersa.pw.projeto.user.Model.entity.Interesse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InteresseRepository extends JpaRepository<Interesse, Long> {
    boolean existsByNome(String nome);


}