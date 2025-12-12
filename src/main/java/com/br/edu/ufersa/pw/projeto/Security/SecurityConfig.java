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
                        .requestMatchers(HttpMethod.GET, "/api/v1/users").permitAll()  // Listar users (se for público)

                        // Livros - Leitura pública
                        .requestMatchers(HttpMethod.GET, "/api/v1/livros").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/livros/**").permitAll()

                        // Reviews - Leitura pública
                        .requestMatchers(HttpMethod.GET, "/api/v1/reviews").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/reviews/**").permitAll()

                        // Biblioteca Pública (Estante de outros usuários)
                        .requestMatchers(HttpMethod.GET, "/api/v1/biblioteca/users/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/biblioteca").permitAll() // Se listar geral for público

                        // --- Rotas Protegidas (USER ou ADMIN) ---
                        .requestMatchers(HttpMethod.GET, "/feed").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/feed/**").hasAnyRole("USER", "ADMIN")

                        // Reviews - Ações
                        .requestMatchers(HttpMethod.POST, "/api/v1/reviews/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/reviews/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/reviews/**").hasAnyRole("USER", "ADMIN")

                        // Biblioteca Pessoal (Minha estante)
                        .requestMatchers(HttpMethod.POST, "/api/v1/biblioteca").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/biblioteca/**").hasAnyRole("USER", "ADMIN") // Corrigido para exigir auth
                        .requestMatchers(HttpMethod.GET, "/api/v1/biblioteca/estante").hasAnyRole("USER", "ADMIN")

                        // Social (Seguir/Deixar de seguir)
                        .requestMatchers(HttpMethod.POST, "/api/v1/users/seguir/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/users/deixarDeSeguir/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/v1/users/seguindo").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/v1/users/seguidores").hasAnyRole("USER", "ADMIN")

                        // User self-delete (Cuidado: talvez o usuário só possa deletar a si mesmo, verifique a lógica no controller)
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

        // 🎯 AQUI ESTÁ A CORREÇÃO PRINCIPAL PARA O SEU ERRO DE FETCH
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:3000",       // Next.js padrão
                "http://127.0.0.1:3000",       // Node.js as vezes resolve para IP
                "https://SEU-FRONTEND-DOMINIO.koyeb.app" // Produção
        ));

        // Métodos permitidos
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));

        // Headers permitidos (Use "*" para evitar erros de headers faltantes no preflight)
        configuration.setAllowedHeaders(List.of("*"));

        // Expor headers (útil se você retornar o token no header e não no body)
        configuration.setExposedHeaders(Arrays.asList("Authorization"));

        // Importante para Cookies ou Auth Headers
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