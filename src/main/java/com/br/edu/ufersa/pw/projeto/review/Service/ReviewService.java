package com.br.edu.ufersa.pw.projeto.review.Service;

import com.br.edu.ufersa.pw.projeto.biblioteca.API.dto.InputBibliotecaDTO;
import com.br.edu.ufersa.pw.projeto.biblioteca.Service.BibliotecaService;
import com.br.edu.ufersa.pw.projeto.livro.Model.entity.Livro;
import com.br.edu.ufersa.pw.projeto.livro.Model.repository.LivroRepository;
import com.br.edu.ufersa.pw.projeto.review.API.dto.InputReviewDTO;
import com.br.edu.ufersa.pw.projeto.review.API.dto.ReturnReviewDTO;
import com.br.edu.ufersa.pw.projeto.review.Model.entity.Review;
import com.br.edu.ufersa.pw.projeto.review.Model.repository.ReviewRepository;
import com.br.edu.ufersa.pw.projeto.user.Model.entity.Estado;
import com.br.edu.ufersa.pw.projeto.user.Model.entity.User;
import com.br.edu.ufersa.pw.projeto.user.Model.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.context.annotation.Lazy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.util.OptionalDouble;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LivroRepository livroRepository;

    @Autowired
    @Lazy
    private BibliotecaService bibliotecaService;

    @Transactional
    public ReturnReviewDTO criarReview(Long userId, Long livroId, InputReviewDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Livro livro = livroRepository.findById(livroId)
                .orElseThrow(() -> new RuntimeException("Livro não encontrado"));

        boolean jaExiste = reviewRepository.existsByUserAndLivro(user, livro);
        if (jaExiste) {
            throw new RuntimeException("Usuário já avaliou este livro.");
        }

        Review review = new Review();
        review.setUser(user);
        review.setLivro(livro);
        review.setReview(dto.getReview());
        review.setNota(dto.getNota());

        Review salva = reviewRepository.save(review);

        String livroIdStr = String.valueOf(livroId);

        try {
            bibliotecaService.updateLivroStatus(userId, livroIdStr, Estado.LIDO);

        } catch (IllegalStateException e) {

            InputBibliotecaDTO bibliotecaDto = new InputBibliotecaDTO();
            bibliotecaDto.setLivroId(livroIdStr);
            bibliotecaDto.setStatus(Estado.LIDO);


            bibliotecaService.adicionarLivro(userId, bibliotecaDto);
        }

        return new ReturnReviewDTO(salva);
    }

    // Listar todas as reviews de um livro
    public List<ReturnReviewDTO> listarPorLivro(Long livroId) {
        List<Review> reviews = reviewRepository.findByLivroId(livroId);
        return reviews.stream()
                .map(ReturnReviewDTO::new)
                .collect(Collectors.toList());
    }

    // Listar todas as reviews de um usuário
    public List<ReturnReviewDTO> listarPorUsuario(Long userId) {
        List<Review> reviews = reviewRepository.findByUserId(userId);
        return reviews.stream()
                .map(ReturnReviewDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReturnReviewDTO atualizarReview(Long reviewId, Long userId, InputReviewDTO dto) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review não encontrada"));


        if (!review.getUser().getId().equals(userId)) {
            throw new RuntimeException("Você não pode editar a review de outro usuário!");
        }

        review.setReview(dto.getReview());
        review.setNota(dto.getNota());
        Review atualizada = reviewRepository.save(review);

        return new ReturnReviewDTO(atualizada);
    }

    // Deletar review
    @Transactional
    public void deletarReview(Long reviewId, Long userId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review não encontrada"));

        if (!review.getUser().getId().equals(userId)) {
            throw new RuntimeException("Você não pode deletar a review de outro usuário!");
        }

        Long livroId = review.getLivro().getId();

        reviewRepository.delete(review);

        try {
            bibliotecaService.updateLivroStatus(userId, String.valueOf(livroId), Estado.QUERO_LER);
        } catch (IllegalStateException e) {

            System.err.println("Erro ao tentar atualizar status na biblioteca: " + e.getMessage());
        }
    }

    public Double getMediaAvaliacaoLivro(Long livroId) {
        List<Review> reviews = reviewRepository.findByLivroId(livroId);

        if (reviews.isEmpty()) {
            return 0.0;
        }

        OptionalDouble media = reviews.stream()
                .mapToDouble(Review::getNota)
                .average();

        return media.orElse(0.0);
    }

    public List<Review> listarFeed(List<Long> userIds) {
        return reviewRepository.findReviewsByUserIds(userIds);
    }


    public List<Livro> encontrarLivrosMaisRevisadosNaSemana() {
        LocalDateTime umaSemanaAtras = LocalDateTime.now().minusDays(7);
        return reviewRepository.findTopReviewedLivrosLastWeek(umaSemanaAtras);
    }
}