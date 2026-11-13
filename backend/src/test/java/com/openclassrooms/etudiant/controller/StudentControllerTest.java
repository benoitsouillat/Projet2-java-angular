package com.openclassrooms.etudiant.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.etudiant.dto.student.CreateDTO;
import com.openclassrooms.etudiant.dto.student.DeleteDTO;
import com.openclassrooms.etudiant.dto.student.UpdateDTO;
import com.openclassrooms.etudiant.entities.User;
import com.openclassrooms.etudiant.repository.UserRepository;
import com.openclassrooms.etudiant.service.JwtService;
import com.openclassrooms.etudiant.service.UserService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItems;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@Testcontainers
public class StudentControllerTest {

    private static final String FIRST_NAME = "John";
    private static final String LAST_NAME = "Doe";
    private static final String LOGIN = "john@doe.com";

    @Container
    static MySQLContainer mySQLContainer = new MySQLContainer("mysql:8.4");

    @Autowired
    private UserService userService;
    @Autowired
    private JwtService jwtService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private MockMvc mockMvc;

    // Header "Authorization" d'un utilisateur connecté (les routes /api/student le demandent)
    private String authorization;

    @DynamicPropertySource
    static void configureTestProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", () -> mySQLContainer.getJdbcUrl());
        registry.add("spring.datasource.username", () -> mySQLContainer.getUsername());
        registry.add("spring.datasource.password", () -> mySQLContainer.getPassword());
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "create");
    }

    @BeforeEach
    public void beforeEach() {
        User admin = new User();
        admin.setFirstName("Admin");
        admin.setLastName("Admin");
        admin.setLogin("admin@library.com");
        admin.setPassword("password");
        userService.register(admin);
        authorization = "Bearer " + jwtService.generateToken(admin);
    }

    @AfterEach
    public void afterEach() {
        userRepository.deleteAll();
    }

    private ResultActions post(String url, Object body) throws Exception {
        return mockMvc.perform(MockMvcRequestBuilders.post(url)
                        .header("Authorization", authorization)
                        .content(objectMapper.writeValueAsString(body))
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print());
    }

    private CreateDTO createDTO(String login) {
        CreateDTO createDTO = new CreateDTO();
        createDTO.setFirstName(FIRST_NAME);
        createDTO.setLastName(LAST_NAME);
        createDTO.setLogin(login);
        return createDTO;
    }

    private User saveStudent(String login) {
        User student = new User();
        student.setFirstName(FIRST_NAME);
        student.setLastName(LAST_NAME);
        student.setLogin(login);
        student.setPassword("PASSWORDHAVETOBECHANGED");
        return userRepository.save(student);
    }

    // ---------- Création ----------
    @Test
    public void createStudentWithoutRequiredData() throws Exception {
        post("/api/student", new CreateDTO())
                .andExpect(MockMvcResultMatchers.status().isBadRequest());
    }

    @Test
    public void createAlreadyExistStudent() throws Exception {
        // GIVEN
        saveStudent(LOGIN);

        // WHEN / THEN
        post("/api/student", createDTO(LOGIN))
                .andExpect(MockMvcResultMatchers.status().isBadRequest());
    }

    @Test
    public void createStudentSuccessful() throws Exception {
        post("/api/student", createDTO(LOGIN))
                .andExpect(MockMvcResultMatchers.status().isCreated())
                .andExpect(MockMvcResultMatchers.jsonPath("$.message")
                        .value("User " + LOGIN + " was created successfully"));

        // L'étudiant est bien en base de données
        assertThat(userRepository.findByLogin(LOGIN)).isPresent();
    }

    // ---------- Edition ----------

    @Test
    public void updateStudentWithoutRequiredData() throws Exception {
        // L'id est obligatoire dans UpdateDTO
        post("/api/student/update", new UpdateDTO())
                .andExpect(MockMvcResultMatchers.status().isBadRequest());
    }

    @Test
    public void updateStudentName() throws Exception {
        // GIVEN
        User student = saveStudent(LOGIN);
        UpdateDTO updateDTO = new UpdateDTO();
        updateDTO.setId(student.getId());
        updateDTO.setFirstName("Jane");
        updateDTO.setLastName("Smith");

        // WHEN
        post("/api/student/update", updateDTO)
                .andExpect(MockMvcResultMatchers.status().isOk());

        // THEN
        User updatedStudent = userRepository.findById(student.getId()).orElseThrow();
        assertThat(updatedStudent.getFirstName()).isEqualTo("Jane");
        assertThat(updatedStudent.getLastName()).isEqualTo("Smith");
    }

    @Test
    public void updateStudentPasswordIsEncrypted() throws Exception {
        // GIVEN
        User student = saveStudent(LOGIN);
        UpdateDTO updateDTO = new UpdateDTO();
        updateDTO.setId(student.getId());
        updateDTO.setPassword("newpassword");

        // WHEN
        post("/api/student/update", updateDTO)
                .andExpect(MockMvcResultMatchers.status().isOk());

        // THEN
        String storedPassword = userRepository.findById(student.getId()).orElseThrow().getPassword();
        // Le mot de passe est crypté...
        assertThat(storedPassword).isNotEqualTo("newpassword");
        // ... et l'empreinte correspond bien au mot de passe saisi
        assertThat(passwordEncoder.matches("newpassword", storedPassword)).isTrue();
    }

    // ---------- Suppression ----------

    @Test
    public void deleteStudent() throws Exception {
        // GIVEN
        User student = saveStudent(LOGIN);
        DeleteDTO deleteDTO = new DeleteDTO();
        deleteDTO.setId(student.getId());

        // WHEN
        post("/api/student/delete", deleteDTO)
                .andExpect(MockMvcResultMatchers.status().isOk());

        // THEN
        assertThat(userRepository.findById(student.getId())).isEmpty();
    }

    // ---------- Liste ----------

    @Test
    public void getAllStudents() throws Exception {
        // GIVEN
        saveStudent("john@doe.com");
        saveStudent("jane@doe.com");

        // WHEN / THEN (la liste contient aussi l'admin créé dans beforeEach)
        mockMvc.perform(MockMvcRequestBuilders.post("/api/users")
                        .header("Authorization", authorization)
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.length()").value(3))
                .andExpect(MockMvcResultMatchers.jsonPath("$[*].login")
                        .value(hasItems("john@doe.com", "jane@doe.com")));
    }
}
