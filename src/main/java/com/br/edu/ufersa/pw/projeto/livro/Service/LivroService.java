package com.br.edu.ufersa.pw.projeto.livro.Service;

import com.br.edu.ufersa.pw.projeto.biblioteca.Model.repository.BibliotecaRepository;
import com.br.edu.ufersa.pw.projeto.livro.API.dto.InputLivroDTO;
import com.br.edu.ufersa.pw.projeto.livro.API.dto.ReturnLivroDTO;
import com.br.edu.ufersa.pw.projeto.livro.Model.entity.Livro;
import com.br.edu.ufersa.pw.projeto.livro.Model.repository.LivroRepository;
import com.br.edu.ufersa.pw.projeto.review.Model.repository.ReviewRepository;
import com.br.edu.ufersa.pw.projeto.user.Model.entity.Interesse;
import com.br.edu.ufersa.pw.projeto.user.Model.repository.InteresseRepository;

import com.br.edu.ufersa.pw.projeto.user.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;
//commit
@Service
public class LivroService {

    private final LivroRepository livroRepository;
    private final InteresseRepository interesseRepository;
    private final ReviewRepository reviewRepository;
    private final BibliotecaRepository bibliotecaRepository;
    private final UserService userService;

    @Autowired
    public LivroService(LivroRepository livroRepository, InteresseRepository interesseRepository, ReviewRepository reviewRepository, BibliotecaRepository bibliotecaRepository,  UserService userService) {
        this.livroRepository = livroRepository;
        this.interesseRepository = interesseRepository;
        this.reviewRepository = reviewRepository;
        this.bibliotecaRepository = bibliotecaRepository;
        this.userService = userService;
    }

    public ReturnLivroDTO toReturnLivroDTO(Livro livro) {
        if (livro == null) {
            return null;
        }

        Set<String> interessesNomes = null;
        if (livro.getInteresses() != null) {
            interessesNomes = livro.getInteresses().stream()
                    .map(Interesse::getNome)
                    .collect(Collectors.toSet());
        }

        return new ReturnLivroDTO(
                livro.getId(),
                livro.getTitulo(),
                livro.getAutor(),
                livro.getDescricao(),
                livro.getDataCriacao(),
                interessesNomes,
                livro.getUrlCapa(),
                livro.getAno()
        );
    }

    @Transactional(readOnly = true)
    public Livro findLivroEntityById(Long livroId) {
        return livroRepository.findById(livroId)
                .orElseThrow(() -> new NoSuchElementException("Livro com ID " + livroId + " não encontrado."));
    }

    @Transactional
    public Livro criarLivroComInteresses(InputLivroDTO dto) {

        Livro novoLivro = new Livro(dto.getTitulo(), dto.getAutor(), dto.getDescricao()); // Construtor com 3 argumentos

        novoLivro.setUrlCapa(dto.getUrlCapa());
        novoLivro.setAno(dto.getAno());


        if (dto.getInteressesIds() != null && dto.getInteressesIds().length > 0) {
            List<Long> idsList = Arrays.asList(dto.getInteressesIds());
            List<Interesse> interessesEncontrados = interesseRepository.findAllById(idsList);

            novoLivro.setInteresses(interessesEncontrados.stream().collect(Collectors.toSet()));
        }

        return criarOuAtualizar(novoLivro);
    }

    @Transactional
    public Livro atualizarLivroComInteresses(Long id, InputLivroDTO dto) {
        Livro livroExistente = livroRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Livro com o ID " + id + " não encontrado para atualização."));

        livroExistente.setTitulo(dto.getTitulo());
        livroExistente.setAutor(dto.getAutor());
        livroExistente.setDescricao(dto.getDescricao());
        livroExistente.setAno(dto.getAno()); // Adicionado o mapeamento para ano

        livroExistente.setUrlCapa(dto.getUrlCapa());

        livroExistente.getInteresses().clear();

        if (dto.getInteressesIds() != null && dto.getInteressesIds().length > 0) {
            List<Long> idsList = Arrays.asList(dto.getInteressesIds());
            List<Interesse> novosInteresses = interesseRepository.findAllById(idsList);

            livroExistente.getInteresses().addAll(novosInteresses);
        }

        return livroRepository.save(livroExistente);
    }

    protected Livro criarOuAtualizar(Livro livro) {
        if (livro.getId() == null && livroRepository.existsByTituloAndAutor(livro.getTitulo(), livro.getAutor())) {
            throw new IllegalArgumentException("Já existe um livro com o mesmo Título e Autor.");
        }
        return livroRepository.save(livro);
    }

    public List<Livro> buscarTodos() {
        return livroRepository.findAll();
    }

    public Optional<Livro> buscarPorId(Long id) {
        return livroRepository.findById(id);
    }

    public List<Livro> buscarPorTitulo(String titulo) {
        return livroRepository.findByTituloContainingIgnoreCase(titulo);
    }

    public List<Livro> buscarPorTermo(String termo) {
        return livroRepository.findByTituloOrAutorContainingIgnoreCase(termo);
    }

    @Transactional
    public void deletarLivro(Long id) {
        if (!livroRepository.existsById(id)) {
            throw new IllegalArgumentException("Livro com o ID " + id + " não encontrado para exclusão.");
        }
        reviewRepository.deleteByLivroId(id);
        String livroIdString = String.valueOf(id);
        bibliotecaRepository.deleteByLivroId(livroIdString);
        livroRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<Livro> buscarLivrosDeAmigos(Long userIdLogado) {
        List<Long> idsDosAmigos = userService.getIdsDosSeguidos(userIdLogado);

        if (idsDosAmigos.isEmpty()) {
            return List.of(); // Sem amigos para seguir, retorna vazio
        }

        // 2. Coleta IDs de Livros únicos dos amigos (exemplo com reviews e biblioteca)
        Set<Long> livroIdsPopularesEntreAmigos = new HashSet<>();

        for (Long amigoId : idsDosAmigos) {

            List<Livro> todosLivros = livroRepository.findAll();
            // Adiciona IDs dos primeiros 5 livros para simular popularidade
            todosLivros.stream().limit(5).map(Livro::getId).forEach(livroIdsPopularesEntreAmigos::add);
        }

        // 3. Busca as entidades Livro reais a partir dos IDs únicos
        return livroRepository.findAllById(livroIdsPopularesEntreAmigos);
    }

}

