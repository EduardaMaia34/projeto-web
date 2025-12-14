package com.br.edu.ufersa.pw.projeto.user.Service;

import com.br.edu.ufersa.pw.projeto.livro.API.dto.LivroCapaDTO;
import com.br.edu.ufersa.pw.projeto.livro.Model.entity.Livro;
import com.br.edu.ufersa.pw.projeto.user.API.dto.InputUserDTO;
import com.br.edu.ufersa.pw.projeto.user.API.dto.ReturnUserDTO;
import com.br.edu.ufersa.pw.projeto.user.Model.entity.Seguindo;
import com.br.edu.ufersa.pw.projeto.user.Model.entity.User;
import com.br.edu.ufersa.pw.projeto.user.Model.entity.Role;
import com.br.edu.ufersa.pw.projeto.user.Model.repository.SeguindoRepository;
import com.br.edu.ufersa.pw.projeto.user.Model.repository.UserRepository;
import com.br.edu.ufersa.pw.projeto.user.Model.entity.Interesse;
import com.br.edu.ufersa.pw.projeto.user.Model.repository.InteresseRepository;
import com.br.edu.ufersa.pw.projeto.review.Model.repository.ReviewRepository;
import com.br.edu.ufersa.pw.projeto.biblioteca.Model.repository.BibliotecaRepository;
import com.br.edu.ufersa.pw.projeto.livro.Service.LivroService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet; // Import Necessário
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
    private final SeguindoRepository seguindoRepository;
    private final LivroService livroService;

    @Autowired
    public UserService(UserRepository repository,
                       InteresseRepository interesseRepository,
                       PasswordEncoder passwordEncoder,
                       ReviewRepository reviewRepository,
                       BibliotecaRepository bibliotecaRepository,
                       SeguindoRepository seguindoRepository,
                       @Lazy LivroService livroService) {
        this.repository = repository;
        this.interesseRepository = interesseRepository;
        this.passwordEncoder = passwordEncoder;
        this.reviewRepository = reviewRepository;
        this.bibliotecaRepository = bibliotecaRepository;
        this.seguindoRepository = seguindoRepository;
        this.livroService = livroService;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return repository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado com o email: " + email));
    }

    public Optional<User> findById(Long userId) {
        return repository.findById(userId);
    }

    public Optional<ReturnUserDTO> buscarDTOporId(Long userId) {
        return repository.findById(userId)
                .map(ReturnUserDTO::new);
    }

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

    private String normalizeImgurUrl(String url) {
        if (url == null || url.isEmpty()) return null;

        String normalizedUrl = url;

        if (normalizedUrl.contains("imgur.com")) {
            String hash = normalizedUrl.replaceAll("^.*[i\\.]?imgur\\.com/+(a/)?", "").replaceAll("(\\..*|\\?.*)$", "");
            if (hash.isEmpty()) {
                return normalizedUrl;
            }
            String format = "https://imgur.com/%s.png";
            return String.format(format, hash);
        }
        return normalizedUrl;
    }

    @Transactional
    public ReturnUserDTO save(InputUserDTO dto){
        if (repository.findByEmailIgnoreCase(dto.getEmail()).isPresent()) {
            throw new IllegalStateException("O email já está em uso.");
        }

        User user = new User(dto);

        user.setRole("admin@bookly.com".equalsIgnoreCase(dto.getEmail()) ? Role.ROLE_ADMIN : Role.ROLE_USER);
        user.setSenha(passwordEncoder.encode(dto.getSenha()));
        user.setBio(dto.getBio());
        user.setFotoPerfil(normalizeImgurUrl(dto.getFotoPerfil()));

        // --- LÓGICA DE INTERESSES (SAVE) ---
        if (dto.getInteressesIds() != null && !dto.getInteressesIds().isEmpty()) {
            // VALIDAÇÃO: Limite atualizado para 5
            if (dto.getInteressesIds().size() > 5) {
                throw new IllegalStateException("O usuário só pode escolher até 5 interesses.");
            }

            List<Interesse> interessesList = interesseRepository.findAllById(dto.getInteressesIds());

            if (interessesList.size() != dto.getInteressesIds().size()) {
                throw new NoSuchElementException("Um ou mais IDs de interesse não são válidos.");
            }

            // CONVERSÃO: List -> Set (HashSet)
            user.setInteresses(new HashSet<>(interessesList));
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

        if (dto.getBio() != null) {
            user.setBio(dto.getBio());
        }

        if (dto.getFotoPerfil() != null) {
            user.setFotoPerfil(normalizeImgurUrl(dto.getFotoPerfil()));
        }

        // --- LÓGICA DE INTERESSES (UPDATE) ---
        if (dto.getInteressesIds() != null) {
            // VALIDAÇÃO: Limite atualizado para 5
            if (dto.getInteressesIds().size() > 5) {
                throw new IllegalStateException("O usuário só pode escolher até 5 interesses.");
            }

            List<Interesse> interessesList = interesseRepository.findAllById(dto.getInteressesIds());

            if (interessesList.size() != dto.getInteressesIds().size()) {
                throw new NoSuchElementException("Um ou mais IDs de interesse não são válidos.");
            }

            // CONVERSÃO: List -> Set (HashSet)
            user.setInteresses(new HashSet<>(interessesList));
        }

        User updatedUser = repository.save(user);
        return new ReturnUserDTO(updatedUser);
    }

    @Transactional(readOnly = true)
    public List<Long> getIdsDosSeguidos(Long seguidorId) {
        List<Seguindo> seguidos = seguindoRepository.findBySeguidor_Id(seguidorId);

        return seguidos.stream()
                .map(s -> s.getSeguido().getId())
                .collect(Collectors.toList());
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

    @Transactional
    public void adicionarLivroFavorito(Long userId, Long livroId) {
        User user = repository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("Usuário com ID " + userId + " não encontrado."));


        Livro livro = livroService.buscarPorId(livroId)
                .orElseThrow(() -> new NoSuchElementException("Livro com ID " + livroId + " não encontrado."));

        if (!user.getLivrosFavoritos().contains(livro)) {
            user.getLivrosFavoritos().add(livro);
            repository.save(user);}
    }

    @Transactional
    public void removerLivroFavorito(Long userId, Long livroId) {
        User user = repository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("Usuário com ID " + userId + " não encontrado."));

        Livro livroParaRemover = user.getLivrosFavoritos().stream()
                .filter(l -> l.getId().equals(livroId))
                .findFirst()
                .orElseThrow(() -> new NoSuchElementException("Livro com ID " + livroId + " não está na lista de favoritos do usuário."));

        if (user.getLivrosFavoritos().remove(livroParaRemover)) {
            repository.save(user); }
    }

    public List<LivroCapaDTO> listarLivrosFavoritos(Long userId) {
        User user = repository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("Usuário com ID " + userId + " não encontrado."));


        return user.getLivrosFavoritos().stream()
                .map(LivroCapaDTO::new)
                .collect(Collectors.toList());
    }

    public List<Seguindo> listarSeguindo(Long userId) {
        return seguindoRepository.findBySeguidor_Id(userId);
    }

    public List<Seguindo> listarSeguidores(Long userId) {
        return seguindoRepository.findBySeguido_Id(userId);
    }
}