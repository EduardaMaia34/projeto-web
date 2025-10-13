package com.br.edu.ufersa.pw.projeto.livro.Service;

import com.br.edu.ufersa.pw.projeto.livro.Model.entity.Livro;
import com.br.edu.ufersa.pw.projeto.livro.Model.repository.LivroRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

// A anotação @Service marca esta classe como um componente de serviço
// do Spring, permitindo sua injeção de dependência em Controllers.
@Service
public class LivroService {

    // Injeção de Dependência: O Service precisa do Repository para interagir com o DB.
    private final LivroRepository livroRepository;

    // Injeção via construtor é a prática recomendada.
    @Autowired
    public LivroService(LivroRepository livroRepository) {
        this.livroRepository = livroRepository;
    }

    // --- MÉTODOS DE LÓGICA DE NEGÓCIOS E CRUD ---

    /**
     * Lógica: Salva um novo livro ou atualiza um existente.
     * Inclui validação de unicidade (regra de negócio).
     */
    public Livro criarOuAtualizar(Livro livro) {
        // Exemplo de Regra de Negócio: Impedir livros duplicados (Título e Autor)
        if (livro.getId() == null && livroRepository.existsByTituloAndAutor(livro.getTitulo(), livro.getAutor())) {
            // Lançar uma exceção de negócio para o Controller tratar
            throw new IllegalArgumentException("Já existe um livro com o mesmo Título e Autor.");
        }

        // Chamada ao Repository para a persistência real
        return livroRepository.save(livro);
    }

    /**
     * Retorna todos os livros.
     */
    public List<Livro> buscarTodos() {
        return livroRepository.findAll();
    }

    /**
     * Busca um livro pelo ID.
     * Retorna um Optional<Livro> para indicar que o livro pode não existir.
     */
    public Optional<Livro> buscarPorId(Long id) {
        return livroRepository.findById(id);
    }

    /**
     * Busca livros por parte do título (usando o Query Method personalizado).
     */
    public List<Livro> buscarPorTitulo(String titulo) {
        return livroRepository.findByTituloContainingIgnoreCase(titulo);
    }

    /**
     * Lógica: Exclui um livro, mas primeiro verifica se ele existe.
     */
    public void deletarLivro(Long id) {
        if (!livroRepository.existsById(id)) {
            // Lançar uma exceção de negócio se o recurso não for encontrado.
            throw new IllegalArgumentException("Livro com o ID " + id + " não encontrado para exclusão.");
        }
        livroRepository.deleteById(id);
    }
}