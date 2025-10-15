package com.br.edu.ufersa.pw.projeto.livro.Service;

import com.br.edu.ufersa.pw.projeto.biblioteca.Model.repository.BibliotecaRepository;
import com.br.edu.ufersa.pw.projeto.livro.API.dto.InputLivroDTO;
import com.br.edu.ufersa.pw.projeto.livro.Model.entity.Livro;
import com.br.edu.ufersa.pw.projeto.livro.Model.repository.LivroRepository;
import com.br.edu.ufersa.pw.projeto.review.Model.repository.ReviewRepository;
import com.br.edu.ufersa.pw.projeto.user.Model.entity.Interesse;
import com.br.edu.ufersa.pw.projeto.user.Model.repository.InteresseRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.Arrays;
import java.util.stream.Collectors;

@Service
public class LivroService {

    private final LivroRepository livroRepository;
    private final InteresseRepository interesseRepository;
    private final ReviewRepository reviewRepository;
    private final BibliotecaRepository bibliotecaRepository;

    @Autowired
    public LivroService(LivroRepository livroRepository, InteresseRepository interesseRepository, ReviewRepository reviewRepository, BibliotecaRepository bibliotecaRepository) {
        this.livroRepository = livroRepository;
        this.interesseRepository = interesseRepository;
        this.reviewRepository = reviewRepository;
        this.bibliotecaRepository = bibliotecaRepository;
    }

    @Transactional
    public Livro criarLivroComInteresses(InputLivroDTO dto) {
        Livro novoLivro = new Livro(dto.getTitulo(), dto.getAutor(), dto.getDescricao());

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
}
