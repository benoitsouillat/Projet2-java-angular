import {Register} from '../models/Register';
import {User} from '../models/User';
import {UserInfoDTO} from '../DTO/userInfoDTO';
import {Observable, of} from 'rxjs';


export class UserMockService {

  register(user: Register): Observable<Object> {
    return of();
  }
  login(user: User): Observable<Object> {
    const mockResponse = {
      token: 'mocked-jwt-token'
    };
    return of(mockResponse);
  }
  
  getListStudent(token: string): Observable<UserInfoDTO[]> {
    const mockStudents: UserInfoDTO[] = [
      { id: 1, firstName: 'John', lastName: 'Doe', login: 'john@doe.fr' },
      { id: 2, firstName: 'Jane', lastName: 'Smith', login: 'jane@smith.fr' }
    ];
    return of(mockStudents);
  }

}
