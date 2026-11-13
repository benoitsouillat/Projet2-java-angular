/// <reference types="cypress" />

let registeredEmail: string

describe('Access to dashboard', () => {
  it('passes', () => {
    cy.visit('/dashboard')
  })
})

describe('Registration as new user', () => {
    it('passes', () => {
        registeredEmail = `john.doe.${Date.now()}@example.com`

        cy.visit('/register')
        cy.get('[formControlName="firstName"]').type('John')
        cy.get('[formControlName="lastName"]').type('Doe')
        cy.get('[formControlName="login"]').type(registeredEmail)
        cy.get('[formControlName="password"]').type('password')
        cy.on('window:confirm', (text) => {
            expect(text).to.equal('SUCCESS!! :-)')
        })
        cy.contains('button', 'Register').click()
        cy.url().should('include', '/login')
    })
})

describe('Create a new etudiant', () => {
    let testEmail: string

    before(() => {
        testEmail = `student.test.${Date.now()}@example.com`
        cy.request('POST', '/api/register', {
            firstName: 'Test',
            lastName: 'Student',
            login: testEmail,
            password: 'password'
        })
    })

    it('passes', () => {
        cy.visit('/login')
        cy.get('[formControlName="login"]').type(testEmail)
        cy.get('[formControlName="password"]').type('password')
        cy.contains('button', 'Login').click()
        cy.url().should('include', '/dashboard')

        cy.contains('Ajouter un étudiant').click()
        cy.get('[formControlName="lastName"]').type('Dupont')
        cy.get('[formControlName="firstName"]').type('Marie')
        cy.get('[formControlName="login"]').type('marie.dupont@test.com')

        cy.on('window:alert', (text) => {
            expect(text).to.equal('Action réussie !')
        })
        cy.contains('Ajouter').click()

        cy.get('#student-list').should('contain', 'Dupont')
        cy.get('#student-list').should('contain', 'Marie')
    })
})
