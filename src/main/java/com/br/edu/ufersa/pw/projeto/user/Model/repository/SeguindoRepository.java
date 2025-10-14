// SeguindoRepository.java

package com.br.edu.ufersa.pw.projeto.user.Model.repository;

import com.br.edu.ufersa.pw.projeto.user.Model.entity.Seguindo;
import com.br.edu.ufersa.pw.projeto.user.Model.entity.User;
import org.springframework.data.domain.Limit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SeguindoRepository extends JpaRepository<Seguindo, Long> {
    List<Seguindo> findBySeguidor(User seguidor);
    void deleteBySeguidorAndSeguido(User seguidor, User seguido);
    boolean existsBySeguidorAndSeguido(User seguidor, User seguido);

    List<Seguindo> findBySeguidor_Id(Long seguidorId);

    List<Seguindo> findBySeguido_Id(Long seguidoId);

    // CORREÇÃO NECESSÁRIA: existsBySeguidor_IdAndSeguido_Id
    boolean existsBySeguidor_IdAndSeguido_Id(Long seguidorId, Long seguidoId);

    // CORREÇÃO NECESSÁRIA: findBySeguidor_IdAndSeguido_Id
    Seguindo findBySeguidor_IdAndSeguido_Id(Long seguidorId, Long seguidoId);
}