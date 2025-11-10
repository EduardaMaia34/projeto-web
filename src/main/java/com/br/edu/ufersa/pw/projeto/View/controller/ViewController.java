package com.br.edu.ufersa.pw.projeto.View.controller;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ViewController {
    @GetMapping("/login")
    public String showLoginPage() {
        return "login-form"; // Retorna o template 'login-form.html' (assumindo que ele está em src/main/resources/templates/)
    }

    @GetMapping("/register")
    public String showRegisterPage() {
        return "cadastro"; // Retorna o template 'cadastro.html'
    }

    @GetMapping("/")
    public String redirectToLogin() {
        return "redirect:/login"; // Redireciona o acesso à raiz para o formulário de login
    }
}
