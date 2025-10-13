package com.br.edu.ufersa.pw.projeto.livro.API.controllers;

import com.br.edu.ufersa.pw.projeto.livro.API.dto.InputLivroDTO;
import com.br.edu.ufersa.pw.projeto.livro.API.dto.ReturnLivroDTO;
import com.br.edu.ufersa.pw.projeto.livro.Service.LivroService;
import com.br.edu.ufersa.pw.projeto.livro.Model.entity.Livro;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/livros")
public class LivroController {

    private final LivroService service; // Usamos 'final' para injeção via construtor

    @Autowired
    public LivroController(LivroService service){
        this.service = service;
    }

    // ----------------------------------------------------------------------
    // GET: Listar todos ou buscar por Título
    // Requisição: GET /api/v1/livros?titulo=nome
    // ----------------------------------------------------------------------
    @GetMapping()
    public ResponseEntity<List<ReturnLivroDTO>> list(
            @RequestParam(required = false) String titulo) {

        List<Livro> livros;

        if (titulo != null && !titulo.trim().isEmpty()) {
            // Usa o método personalizado do Service para buscar por título
            livros = service.buscarPorTitulo(titulo);
        } else {
            // Usa o método padrão do Service para listar todos
            livros = service.buscarTodos();
        }

        // Mapeia a lista de Entities para a lista de DTOs de Resposta
        List<ReturnLivroDTO> responseDTOs = livros.stream()
                .map(this::toReturnDTO)
                .collect(Collectors.toList());

        return new ResponseEntity<>(responseDTOs, HttpStatus.OK);
    }

    // ----------------------------------------------------------------------
    // GET: Buscar por ID
    // Requisição: GET /api/v1/livros/{id}
    // ----------------------------------------------------------------------
    @GetMapping("/{id}")
    public ResponseEntity<ReturnLivroDTO> getById(@PathVariable Long id) {
        Optional<Livro> livro = service.buscarPorId(id);

        return livro.map(this::toReturnDTO) // Se encontrar, mapeia para DTO
                .map(ResponseEntity::ok)     // Retorna 200 OK
                .orElse(ResponseEntity.notFound().build()); // Senão, retorna 404 Not Found
    }


    // ----------------------------------------------------------------------
    // POST: Criar novo livro
    // Requisição: POST /api/v1/livros
    // ----------------------------------------------------------------------
    @PostMapping()
    public ResponseEntity<ReturnLivroDTO> create(@Valid @RequestBody InputLivroDTO livroDTO){
        try {
            // 1. Mapeia DTO de Entrada para Entity
            Livro novoLivro = toEntity(livroDTO);

            // 2. Chama o Service para persistir (com lógica de negócio)
            Livro livroSalvo = service.criarOuAtualizar(novoLivro);

            // 3. Mapeia Entity Salva para DTO de Saída e retorna 201 CREATED
            return new ResponseEntity<>(toReturnDTO(livroSalvo), HttpStatus.CREATED);

        } catch (IllegalArgumentException e) {
            // Captura exceção de negócio (ex: livro duplicado)
            return new ResponseEntity(e.getMessage(), HttpStatus.BAD_REQUEST); // 400 Bad Request
        }
    }

    // ----------------------------------------------------------------------
    // DELETE: Remover por ID
    // Requisição: DELETE /api/v1/livros/{id}
    // ----------------------------------------------------------------------
    @DeleteMapping("/{id}")
    public ResponseEntity removeById(@PathVariable Long id) {
        try {
            service.deletarLivro(id);
            return ResponseEntity.noContent().build(); // 204 No Content (Sucesso sem retorno)
        } catch (IllegalArgumentException e) {
            // Captura exceção de livro não encontrado
            return new ResponseEntity(e.getMessage(), HttpStatus.NOT_FOUND); // 404 Not Found
        }
    }

    // ----------------------------------------------------------------------
    // PUT: Atualizar livro completo
    // Requisição: PUT /api/v1/livros/{id}
    // ----------------------------------------------------------------------
    @PutMapping("/{id}")
    public ResponseEntity<ReturnLivroDTO> update (@PathVariable Long id, @Valid @RequestBody InputLivroDTO livroDTO) {
        // Verifica se o livro a ser atualizado existe
        if (service.buscarPorId(id).isEmpty()) {
            return ResponseEntity.notFound().build(); // 404 Not Found
        }

        try {
            // 1. Mapeia DTO para Entity e define o ID para indicar atualização
            Livro livroAtualizado = toEntity(livroDTO);
            livroAtualizado.setId(id); // Essencial para o Hibernate saber que é uma atualização

            // 2. Chama o Service para persistir/atualizar
            Livro resultado = service.criarOuAtualizar(livroAtualizado);

            // 3. Retorna 200 OK
            return new ResponseEntity<>(toReturnDTO(resultado), HttpStatus.OK);

        } catch (IllegalArgumentException e) {
            // Caso a regra de unicidade seja violada durante a atualização
            return new ResponseEntity(e.getMessage(), HttpStatus.BAD_REQUEST); // 400 Bad Request
        }
    }

    // Removidos os métodos DELETE por Email, PUT sem ID e PATCH de senha,
    // pois não são operações padrão ou lógicas para a entidade Livro.


    // --- MÉTODOS PRIVADOS DE MAPEAMENTO (DTO <-> ENTITY) ---

    // Mapeia InputLivroDTO para Livro Entity
    private Livro toEntity(InputLivroDTO dto) {
        // Nota: A lógica de buscar Estilos por ID e adicioná-los ao Livro deve ser feita no Service
        // para garantir o carregamento correto das Entidades relacionadas.
        Livro livro = new Livro(dto.getTitulo(), dto.getAutor(), dto.getDescricao());
        // Aqui, você NÃO pode esquecer de buscar e associar os Estilos:
        // livro.setEstilos(estiloService.buscarEstilosPorIds(dto.getEstiloIds()));
        return livro;
    }

    // Mapeia Livro Entity para ReturnLivroDTO
    private ReturnLivroDTO toReturnDTO(Livro livro) {
        // Exemplo: Mapeamento de Livro para o DTO de Resposta
        // Nota: Garanta que o LivroResponseDto tenha os métodos get/set necessários
        ReturnLivroDTO dto = new ReturnLivroDTO();
        dto.setId(livro.getId());
        dto.setTitulo(livro.getTitulo());
        dto.setAutor(livro.getAutor());
        dto.setDescricao(livro.getDescricao());
        // Mapeie outros campos como dataCriacao e Estilos aqui:
        // dto.setDataCriacao(livro.getDataCriacao());
        // dto.setEstilos(livro.getEstilos().stream().map(e -> e.getNome()).collect(Collectors.toSet()));
        return dto;
    }
}