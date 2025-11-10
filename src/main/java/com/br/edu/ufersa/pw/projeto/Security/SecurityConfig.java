package com.br.edu.ufersa.pw.projeto.Security;

import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.*;
import org.springframework.security.config.http.SessionCreationPolicy; // Importação necessária
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.authentication.*;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Qualifier;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // Certifique-se de que o JwtAuthenticationFilter está injetado (mesmo que não usado)
    // Se ele for um bean, deve estar aqui ou você pode remover a injeção do método

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtAuthenticationFilter jwtFilter) throws Exception {
        http.csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth

                        // 1. Liberação Completa do Login, Registro e Estáticos
                        // O Spring Security lida com a submissão do formulário POST em /login automaticamente
                        // se o .formLogin().permitAll() estiver ativado.
                        .requestMatchers(
                                "/login",
                                "/register"
                        ).permitAll() // Libera GET/POST para /login e /register

                        .requestMatchers(
                                "/css/**",
                                "/js/**",
                                "/images/**",
                                "/webjars/**"
                        ).permitAll() // Libera arquivos estáticos

                        // 2. Liberação de Endpoints de API PÚBLICOS (ex: buscar livros sem estar logado)
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/v1/users").permitAll()

                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/v1/users").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/v1/livros").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/v1/livros/**").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/v1/reviews").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/v1/reviews/**").permitAll()

                        // 3. Endpoints Protegidos (requerem login)
                        .requestMatchers(
                                org.springframework.http.HttpMethod.GET, "/feed", "/feed/**", "/dashboard"
                        ).hasAnyRole("USER", "ADMIN")

                        // ... (Manter todas as outras regras de ROLE que você já tinha) ...
                        // Exemplo:
                        .requestMatchers(
                                org.springframework.http.HttpMethod.POST, "/api/v1/livros"
                        ).hasRole("ADMIN")

                        // 4. Todas as Outras Requisições
                        .anyRequest().authenticated()
                )

                // 5. Configuração do Form Login (Permitido)
                .formLogin(form -> form
                        .loginPage("/login") // O Spring usará essa URL para exibir o form
                        .permitAll() // Essencial: Libera o acesso à página de login e seu processamento POST
                        .defaultSuccessUrl("/dashboard", true)
                )
                .sessionManagement(session -> session
                        // Garante que o Spring CRIE a sessão se necessária (padrão para formLogin)
                        .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                )
                ;

        // 6. Gerenciamento de Sessão (IF_REQUIRED ou comente para o padrão)
        // Se você usar formLogin, não deve ser STATELESS. O padrão é IF_REQUIRED.
        // Para ter certeza, você pode comentar, ou deixar como IF_REQUIRED:
        // .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED));

        // 7. Filtro JWT COMENTADO (para usar Sessão)
        // .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        // Se você está usando formLogin, é bom remover o `sessionManagement` para usar o padrão
        // STATEFUL/IF_REQUIRED, garantindo que o Spring possa criar a sessão de login.
        // Eu removi, assumindo o comportamento padrão do Spring Security.

        return http.build();
    }

    // ... (Manter os Beans de AuthenticationProvider, AuthenticationManager e PasswordEncoder) ...

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