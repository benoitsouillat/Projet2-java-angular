package com.openclassrooms.etudiant.service;

import com.openclassrooms.etudiant.dto.student.CreateDTO;
import com.openclassrooms.etudiant.dto.student.DeleteDTO;
import com.openclassrooms.etudiant.dto.student.UpdateDTO;
import com.openclassrooms.etudiant.entities.User;
import com.openclassrooms.etudiant.repository.UserRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(SpringExtension.class)
public class StudentServiceTest {
	private static final Long ID = 1L;
	private static final String FIRST_NAME = "John";
	private static final String LAST_NAME = "Doe";
	private static final String LOGIN = "john@doe.com";
	private static final String PASSWORD = "PASSWORDHAVETOBECHANGED";

	@Mock
	private UserRepository userRepository;
	@InjectMocks
	private StudentCrudService studentCrudService;

	private User createExistingStudent() {
		User student = new User();
		student.setId(ID);
		student.setFirstName(FIRST_NAME);
		student.setLastName(LAST_NAME);
		student.setLogin(LOGIN);
		student.setPassword(PASSWORD);
		return student;
	}

	// Création d'un étudiant avec des informations valides
	@Test
	public void test_create_student_with_valid_information() {
		// GIVEN
		CreateDTO studentDTO = new CreateDTO();
		studentDTO.setFirstName(FIRST_NAME);
		studentDTO.setLastName(LAST_NAME);
		studentDTO.setLogin(LOGIN);
		when(userRepository.findByLogin(LOGIN)).thenReturn(Optional.empty());
		// save() renvoie l'utilisateur qu'on lui donne (comme le ferait la BDD)
		when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

		// WHEN
		User createdStudent = studentCrudService.create(studentDTO);

		// THEN
		ArgumentCaptor<User> studentCaptor = ArgumentCaptor.forClass(User.class);
		verify(userRepository).save(studentCaptor.capture());
		assertThat(studentCaptor.getValue().getFirstName()).isEqualTo(FIRST_NAME);
		assertThat(studentCaptor.getValue().getLastName()).isEqualTo(LAST_NAME);
		assertThat(studentCaptor.getValue().getLogin()).isEqualTo(LOGIN);
		assertThat(createdStudent).isNotNull();
	}

	// Création d'un étudiant dont l'email existe déjà => exception
	@Test
	public void test_create_already_exist_student_throws_IllegalArgumentException() {
		// GIVEN
		CreateDTO studentDTO = new CreateDTO();
		studentDTO.setFirstName(FIRST_NAME);
		studentDTO.setLastName(LAST_NAME);
		studentDTO.setLogin(LOGIN);
		when(userRepository.findByLogin(LOGIN)).thenReturn(Optional.of(createExistingStudent()));

		// THEN
		Assertions.assertThrows(IllegalArgumentException.class,
				() -> studentCrudService.create(studentDTO));
		verify(userRepository, never()).save(any(User.class));
	}

	// Edition du nom d'un étudiant
	@Test
	public void test_update_student_name() {
		// GIVEN
		UpdateDTO studentDTO = new UpdateDTO();
		studentDTO.setId(ID);
		studentDTO.setFirstName("Jane");
		studentDTO.setLastName("Smith");
		when(userRepository.getReferenceById(ID)).thenReturn(createExistingStudent());
		when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

		// WHEN
		User updatedStudent = studentCrudService.update(studentDTO);

		// THEN
		assertThat(updatedStudent.getFirstName()).isEqualTo("Jane");
		assertThat(updatedStudent.getLastName()).isEqualTo("Smith");
		// Les champs non envoyés ne doivent pas changer
		assertThat(updatedStudent.getLogin()).isEqualTo(LOGIN);
		assertThat(updatedStudent.getPassword()).isEqualTo(PASSWORD);
	}

	// Edition de l'email d'un étudiant => l'email (identifiant) ne doit pas être modifié
	@Test
	public void test_update_student_login_is_not_changed() {
		// GIVEN
		UpdateDTO studentDTO = new UpdateDTO();
		studentDTO.setId(ID);
		studentDTO.setLogin("other@mail.com");
		when(userRepository.getReferenceById(ID)).thenReturn(createExistingStudent());
		when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

		// WHEN
		User updatedStudent = studentCrudService.update(studentDTO);

		// THEN
		assertThat(updatedStudent.getLogin()).isEqualTo(LOGIN);
	}

	// Suppression d'un étudiant existant
	@Test
	public void test_delete_existing_student() {
		// GIVEN
		User existingStudent = createExistingStudent();
		DeleteDTO deleteDTO = new DeleteDTO();
		deleteDTO.setId(ID);
		when(userRepository.getReferenceById(ID)).thenReturn(existingStudent);

		// WHEN
		boolean deleted = studentCrudService.delete(deleteDTO);

		// THEN
		assertThat(deleted).isTrue();
		verify(userRepository).delete(existingStudent);
	}
}
