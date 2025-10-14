package com.br.edu.ufersa.pw.projeto.biblioteca.Service;

import com.br.edu.ufersa.pw.projeto.biblioteca.API.dto.InputBibliotecaDTO;
import com.br.edu.ufersa.pw.projeto.biblioteca.API.dto.ReturnBibliotecaDTO;
import com.br.edu.ufersa.pw.projeto.biblioteca.Model.entity.Biblioteca;
import com.br.edu.ufersa.pw.projeto.biblioteca.Model.repository.BibliotecaRepository;
import com.br.edu.ufersa.pw.projeto.review.Model.repository.ReviewRepository;
import com.br.edu.ufersa.pw.projeto.user.Model.entity.Estado;
import com.br.edu.ufersa.pw.projeto.user.Model.entity.User;
import com.br.edu.ufersa.pw.projeto.user.Service.UserService;
// Importação removida, use a do Spring
// import jakarta.transaction.Transactional;
import org.springframework.transaction.annotation.Transactional; // ⬅️ USAR ESTE IMPORT
import org.springframework.transaction.annotation.Propagation; // ⬅️ NOVO IMPORT

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BibliotecaService {

    private final BibliotecaRepository bibliotecaRepository;
    private final UserService userService;
    private final ReviewRepository reviewRepository;


    public BibliotecaService(BibliotecaRepository bibliotecaRepository, UserService userService, ReviewRepository reviewRepository) {
        this.bibliotecaRepository = bibliotecaRepository;
        this.userService = userService;
        this.reviewRepository = reviewRepository;
    }

    // ⬅️ CORREÇÃO: Transação isolada para que falhas aqui não afetem a transação da Review
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public ReturnBibliotecaDTO adicionarLivro(Long userId, InputBibliotecaDTO inputDTO) { //

        String livroId = inputDTO.getLivroId();

        // 1. Regra de Negócio: Verificar se o filme já está na Watchlist
        Optional<Biblioteca> existingEntry = bibliotecaRepository.findByUserIdAndLivroId(userId, livroId);
        if (existingEntry.isPresent()) {
            throw new IllegalStateException("O filme com ID " + livroId + " já está na sua biblioteca (watchlist).");
        }

        // 2. Buscar a Entidade User (Opcional, mas necessário para a relação @ManyToOne)
        User user = userService.findById(userId)
                .orElseThrow(() -> new IllegalStateException("Usuário não encontrado."));

        // 3. Converter DTO para Entidade e Salvar
        Biblioteca novaEntrada = new Biblioteca(user, livroId);
        if (inputDTO.getStatus() != null) {
            novaEntrada.setStatus(inputDTO.getStatus());
        }

        Biblioteca savedEntrada = bibliotecaRepository.save(novaEntrada);

        // 4. Converter Entidade Salva para DTO de Retorno
        return new ReturnBibliotecaDTO(savedEntrada);
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
                        return new ReturnBibliotecaDTO(biblioteca);
                    }
                    return null;
                })
                .filter(dto -> dto != null)
                .collect(Collectors.toList());

        return new PageImpl<>(listaComReview, pageable, lidosPage.getTotalElements());
    }

    @Transactional // Mantido para operações de deleção
    public boolean removerLivro(Long userId, String livroId) {

        // 1. Verificar se a entrada existe antes de tentar deletar
        Optional<Biblioteca> entry = bibliotecaRepository.findByUserIdAndLivroId(userId, livroId);

        if (entry.isPresent()) {
            // 2. Usar o método de exclusão personalizado do Repository
            bibliotecaRepository.deleteByUserIdAndLivroId(userId, livroId);
            return true;
        }

        return false;
    }


    public Page<ReturnBibliotecaDTO> getWatchlistPorUsuario(Long userId, Pageable pageable) {

        // 1. Buscar a lista paginada do repositório
        Page<Biblioteca> bibliotecaPage = bibliotecaRepository.findByUserIdOrderByAddedAtDesc(userId, pageable);

        // 2. Converter a Page de Entidades para Page de DTOs
        // O método 'map' de Page é a forma idiomática de fazer isso no Spring Data
        return bibliotecaPage.map(ReturnBibliotecaDTO::new);
    }


    public Optional<ReturnBibliotecaDTO> findEntryByUserIdAndLivroId(Long userId, String livroId) {
        return bibliotecaRepository.findByUserIdAndLivroId(userId, livroId)
                .map(ReturnBibliotecaDTO::new); // Converte a Entidade para DTO se existir
    }

    // ⬅️ CORREÇÃO: Transação isolada para que falhas aqui não afetem a transação da Review
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public ReturnBibliotecaDTO updateLivroStatus(Long userId, String livroId, Estado newStatus) { //

        Biblioteca biblioteca = bibliotecaRepository.findByUserIdAndLivroId(userId, livroId)
                .orElseThrow(() -> new IllegalStateException("Livro não encontrado na sua biblioteca."));


        biblioteca.setStatus(newStatus);

        Biblioteca updatedEntrada = bibliotecaRepository.save(biblioteca);

        return new ReturnBibliotecaDTO(updatedEntrada);
    }
}