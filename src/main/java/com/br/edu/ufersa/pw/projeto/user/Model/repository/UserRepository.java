package com.br.edu.ufersa.pw.projeto.user.Model.repository;

import com.br.edu.ufersa.pw.projeto.user.Model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User,Long> {
    List<User> findByNomeContainingIgnoreCase(String nome);
}
