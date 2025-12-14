package com.br.edu.ufersa.pw.projeto.Security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.beans.factory.annotation.Qualifier;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtAuthenticationFilter jwtFilter) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // --- Rotas Públicas ---
                        .requestMatchers("/").permitAll()
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/users").permitAll() // Criar conta

                        // FEED
                        .requestMatchers(HttpMethod.GET, "/api/v1/home").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/feed").permitAll()

                        // --- INTERESSES (NOVO) ---
                        // GET: Permitir que qualquer um veja as tags (útil para busca/cadastro)
                        .requestMatchers(HttpMethod.GET, "/api/v1/interesses").permitAll()
                        // POST: Apenas usuários logados podem criar tags
                        .requestMatchers(HttpMethod.POST, "/api/v1/interesses").authenticated()
                        // -------------------------

                        // Livros - Leitura pública
                        .requestMatchers(HttpMethod.GET, "/api/v1/livros").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/livros/**").permitAll()

                        // Users
                        .requestMatchers(HttpMethod.GET, "/api/v1/users").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/api/v1/users/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/v1/users/**").permitAll()
                        // Reviews - Leitura pública
                        .requestMatchers(HttpMethod.GET, "/api/v1/reviews").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/reviews/**").permitAll()

                        // Biblioteca Pública (Estante de outros usuários)
                        .requestMatchers(HttpMethod.GET, "/api/v1/biblioteca/users/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/biblioteca").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/biblioteca/{livroId}/status").authenticated()
                        // --- Rotas Protegidas (USER ou ADMIN) ---

                        // Favoritos
                        .requestMatchers(HttpMethod.POST, "/api/v1/users/favoritos/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/users/favoritos/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/v1/users/favoritos/**").permitAll()

                        // Reviews - Ações
                        .requestMatchers(HttpMethod.POST, "/api/v1/reviews/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/reviews/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/reviews/**").hasAnyRole("USER", "ADMIN")


                        // Biblioteca Pessoal (Minha estante)
                        .requestMatchers(HttpMethod.POST, "/api/v1/biblioteca").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/biblioteca/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/v1/biblioteca/estante").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/biblioteca/estante/users/**").permitAll()


                        // Social (Seguir/Deixar de seguir)
                        .requestMatchers(HttpMethod.POST, "/api/v1/users/seguir/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/users/deixarDeSeguir/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/v1/users/seguindo").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/v1/users/seguidores").hasAnyRole("USER", "ADMIN")

                        // Delete User
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/users/**").hasAnyRole("USER", "ADMIN")

                        // --- Rotas de ADMIN ---
                        .requestMatchers(HttpMethod.POST, "/api/v1/livros").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/livros/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/livros/**").hasRole("ADMIN")

                        // Qualquer outra requisição precisa estar autenticada
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:3000",
                "http://127.0.0.1:3000",
                "https://SEU-FRONTEND-DOMINIO.koyeb.app" // Ajuste para produção se necessário
        ));

        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(Arrays.asList("Authorization"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider(@Qualifier("userService") UserDetailsService userDetailsService) {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}