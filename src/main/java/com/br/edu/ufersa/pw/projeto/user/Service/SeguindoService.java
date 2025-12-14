package com.br.edu.ufersa.pw.projeto.user.Service;

import com.br.edu.ufersa.pw.projeto.user.Model.entity.Seguindo;
import com.br.edu.ufersa.pw.projeto.user.Model.entity.User;
import com.br.edu.ufersa.pw.projeto.user.Model.repository.SeguindoRepository;
import com.br.edu.ufersa.pw.projeto.user.Model.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SeguindoService {

    @Autowired
    private SeguindoRepository seguindoRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public String seguir(Long seguidorId, Long seguidoId) {
        if (seguidorId.equals(seguidoId)) {
            throw new RuntimeException("Você não pode seguir a si mesmo!");
        }

        User seguidor = userRepository.findById(seguidorId)
                .orElseThrow(() -> new RuntimeException("Usuário seguidor não encontrado"));
        User seguido = userRepository.findById(seguidoId)
                .orElseThrow(() -> new RuntimeException("Usuário a seguir não encontrado"));

        if (seguindoRepository.existsBySeguidorAndSeguido(seguidor, seguido)) {
            return "Você já segue este usuário.";
        }

        Seguindo seguindo = new Seguindo();
        seguindo.setSeguidor(seguidor);
        seguindo.setSeguido(seguido);
        seguindoRepository.save(seguindo);

        return "Agora você está seguindo " + seguido.getNome() + "!";
    }

    @Transactional
    public String deixarDeSeguir(Long seguidorId, Long seguidoId) {
        User seguidor = userRepository.findById(seguidorId)
                .orElseThrow(() -> new RuntimeException("Usuário seguidor não encontrado"));
        User seguido = userRepository.findById(seguidoId)
                .orElseThrow(() -> new RuntimeException("Usuário seguido não encontrado"));

        if (!seguindoRepository.existsBySeguidorAndSeguido(seguidor, seguido)) {
            return "Você não segue este usuário.";
        }

        seguindoRepository.deleteBySeguidorAndSeguido(seguidor, seguido);
        return "Você deixou de seguir " + seguido.getNome();
    }

    public List<User> listarSeguindo(Long seguidorId) {
        User seguidor = userRepository.findById(seguidorId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        return seguindoRepository.findBySeguidor(seguidor)
                .stream()
                .map(Seguindo::getSeguido)
                .collect(Collectors.toList());
    }
}
