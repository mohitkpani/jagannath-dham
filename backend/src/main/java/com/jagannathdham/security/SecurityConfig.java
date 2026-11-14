
package com.jagannathdham.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter) {

        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
            .csrf(AbstractHttpConfigurer::disable)

            .cors(Customizer.withDefaults())

            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )

            .exceptionHandling(exception -> exception

                // Missing authentication
                .authenticationEntryPoint((request, response, ex) -> {
                    response.sendError(
                        HttpStatus.UNAUTHORIZED.value(),
                        "Authentication required"
                    );
                })

                // Authenticated but insufficient permissions
                .accessDeniedHandler((request, response, ex) -> {
                    response.sendError(
                        HttpStatus.FORBIDDEN.value(),
                        "Access denied"
                    );
                })
            )

            .authorizeHttpRequests(auth -> auth

                // CORS preflight
                .requestMatchers(HttpMethod.OPTIONS, "/**")
                .permitAll()

                // Public endpoints
                .requestMatchers(
                    "/api/users/register",
                    "/api/users/login"
                ).permitAll()

                // Public actuator endpoints
                .requestMatchers(
                    "/actuator/health",
                    "/actuator/info"
                ).permitAll()

                // Admin user management
                .requestMatchers("/api/users/admin/**")
                .hasRole("ADMIN")

                // Admin dashboard
                .requestMatchers("/api/admin/**")
                .hasRole("ADMIN")

                // Admin booking management
                .requestMatchers(HttpMethod.GET, "/api/bookings")
                .hasRole("ADMIN")

                // Admin category management
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/categories/**"
                ).hasRole("ADMIN")

                .requestMatchers(
                    HttpMethod.PUT,
                    "/api/categories/**"
                ).hasRole("ADMIN")

                .requestMatchers(
                    HttpMethod.PATCH,
                    "/api/categories/**"
                ).hasRole("ADMIN")

                // Admin slot creation
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/darshan-slots/**"
                ).hasRole("ADMIN")

                // Admin email test
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/email-test"
                ).hasRole("ADMIN")

                // Admin destination management
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/destinations/**"
                ).hasRole("ADMIN")

                .requestMatchers(
                    HttpMethod.PUT,
                    "/api/destinations/**"
                ).hasRole("ADMIN")

                .requestMatchers(
                    HttpMethod.DELETE,
                    "/api/destinations/**"
                ).hasRole("ADMIN")

                // Staff QR verification
                .requestMatchers("/api/qr/**")
                .hasRole("STAFF")

                // Staff dashboard
                .requestMatchers("/api/staff/**")
                .hasRole("STAFF")

                // All remaining API endpoints require authentication
                .anyRequest().authenticated()
            )

            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}