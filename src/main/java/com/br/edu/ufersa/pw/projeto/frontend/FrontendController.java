package com.br.edu.ufersa.pw.projeto.frontend; // Mude o pacote conforme a sua estrutura

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class FrontendController {

    // Este mapeamento captura todas as rotas que não são rotas de API
    // e as encaminha para o 'index.html', permitindo que o React lide com o roteamento.
    // O regex evita que ele intercepte arquivos que possuem extensão (como .css, .js).
    @RequestMapping(value = "/{path:[^\\.]*}")
    public String redirect() {
        return "forward:/index.html";
    }
}