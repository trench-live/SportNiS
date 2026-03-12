package com.sportnis.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.POST, "/api/v1/auth/register", "/api/v1/auth/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/auth/logout").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/auth/me").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/v1/listings/my", "/api/v1/listings/my/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/v1/listings", "/api/v1/listings/my/*/archive", "/api/v1/listings/my/*/close").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/v1/listings/my/*").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/v1/listings", "/api/v1/listings/*").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/profiles/my").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/v1/profiles/me", "/api/v1/profiles/me/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/v1/profiles", "/api/v1/profiles/me/switch", "/api/v1/profiles/*/clear").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/v1/profiles/me", "/api/v1/profiles/me/**").authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/profiles/me/privacy").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/v1/profiles/*").permitAll()
                        .requestMatchers(HttpMethod.GET, "/actuator/health", "/actuator/health/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/livez", "/readyz").permitAll()
                        .requestMatchers(HttpMethod.GET, "/v3/api-docs", "/v3/api-docs/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/swagger-ui.html", "/swagger-ui/**").permitAll()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .cors(Customizer.withDefaults())
                .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
