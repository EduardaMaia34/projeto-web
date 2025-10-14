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

    @Autowired
    private SeguindoRepository seguindoRepository;

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
        // 1. Validação de Email (Regra de Negócio)
        if (repository.findByEmailIgnoreCase(dto.getEmail()).isPresent()) {
            // Alterado de IllegalArgumentException para IllegalStateException, mais comum em Services
            throw new IllegalStateException("O email já está em uso.");
        }

        User user = new User(dto);

        // 2. Lógica de Role (Segurança)
        user.setRole("admin@seu-dominio.com".equalsIgnoreCase(dto.getEmail()) ? Role.ROLE_ADMIN : Role.ROLE_USER);

        // 3. Criptografia de Senha (Segurança)
        user.setSenha(passwordEncoder.encode(dto.getSenha()));

        // 4. Lógica de Interesses (Associação)
        if (dto.getInteressesIds() != null && !dto.getInteressesIds().isEmpty()) {
            if (dto.getInteressesIds().size() > 3) {
                throw new IllegalStateException("O usuário só pode escolher até 3 interesses.");
            }

            List<Interesse> interesses = interesseRepository.findAllById(dto.getInteressesIds());
            // Verifica se todos os IDs foram encontrados, se não, lança exceção
            if (interesses.size() != dto.getInteressesIds().size()) {
                throw new NoSuchElementException("Um ou mais IDs de interesse não são válidos.");
            }
            user.setInteresses(interesses);
        }

        // 5. Salva e Retorna DTO
        User savedUser = repository.save(user);
        return new ReturnUserDTO(savedUser);
    }

    @Transactional
    public ReturnUserDTO update(Long userId, InputUserDTO dto) {
        User user = repository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("Usuário com ID " + userId + " não encontrado."));

        // Atualiza campos que podem ser modificados (Nome, por exemplo)
        if (dto.getNome() != null) {
            user.setNome(dto.getNome());
        }

        // Se a senha for fornecida, ela deve ser atualizada e criptografada
        if (dto.getSenha() != null && !dto.getSenha().isEmpty()) {
            user.setSenha(passwordEncoder.encode(dto.getSenha()));
        }

        // Lógica de Interesses
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
    public void deleteById(Long userId) {
        if (!repository.existsById(userId)) {
            throw new NoSuchElementException("Usuário com ID " + userId + " não encontrado.");
        }
        repository.deleteById(userId);
    }

    @Transactional
    public void deleteByEmail(String email) {
        User user = repository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new NoSuchElementException("Usuário com email " + email + " não encontrado."));

        repository.delete(user);
    }


    public void seguirUsuario(Long seguidorId, Long seguidoId) {
        if (seguidorId.equals(seguidoId)) {
            throw new IllegalArgumentException("Você não pode seguir a si mesmo");
        }

        // CORREÇÃO 1.1: Carregar entidades User para uso no existsBy
        User seguidor = repository.findById(seguidorId)
                .orElseThrow(() -> new NoSuchElementException("Seguidor não encontrado."));
        User seguido = repository.findById(seguidoId)
                .orElseThrow(() -> new NoSuchElementException("Seguido não encontrado."));

        // CORREÇÃO 1.2: Usar o método de repositório que aceita entidades User
        boolean jaSegue = seguindoRepository.existsBySeguidorAndSeguido(seguidor, seguido);

        if (!jaSegue) {
            Seguindo seguindo = new Seguindo();
            // CORREÇÃO 1.3: Usar o setter de entidade User
            seguindo.setSeguidor(seguidor);
            seguindo.setSeguido(seguido);

            seguindoRepository.save(seguindo);
        }
    }

    public void deixarDeSeguir(Long seguidorId, Long seguidoId) {
        // CORREÇÃO 2.1: Carregar entidades User para a deleção
        User seguidor = repository.findById(seguidorId)
                .orElseThrow(() -> new NoSuchElementException("Seguidor não encontrado."));
        User seguido = repository.findById(seguidoId)
                .orElseThrow(() -> new NoSuchElementException("Seguido não encontrado."));


        if (seguindoRepository.existsBySeguidorAndSeguido(seguidor, seguido)) {
            // CORREÇÃO 2.2: Chamar o método delete que aceita entidades.
            // Nota: O método deleteBySeguidorAndSeguido no Repository é o mais eficiente aqui.
            seguindoRepository.deleteBySeguidorAndSeguido(seguidor, seguido);
        }
    }

    // CORREÇÃO 3.1: Mudar para findBySeguidor_Id para resolver o erro de inicialização do JPA
    public List<Seguindo> listarSeguindo(Long userId) {
        return seguindoRepository.findBySeguidor_Id(userId);
    }

    // CORREÇÃO 3.2: Mudar para findBySeguido_Id para resolver o erro de inicialização do JPA
    public List<Seguindo> listarSeguidores(Long userId) {
        return seguindoRepository.findBySeguido_Id(userId);
    }
}