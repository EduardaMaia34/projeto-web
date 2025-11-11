package com.br.edu.ufersa.pw.projeto.View.controller;
import com.br.edu.ufersa.pw.projeto.user.API.dto.InputUserDTO;
import com.br.edu.ufersa.pw.projeto.user.Service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
public class ViewController {

    @Autowired
    private UserService userService;

    @GetMapping("/login")
    public String showLoginPage() {
        return "login-form"; // Retorna o template 'login-form.html' (assumindo que ele está em src/main/resources/templates/)
    }

    @GetMapping("/register")
    public String showRegisterPage() {
        return "cadastro"; // Retorna o template 'cadastro.html'
    }

    @PostMapping("/register") // O formulário deve submeter para esta URL
    public String handleRegistration(@Valid @ModelAttribute("user") InputUserDTO dto,
                                     RedirectAttributes ra) {
        try {
            userService.save(dto); // Chama o Service que salva e criptografa
            ra.addFlashAttribute("successMessage", "Conta criada com sucesso! Faça login abaixo.");
            return "redirect:/login";
        } catch (IllegalStateException e) {
            // Se o email já estiver em uso ou outra regra de negócio falhar
            ra.addFlashAttribute("errorMessage", e.getMessage());
            return "redirect:/register"; // Volta para a página de cadastro
        }
    }

    @GetMapping("/")
    public String redirectToLogin() {
        return "redirect:/login"; // Redireciona o acesso à raiz para o formulário de login
    }

}
