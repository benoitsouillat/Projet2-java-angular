import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { createDTO } from "../DTO/Student/createDTO";
import { updateDTO } from "../DTO/Student/updateDTO";
@Injectable({
  providedIn: 'root'
})
export class StudentService {

  constructor(
      private httpClient: HttpClient
  ) {
  }

  createStudent(student: createDTO, token: string) {
    return this.httpClient.post('/api/student', student, {headers: {authorization: token}});
  }

  /** TODO : Utiliser PUT pour mettre à jour que certaines données ou post pour structurer la requête ?? */
  updateStudent(student: updateDTO, token: string) {
    return this.httpClient.post('/api/student/update', student, {headers: {authorization: token}});
  }

  deleteStudent(studentId: number, token: string) {
    return this.httpClient.post(`/api/student/delete`, {id: studentId}, {headers: {authorization: token}});
  }

}
