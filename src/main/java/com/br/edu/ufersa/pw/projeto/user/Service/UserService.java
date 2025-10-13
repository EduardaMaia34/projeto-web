package com.br.edu.ufersa.pw.projeto.user.Service;

import com.br.edu.ufersa.pw.projeto.user.API.dto.InputUserDTO;
import com.br.edu.ufersa.pw.projeto.user.API.dto.ReturnUserDTO;
import com.br.edu.ufersa.pw.projeto.user.Model.entity.User;
import com.br.edu.ufersa.pw.projeto.user.Model.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder; // <-- NOVO: Importe o PasswordEncoder
import org.springframework.stereotype.Service;
import com.br.edu.ufersa.pw.projeto.user.Model.entity.Interesse;
import com.br.edu.ufersa.pw.projeto.user.Model.repository.InteresseRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {
    private final UserRepository repository;
    private final InteresseRepository interesseRepository;
    private final PasswordEncoder passwordEncoder; // <-- NOVO: Campo para o PasswordEncoder

    @Autowired
    public UserService(UserRepository repository, InteresseRepository interesseRepository,
                       PasswordEncoder passwordEncoder) { // <-- NOVO: Injeção de dependência
        this.repository = repository;
        this.interesseRepository = interesseRepository;
        this.passwordEncoder = passwordEncoder; // <-- NOVO: Atribuição
    }

    public List<ReturnUserDTO> buscarPorNome(String name) {
        List<User> users = repository.findByNomeContainingIgnoreCase(name);
        return users.stream()
                .map(ReturnUserDTO::new)
                .collect(Collectors.toList());
    }

    public List<ReturnUserDTO> listarTodos(){
        List<User> todosUsuarios = repository.findAll();
        return todosUsuarios.stream().map(user-> new ReturnUserDTO(user)).toList();
    }

    public ReturnUserDTO save(InputUserDTO dto){
        // 1. Cria a entidade User com os dados do DTO (incluindo a senha em texto puro)
        User user = new User(dto);

        // 2. CRIPTOGRAFIA DE SENHA: Pega a senha em texto puro e a criptografa
        String encodedPassword = passwordEncoder.encode(dto.getSenha());

        // 3. Define a senha criptografada na entidade User
        user.setSenha(encodedPassword);

        // 4. Salva a entidade uma primeira vez (para ter o ID se necessário para Interesse)
        User savedUser = repository.save(user);

        // Lógica de Interesses
        if (dto.getInteressesIds() != null && !dto.getInteressesIds().isEmpty()) {
            if (dto.getInteressesIds().size() > 3) {
                throw new IllegalArgumentException("O usuário só pode escolher até 3 interesses.");
            }

            List<Interesse> interesses = interesseRepository.findAllById(dto.getInteressesIds());
            savedUser.setInteresses(interesses);
        }

        // 5. Salva novamente com os interesses (ou apenas uma vez se otimizado)
        repository.save(savedUser);

        return new ReturnUserDTO(savedUser);
    }
}