describe('todoist', function() {
    it('Visita todoist.com y toma captura', function() {
        cy.visit('https://todoist.com/')
        cy.wait(1000)
        cy.screenshot('home', {timeout: 100000, log: false, scale: true})
    })

    it('Visita todoist.com y toma captura de como funciona', function() {
        cy.visit('https://todoist.com/')
        cy.wait(1000)
        cy.get(':nth-child(1) > .td-header__action-link').click()
        cy.screenshot('how-it-works', {timeout: 100000, log: false, scale: true})
    })

    it('Visita todoist.com y toma captura de premium', function() {
        cy.visit('https://todoist.com/')
        cy.wait(1000)
        cy.get(':nth-child(3) > .td-header__action-link').click()
        cy.screenshot('premium', {timeout: 100000, log: false, scale: true})
    })

    it('Visita todoist.com y toma captura de business', function() {
        cy.visit('https://todoist.com/')
        cy.wait(1000)
        cy.get(':nth-child(4) > .td-header__action-link').click()
        cy.screenshot('business', {timeout: 100000, log: false, scale: true})
    })

    it('Visita todoist.com y toma captura de pricing', function() {
        cy.visit('https://todoist.com/')
        cy.wait(1000)
        cy.get('#top_menu > :nth-child(5) > a').click()
        cy.screenshot('pricing', {timeout: 100000, log: false, scale: true})
    })

    it('Visita todoist.com y toma screenshot del sign up', function() {
        cy.visit('https://todoist.com/')
        cy.get('.td-header__signup-link').click()
        cy.wait(3000)
        cy.get('#GB_window').screenshot('signup', {timeout: 50000, log: false, scale: true})
    })
    

    it('Visita todoist.com y toma screenshot del login', function() {
        cy.visit('https://todoist.com/')
        cy.get(':nth-child(5) > .td-header__action-link').click()
        cy.wait(3000)
        cy.get('#GB_window').screenshot('login', {timeout: 50000, log: false, scale: true})
    })

    it('Visita todoist.com y toma screenshot de la opción de olvido contraseña', function () {
        cy.visit('https://todoist.com/Users/showLogin?mini=1')
        cy.get('[href="/Users/forgotPassword?mini=1"]').click()
        cy.screenshot('forgot-password', {timeout: 50000, log: false, scale: true})
    })

    it('Visita todoist.com, se loguea y toma screenshots de las diferentes funcionalidades', function () {
        cy.visit('https://todoist.com/Users/showLogin?mini=1')
        // Llena el formulario
        cy.get('#email').click().type('ma.trujillo10@uniandes.edu.co')
        cy.get('#password').click().type('somepassword')
        cy.get('.submit_btn').click()
        cy.wait(3000)
        // Toma screenshot de la pantalla de inicio después de loguearse
        cy.screenshot('logged', {timeout: 50000, log: false, scale: true})
        // Va a la pantalla de crear una nueva tarea
        cy.get('.empty-state-button').click()
        cy.screenshot('create-task', {timeout: 50000, log: false, scale: true})
        // Cancela la creación del task
        cy.get('.cancel').click()
        // Va a la pantalla de proximos 7 dias
        cy.get('[data-track="navigation|next_7_days"] > .item_content').click()
        cy.screenshot('next-seven-days', {timeout: 50000, log: false, scale: true})
        // Va a la pantalla de bienvenida
        cy.get('.clickable > .item_table > tbody > tr > .name > :nth-child(1)').click()
        cy.screenshot('welcome', {timeout: 50000, log: false, scale: true})
        // Va a la pantalla de inbox
        cy.get('#filter_inbox > .item_content').click()
        cy.screenshot('inbox', {timeout: 50000, log: false, scale: true})
        // Abre el modal de crear proyecto
        cy.get('[data-track="projects|add"]').click()
        cy.screenshot('add-project', {timeout: 50000, log: false, scale: true})
        cy.get('.reactist_modal_box__actions > [type="button"]').click() // Cierra el modal
        // Abre el modal de crear task rápido
        cy.get('[data-track="navigation|quick_add"]').click()
        cy.screenshot('quick-create-task', {timeout: 50000, log: false, scale: true})
        cy.get('.icon_close').click()
        // Abre el menú de configuraciones
        cy.get('#gear_holder').click()
        cy.screenshot('configs', {timeout: 50000, log: false, scale: true})
        // Va al registro de actividad
        cy.get('[data-track="navigation|gear_view_activity_log"]').click()
        cy.screenshot('activity-log', {timeout: 50000, log: false, scale: true})
        // Atajos del teclado
        cy.get('#gear_holder').click()
        cy.get('[data-track="navigation|gear_shortcuts"]').click()
        cy.screenshot('shortcuts', {timeout: 50000, log: false, scale: true})
        cy.get('.close > div > span > svg').click()
        // Va a las configuraciones
        cy.get('#gear_holder').click()
        cy.get('[data-track="navigation|gear_settings"]').click()
        cy.screenshot('configs-account', {timeout: 50000, log: false, scale: true})
        cy.get('[href="/prefs/general"]').click()
        cy.screenshot('configs-general', {timeout: 50000, log: false, scale: true})
        cy.get('[href="/prefs/payments"]').click()
        cy.screenshot('configs-payments', {timeout: 50000, log: false, scale: true})
        cy.get('[href="/prefs/theme"]').click()
        cy.screenshot('configs-theme', {timeout: 50000, log: false, scale: true})
        cy.get('[href="/prefs/karma"]').click()
        cy.screenshot('configs-karma', {timeout: 50000, log: false, scale: true})
        cy.get('[href="/prefs/notifications"]').click()
        cy.screenshot('configs-notifications', {timeout: 50000, log: false, scale: true})
        cy.get('[href="/prefs/integrations"]').click()
        cy.screenshot('configs-integrations', {timeout: 50000, log: false, scale: true})
    })
})