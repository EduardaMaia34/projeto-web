package com.br.edu.ufersa.pw.projeto.biblioteca.Service;

import com.br.edu.ufersa.pw.projeto.biblioteca.API.dto.InputBibliotecaDTO;
import com.br.edu.ufersa.pw.projeto.biblioteca.API.dto.ReturnBibliotecaDTO;
import com.br.edu.ufersa.pw.projeto.biblioteca.Model.entity.Biblioteca;
import com.br.edu.ufersa.pw.projeto.biblioteca.Model.repository.BibliotecaRepository;
import com.br.edu.ufersa.pw.projeto.review.Model.repository.ReviewRepository;
import com.br.edu.ufersa.pw.projeto.user.Model.entity.Estado;
import com.br.edu.ufersa.pw.projeto.user.Model.entity.User;
import com.br.edu.ufersa.pw.projeto.user.Service.UserService;
import com.br.edu.ufersa.pw.projeto.livro.Service.LivroService;
import com.br.edu.ufersa.pw.projeto.livro.API.dto.ReturnLivroDTO;
import com.br.edu.ufersa.pw.projeto.livro.Model.entity.Livro;
import com.br.edu.ufersa.pw.projeto.review.Model.entity.Review;
import com.br.edu.ufersa.pw.projeto.user.API.dto.ReturnUserStatsDTO;
import java.time.Year;

import org.hibernate.validator.internal.util.stereotypes.Lazy;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.NoSuchElementException;

@Service
public class BibliotecaService {

    private final BibliotecaRepository bibliotecaRepository;
    private final UserService userService;
    private final ReviewRepository reviewRepository;
    private final LivroService livroService;

    public BibliotecaService(BibliotecaRepository bibliotecaRepository, UserService userService, ReviewRepository reviewRepository, LivroService livroService) {
        this.bibliotecaRepository = bibliotecaRepository;
        this.userService = userService;
        this.reviewRepository = reviewRepository;
        this.livroService = livroService;
    }

    private ReturnBibliotecaDTO mapToReturnDTO(Biblioteca biblioteca) {
        ReturnBibliotecaDTO dto = new ReturnBibliotecaDTO(biblioteca);

        try {
            Long livroId = Long.valueOf(biblioteca.getLivroId());

            // 1. Mapeia Livro (para título/capa)
            Livro livroEntity = livroService.findLivroEntityById(livroId);
            ReturnLivroDTO livroDTO = livroService.toReturnLivroDTO(livroEntity);
            dto.setLivro(livroDTO);

            // 2. Mapeia a Nota da Review
            Optional<Review> review = reviewRepository.findByUserIdAndLivroId(biblioteca.getUser().getId(), livroId);

            review.ifPresent(r -> {
                dto.setNota(r.getNota());
            });

        } catch (NoSuchElementException e) {
            System.err.println("Livro com ID " + biblioteca.getLivroId() + " referenciado na biblioteca, mas não encontrado.");
        } catch (NumberFormatException e) {
            System.err.println("livroId inválido: " + biblioteca.getLivroId());
        }

        return dto;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public ReturnBibliotecaDTO adicionarLivro(Long userId, InputBibliotecaDTO inputDTO) {

        String livroId = inputDTO.getLivroId();

        Optional<Biblioteca> existingEntry = bibliotecaRepository.findByUserIdAndLivroId(userId, livroId);
        if (existingEntry.isPresent()) {
            throw new IllegalStateException("O filme com ID " + livroId + " já está na sua biblioteca (watchlist).");
        }

        User user = userService.findById(userId)
                .orElseThrow(() -> new IllegalStateException("Usuário não encontrado."));

        Biblioteca novaEntrada = new Biblioteca(user, livroId);
        if (inputDTO.getStatus() != null) {
            novaEntrada.setStatus(inputDTO.getStatus());
        }

        Biblioteca savedEntrada = bibliotecaRepository.save(novaEntrada);

        return mapToReturnDTO(savedEntrada);
    }

    public Page<ReturnBibliotecaDTO> getEstanteComReview(Long userId, Pageable pageable) {
        Page<Biblioteca> lidosPage = bibliotecaRepository.findByUserIdAndStatusOrderByAddedAtDesc(
                userId, Estado.LIDO, pageable
        );

        List<ReturnBibliotecaDTO> listaComReview = lidosPage.stream()
                .map(biblioteca -> {

                    Long livroIdLong;
                    try {
                        livroIdLong = Long.valueOf(biblioteca.getLivroId());
                    } catch (NumberFormatException e) {
                        return null;
                    }

                    boolean hasReview = reviewRepository.existsByUserIdAndLivroId(userId, livroIdLong);

                    if (hasReview) {
                        return mapToReturnDTO(biblioteca);
                    }
                    return null;
                })
                .filter(dto -> dto != null)
                .collect(Collectors.toList());

        return new PageImpl<>(listaComReview, pageable, lidosPage.getTotalElements());
    }

    public Estado getStatusLivro(Long userId, String livroId) {
        return bibliotecaRepository
                .findByUserIdAndLivroId(userId, livroId)
                .map(Biblioteca::getStatus)
                .orElse(null);
    }


    @Transactional
    public boolean removerLivro(Long userId, String livroId) {

        Optional<Biblioteca> entry = bibliotecaRepository.findByUserIdAndLivroId(userId, livroId);

        if (entry.isPresent()) {
            bibliotecaRepository.deleteByUserIdAndLivroId(userId, livroId);
            return true;
        }

        return false;
    }

    public Page<ReturnBibliotecaDTO> getWatchlistPorUsuario(Long userId, Pageable pageable) {
        // Altera a chamada do repositório para buscar pelo Status = PARA_LER
        Page<Biblioteca> bibliotecaPage = bibliotecaRepository.findByUserIdAndStatusOrderByAddedAtDesc(
                userId,
                Estado.QUERO_LER,
                pageable
        );

        return bibliotecaPage.map(this::mapToReturnDTO);
    }

    public Optional<ReturnBibliotecaDTO> findEntryByUserIdAndLivroId(Long userId, String livroId) {
        return bibliotecaRepository.findByUserIdAndLivroId(userId, livroId)
                .map(this::mapToReturnDTO);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public ReturnBibliotecaDTO updateLivroStatus(Long userId, String livroId, Estado newStatus) {

        Biblioteca biblioteca = bibliotecaRepository.findByUserIdAndLivroId(userId, livroId)
                .orElseThrow(() -> new IllegalStateException("Livro não encontrado na sua biblioteca."));


        biblioteca.setStatus(newStatus);

        Biblioteca updatedEntrada = bibliotecaRepository.save(biblioteca);

        return mapToReturnDTO(updatedEntrada);
    }

    public ReturnUserStatsDTO calculateUserStatistics(Long userId) {

        long totalSalvos = bibliotecaRepository.countByUserIdAndStatus(userId, Estado.QUERO_LER);

        long totalLidos = bibliotecaRepository.countByUserIdAndStatus(userId, Estado.LIDO);

        List<Review> reviewsDoUsuario = reviewRepository.findByUserId(userId);
        int anoAtual = Year.now().getValue();

        long lidosEsteAno = reviewsDoUsuario.stream()
                .filter(review -> review.getData() != null && review.getData().getYear() == anoAtual)
                .count();

        return new ReturnUserStatsDTO(totalLidos, lidosEsteAno, totalSalvos);
    }
}