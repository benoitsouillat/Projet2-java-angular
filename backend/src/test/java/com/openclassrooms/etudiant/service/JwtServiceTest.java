package com.openclassrooms.etudiant.service;

import com.nimbusds.jose.jwk.source.ImmutableSecret;
import com.openclassrooms.etudiant.entities.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.util.HexFormat;

import static org.assertj.core.api.Assertions.assertThat;

public class JwtServiceTest {
    // Même format de clé que dans application.yml (hexadécimal, 256 bits)
    private static final String SECRET = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
    private static final String LOGIN = "john@doe.com";

    private JwtService jwtService;
    private User user;

    @BeforeEach
    public void setUp() {
        // On construit l'encodeur/décodeur comme dans SpringSecurityConfig, sans démarrer Spring
        SecretKey secretKey = new SecretKeySpec(HexFormat.of().parseHex(SECRET), "HmacSHA256");
        JwtEncoder jwtEncoder = new NimbusJwtEncoder(new ImmutableSecret<>(secretKey));
        JwtDecoder jwtDecoder = NimbusJwtDecoder.withSecretKey(secretKey).macAlgorithm(MacAlgorithm.HS256).build();
        jwtService = new JwtService(jwtEncoder, jwtDecoder);

        user = new User();
        user.setLogin(LOGIN);
        user.setPassword("password");
    }

    // La génération d'un token est bien effectuée
    @Test
    public void test_generate_token() {
        // WHEN
        String token = jwtService.generateToken(user);

        // THEN
        assertThat(token).isNotBlank();
        // Un JWT est composé de 3 parties séparées par des points : header.payload.signature
        assertThat(token.split("\\.")).hasSize(3);
    }

    // On retrouve le bon utilisateur à partir du token
    @Test
    public void test_extract_username_from_token() {
        // GIVEN
        String token = jwtService.generateToken(user);

        // WHEN
        String username = jwtService.extractUsername(token);

        // THEN
        assertThat(username).isEqualTo(LOGIN);
    }

    // Validation d'un token valide et d'une chaîne invalide
    @Test
    public void test_validate_token() {
        // GIVEN
        String validToken = jwtService.generateToken(user);
        String invalidToken = "this.is.not-a-valid-token";

        // THEN
        assertThat(jwtService.validateToken(validToken)).isTrue();
        assertThat(jwtService.validateToken(invalidToken)).isFalse();
    }
}
