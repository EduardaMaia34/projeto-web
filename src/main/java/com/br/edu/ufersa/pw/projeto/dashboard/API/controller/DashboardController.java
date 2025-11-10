package com.br.edu.ufersa.pw.projeto.dashboard.API.controller;

import com.br.edu.ufersa.pw.projeto.livro.Model.entity.Livro;
import com.br.edu.ufersa.pw.projeto.livro.Model.repository.LivroRepository;
import com.br.edu.ufersa.pw.projeto.livro.Service.LivroService;
import com.br.edu.ufersa.pw.projeto.user.Model.entity.User;
import org.springframework.security.core.annotation.AuthenticationPrincipal; // <-- Importação crucial
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@Controller
public class DashboardController {

    private final LivroRepository livroRepository;
    private final LivroService livroService;

    // Injeção de dependência
    public DashboardController(LivroRepository livroRepository, LivroService livroService) {
        this.livroRepository = livroRepository;
        this.livroService = livroService;
    }

    @GetMapping("/dashboard")
    // MUDANÇA: Usamos @AuthenticationPrincipal para obter o User Logado
    public String exibirDashboard(@AuthenticationPrincipal User userLogado, Model model) {

        // 1. Busca os livros "Famosos no Momento"
        List<Livro> famosos = livroRepository.findAll();

        // 2. Busca os livros "Entre seus Amigos" usando a lógica do Service
        // Garantir que o usuário esteja logado
        List<Livro> amigos = List.of();
        if (userLogado != null) {
            // CHAMADA AO NOVO MÉTODO
            amigos = livroService.buscarLivrosDeAmigos(userLogado.getId());
        }

        model.addAttribute("famosos", famosos);
        model.addAttribute("amigos", amigos);
        model.addAttribute("userName", userLogado != null ? userLogado.getNome() : "Visitante");


        return "dashboard-user";
    }
}