package com.br.edu.ufersa.pw.projeto.review.Service;

import com.br.edu.ufersa.pw.projeto.livro.Model.entity.Livro;
import com.br.edu.ufersa.pw.projeto.livro.Model.repository.LivroRepository;
import com.br.edu.ufersa.pw.projeto.review.API.dto.InputReviewDTO;
import com.br.edu.ufersa.pw.projeto.review.API.dto.ReturnReviewDTO;
import com.br.edu.ufersa.pw.projeto.review.Model.entity.Review;
import com.br.edu.ufersa.pw.projeto.review.Model.repository.ReviewRepository;
import com.br.edu.ufersa.pw.projeto.user.Model.entity.User;
import com.br.edu.ufersa.pw.projeto.user.Model.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LivroRepository livroRepository;

    // Criar uma nova review
    public ReturnReviewDTO criarReview(Long userId, Long livroId, InputReviewDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Livro livro = livroRepository.findById(livroId)
                .orElseThrow(() -> new RuntimeException("Livro não encontrado"));

        // Verifica se o usuário já fez review desse livro
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

    public ReturnReviewDTO atualizarReview(Long reviewId, Long userId, InputReviewDTO dto) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review não encontrada"));

        // Garante que só o dono pode editar
        if (!review.getUser().getId().equals(userId)) {
            throw new RuntimeException("Você não pode editar a review de outro usuário!");
        }

        review.setReview(dto.getReview());
        review.setNota(dto.getNota());
        Review atualizada = reviewRepository.save(review);

        return new ReturnReviewDTO(atualizada);
    }

    // Deletar review
    public void deletarReview(Long reviewId, Long userId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review não encontrada"));

        if (!review.getUser().getId().equals(userId)) {
            throw new RuntimeException("Você não pode deletar a review de outro usuário!");
        }

        reviewRepository.delete(review);
    }
}
