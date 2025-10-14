package com.br.edu.ufersa.pw.projeto.config;

import com.br.edu.ufersa.pw.projeto.user.Model.entity.Interesse;
import com.br.edu.ufersa.pw.projeto.user.Model.repository.InteresseRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initInteresses(InteresseRepository interesseRepository) {
        return args -> {
            List<String> nomes = List.of(
                    "Ficção Científica",
                    "Romance",
                    "Mistério",
                    "Fantasia",
                    "Terror",
                    "Suspense",
                    "Aventura",
                    "História",
                    "Biografia",
                    "Tecnologia",
                    "Psicologia",
                    "LGBTQIA+"
            );

            for (String nome : nomes) {
                if (!interesseRepository.existsByNome(nome)) {
                    interesseRepository.save(new Interesse(nome));
                }
            }
        };
    }
}
