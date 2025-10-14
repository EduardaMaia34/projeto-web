package com.br.edu.ufersa.pw.projeto.biblioteca.Service;

import com.br.edu.ufersa.pw.projeto.biblioteca.API.dto.InputBibliotecaDTO;
import com.br.edu.ufersa.pw.projeto.biblioteca.API.dto.ReturnBibliotecaDTO;
import com.br.edu.ufersa.pw.projeto.biblioteca.Model.entity.Biblioteca;
import com.br.edu.ufersa.pw.projeto.biblioteca.Model.repository.BibliotecaRepository;
import com.br.edu.ufersa.pw.projeto.user.Model.entity.User;
import com.br.edu.ufersa.pw.projeto.user.Service.UserService;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class BibliotecaService {

    private final BibliotecaRepository bibliotecaRepository;
    private final UserService userService; // Para buscar o objeto User (se necessário)

    // Injeção de Dependências
    public BibliotecaService(BibliotecaRepository bibliotecaRepository, UserService userService) {
        this.bibliotecaRepository = bibliotecaRepository;
        this.userService = userService;
    }

    /**
     * Adiciona um filme à Watchlist do usuário.
     * Implementa a regra de negócio: não permitir filmes duplicados.
     *
     * @param userId O ID do usuário logado.
     * @param inputDTO DTO contendo o ID do filme.
     * @return O DTO da entrada da biblioteca criada.
     */
    @Transactional // Necessário para operações de escrita
    public ReturnBibliotecaDTO adicionarFilme(Long userId, InputBibliotecaDTO inputDTO) {

        String filmId = inputDTO.getFilmId();

        // 1. Regra de Negócio: Verificar se o filme já está na Watchlist
        Optional<Biblioteca> existingEntry = bibliotecaRepository.findByUserIdAndFilmId(userId, filmId);
        if (existingEntry.isPresent()) {
            throw new IllegalStateException("O filme com ID " + filmId + " já está na sua biblioteca (watchlist).");
        }

        // 2. Buscar a Entidade User (Opcional, mas necessário para a relação @ManyToOne)
        User user = userService.findById(userId)
                .orElseThrow(() -> new IllegalStateException("Usuário não encontrado."));

        // 3. Converter DTO para Entidade e Salvar
        Biblioteca novaEntrada = new Biblioteca(user, filmId);
        Biblioteca savedEntrada = bibliotecaRepository.save(novaEntrada);

        // 4. Converter Entidade Salva para DTO de Retorno
        return new ReturnBibliotecaDTO(savedEntrada);
    }

    /**
     * Remove um filme da Watchlist do usuário.
     *
     * @param userId O ID do usuário logado.
     * @param filmId O ID do filme a ser removido.
     * @return true se o filme foi removido com sucesso, false caso contrário.
     */
    @Transactional
    public boolean removerFilme(Long userId, String filmId) {

        // 1. Verificar se a entrada existe antes de tentar deletar
        Optional<Biblioteca> entry = bibliotecaRepository.findByUserIdAndFilmId(userId, filmId);

        if (entry.isPresent()) {
            // 2. Usar o método de exclusão personalizado do Repository
            bibliotecaRepository.deleteByUserIdAndFilmId(userId, filmId);
            return true;
        }

        return false;
    }

    /**
     * Busca a Watchlist de um usuário específico com paginação.
     *
     * @param userId O ID do usuário.
     * @param pageable Objeto para definir a página, tamanho e ordenação.
     * @return Uma página de DTOs da Watchlist.
     */
    public Page<ReturnBibliotecaDTO> getWatchlistPorUsuario(Long userId, Pageable pageable) {

        // 1. Buscar a lista paginada do repositório
        Page<Biblioteca> bibliotecaPage = bibliotecaRepository.findByUserIdOrderByAddedAtDesc(userId, pageable);

        // 2. Converter a Page de Entidades para Page de DTOs
        // O método 'map' de Page é a forma idiomática de fazer isso no Spring Data
        return bibliotecaPage.map(ReturnBibliotecaDTO::new);
    }

    /**
     * Busca uma única entrada da biblioteca (útil para verificar o status na UI).
     *
     * @param userId O ID do usuário.
     * @param filmId O ID do filme.
     * @return Um Optional contendo o DTO, se encontrado.
     */
    public Optional<ReturnBibliotecaDTO> findEntryByUserIdAndFilmId(Long userId, String filmId) {
        return bibliotecaRepository.findByUserIdAndFilmId(userId, filmId)
                .map(ReturnBibliotecaDTO::new); // Converte a Entidade para DTO se existir
    }
}