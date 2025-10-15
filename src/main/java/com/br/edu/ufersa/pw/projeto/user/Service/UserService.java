package com.br.edu.ufersa.pw.projeto.user.Service;

import com.br.edu.ufersa.pw.projeto.user.API.dto.InputUserDTO;
import com.br.edu.ufersa.pw.projeto.user.API.dto.ReturnUserDTO;
import com.br.edu.ufersa.pw.projeto.user.Model.entity.Seguindo;
import com.br.edu.ufersa.pw.projeto.user.Model.entity.User;
import com.br.edu.ufersa.pw.projeto.user.Model.entity.Role;
import com.br.edu.ufersa.pw.projeto.user.Model.repository.SeguindoRepository;
import com.br.edu.ufersa.pw.projeto.user.Model.repository.UserRepository;
import com.br.edu.ufersa.pw.projeto.user.Model.entity.Interesse;
import com.br.edu.ufersa.pw.projeto.user.Model.repository.InteresseRepository;
// IMPORTAÇÕES NECESSÁRIAS PARA DELEÇÃO EM CASCATA
import com.br.edu.ufersa.pw.projeto.review.Model.repository.ReviewRepository;
import com.br.edu.ufersa.pw.projeto.biblioteca.Model.repository.BibliotecaRepository;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository repository;
    private final InteresseRepository interesseRepository;
    private final PasswordEncoder passwordEncoder;
    private final ReviewRepository reviewRepository;
    private final BibliotecaRepository bibliotecaRepository;

    @Autowired
    private SeguindoRepository seguindoRepository;

    @Autowired
    public UserService(UserRepository repository, InteresseRepository interesseRepository,
                       PasswordEncoder passwordEncoder, ReviewRepository reviewRepository, BibliotecaRepository bibliotecaRepository) { // NOVO CONSTRUTOR
        this.repository = repository;
        this.interesseRepository = interesseRepository;
        this.passwordEncoder = passwordEncoder;
        this.reviewRepository = reviewRepository;
        this.bibliotecaRepository = bibliotecaRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return repository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado com o email: " + email));
    }

    public Optional<User> findById(Long userId) {
        return repository.findById(userId);
    }

    //metodos get
    public List<ReturnUserDTO> buscarPorNome(String name) {
        List<User> users = repository.findByNomeContainingIgnoreCase(name);
        return users.stream()
                .map(ReturnUserDTO::new)
                .collect(Collectors.toList());
    }

    public List<ReturnUserDTO> listarTodos(){
        List<User> todosUsuarios = repository.findAll();
        return todosUsuarios.stream().map(ReturnUserDTO::new).toList();
    }

    // crud
    @Transactional
    public ReturnUserDTO save(InputUserDTO dto){
        if (repository.findByEmailIgnoreCase(dto.getEmail()).isPresent()) {
            throw new IllegalStateException("O email já está em uso.");
        }

        User user = new User(dto);

        user.setRole("admin@seu-dominio.com".equalsIgnoreCase(dto.getEmail()) ? Role.ROLE_ADMIN : Role.ROLE_USER);

        user.setSenha(passwordEncoder.encode(dto.getSenha()));

        if (dto.getInteressesIds() != null && !dto.getInteressesIds().isEmpty()) {
            if (dto.getInteressesIds().size() > 3) {
                throw new IllegalStateException("O usuário só pode escolher até 3 interesses.");
            }

            List<Interesse> interesses = interesseRepository.findAllById(dto.getInteressesIds());
            if (interesses.size() != dto.getInteressesIds().size()) {
                throw new NoSuchElementException("Um ou mais IDs de interesse não são válidos.");
            }
            user.setInteresses(interesses);
        }

        User savedUser = repository.save(user);
        return new ReturnUserDTO(savedUser);
    }

    @Transactional
    public ReturnUserDTO update(Long userId, InputUserDTO dto) {
        User user = repository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("Usuário com ID " + userId + " não encontrado."));

        if (dto.getNome() != null) {
            user.setNome(dto.getNome());
        }



        if (dto.getInteressesIds() != null) {
            if (dto.getInteressesIds().size() > 3) {
                throw new IllegalStateException("O usuário só pode escolher até 3 interesses.");
            }
            List<Interesse> interesses = interesseRepository.findAllById(dto.getInteressesIds());
            if (interesses.size() != dto.getInteressesIds().size()) {
                throw new NoSuchElementException("Um ou mais IDs de interesse não são válidos.");
            }
            user.setInteresses(interesses);
        }

        User updatedUser = repository.save(user);
        return new ReturnUserDTO(updatedUser);
    }

    @Transactional
    public ReturnUserDTO updatePassword(String email, String newPassword) {
        User user = repository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new NoSuchElementException("Usuário com email " + email + " não encontrado."));

        if (newPassword == null || newPassword.isEmpty()) {
            throw new IllegalStateException("A nova senha não pode ser vazia.");
        }

        user.setSenha(passwordEncoder.encode(newPassword));
        User updatedUser = repository.save(user);

        return new ReturnUserDTO(updatedUser);
    }

    @Transactional
    public ReturnUserDTO updatePasswordByUser(Long userId, String newPassword) {
        User user = repository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("Usuário não encontrado."));

        if (newPassword == null || newPassword.isEmpty()) {
            throw new IllegalStateException("A nova senha não pode ser vazia.");
        }

        user.setSenha(passwordEncoder.encode(newPassword));
        User updatedUser = repository.save(user);

        return new ReturnUserDTO(updatedUser);
    }

    @Transactional
    public void deleteById(Long userId) {
        User user = repository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("Usuário com ID " + userId + " não encontrado."));


        reviewRepository.deleteByUserId(userId);
        bibliotecaRepository.deleteByUserId(userId);
        seguindoRepository.deleteBySeguidor(user);
        seguindoRepository.deleteBySeguido(user);

        if (user.getInteresses() != null) {
            user.getInteresses().clear();
        }
        repository.save(user);

        repository.deleteById(userId);
    }

    @Transactional
    public void deleteByEmail(String email) {
        User user = repository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new NoSuchElementException("Usuário com email " + email + " não encontrado."));

        deleteById(user.getId());
    }


    public void seguirUsuario(Long seguidorId, Long seguidoId) {
        if (seguidorId.equals(seguidoId)) {
            throw new IllegalArgumentException("Você não pode seguir a si mesmo");
        }

        User seguidor = repository.findById(seguidorId)
                .orElseThrow(() -> new NoSuchElementException("Seguidor não encontrado."));
        User seguido = repository.findById(seguidoId)
                .orElseThrow(() -> new NoSuchElementException("Seguido não encontrado."));

        boolean jaSegue = seguindoRepository.existsBySeguidorAndSeguido(seguidor, seguido);

        if (!jaSegue) {
            Seguindo seguindo = new Seguindo();
            seguindo.setSeguidor(seguidor);
            seguindo.setSeguido(seguido);

            seguindoRepository.save(seguindo);
        }
    }

    @Transactional
    public void deixarDeSeguir(Long seguidorId, Long seguidoId) {
        User seguidor = repository.findById(seguidorId)
                .orElseThrow(() -> new NoSuchElementException("Seguidor não encontrado."));
        User seguido = repository.findById(seguidoId)
                .orElseThrow(() -> new NoSuchElementException("Seguido não encontrado."));


        if (seguindoRepository.existsBySeguidorAndSeguido(seguidor, seguido)) {

            seguindoRepository.deleteBySeguidorAndSeguido(seguidor, seguido);
        }
    }

    public List<Seguindo> listarSeguindo(Long userId) {
        return seguindoRepository.findBySeguidor_Id(userId);
    }

    public List<Seguindo> listarSeguidores(Long userId) {
        return seguindoRepository.findBySeguido_Id(userId);
    }
}