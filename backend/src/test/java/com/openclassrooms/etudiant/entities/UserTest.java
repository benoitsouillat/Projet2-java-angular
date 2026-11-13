package com.openclassrooms.etudiant.entities;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

public class UserTest {
    private static final String LOGIN = "john@doe.com";
    private static final String PASSWORD = "password";

    private User createUser() {
        User user = new User();
        user.setFirstName("John");
        user.setLastName("Doe");
        user.setLogin(LOGIN);
        user.setPassword(PASSWORD);
        return user;
    }

    // Spring Security utilise getUsername() : il doit renvoyer le login (email)
    @Test
    public void test_get_username_returns_login() {
        assertThat(createUser().getUsername()).isEqualTo(LOGIN);
    }

    @Test
    public void test_get_password() {
        assertThat(createUser().getPassword()).isEqualTo(PASSWORD);
    }

    @Test
    public void test_user_has_no_authorities() {
        assertThat(createUser().getAuthorities()).isEmpty();
    }

    // Le compte est toujours actif (pas de gestion d'expiration ou de blocage pour l'instant)
    @Test
    public void test_account_is_always_active() {
        User user = createUser();

        assertThat(user.isAccountNonExpired()).isTrue();
        assertThat(user.isAccountNonLocked()).isTrue();
        assertThat(user.isCredentialsNonExpired()).isTrue();
        assertThat(user.isEnabled()).isTrue();
    }
}
