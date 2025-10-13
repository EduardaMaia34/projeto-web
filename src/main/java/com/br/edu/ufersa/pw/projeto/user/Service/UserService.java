package com.br.edu.ufersa.pw.projeto.user.Service;

import com.br.edu.ufersa.pw.projeto.user.API.dto.InputUserDTO;
import com.br.edu.ufersa.pw.projeto.user.API.dto.ReturnUserDTO;
import com.br.edu.ufersa.pw.projeto.user.Model.entity.User;
import com.br.edu.ufersa.pw.projeto.user.Model.entity.Role;
import com.br.edu.ufersa.pw.projeto.user.Model.repository.UserRepository;
import com.br.edu.ufersa.pw.projeto.user.Model.entity.Interesse;
import com.br.edu.ufersa.pw.projeto.user.Model.repository.InteresseRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository repository;
    private final InteresseRepository interesseRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository repository, InteresseRepository interesseRepository,
                       PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.interesseRepository = interesseRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return repository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado com o email: " + email));
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
        if (repository.findByEmailIgnoreCase(dto.getEmail()).isPresent()) {
            throw new IllegalArgumentException("O email já está em uso.");
        }

        User user = new User(dto);

        // Lógica de Role (Segurança Correta)
        if ("admin@seu-dominio.com".equalsIgnoreCase(dto.getEmail())) {
            user.setRole(Role.ROLE_ADMIN);
        } else {
            user.setRole(Role.ROLE_USER);
        }

        // Criptografia de Senha (Segurança Correta)
        String encodedPassword = passwordEncoder.encode(dto.getSenha());
        user.setSenha(encodedPassword);

        // Lógica de Interesses (Associação)
        if (dto.getInteressesIds() != null && !dto.getInteressesIds().isEmpty()) {
            if (dto.getInteressesIds().size() > 3) {
                throw new IllegalArgumentException("O usuário só pode escolher até 3 interesses.");
            }

            // Busca e associa a lista à entidade antes do salvamento final
            List<Interesse> interesses = interesseRepository.findAllById(dto.getInteressesIds());
            user.setInteresses(interesses);
        }

        // Salva a entidade User (com as associações de interesse) de uma ÚNICA vez.
        User savedUser = repository.save(user);

        return new ReturnUserDTO(savedUser);
    }
}
