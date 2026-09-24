/**
 * GameVerse - Script de Responsividade e Navegação Mobile
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Configurar menus de navegação mobile em todos os headers .navbar
    const navbars = document.querySelectorAll('.navbar');

    navbars.forEach(navbar => {
        const nav = navbar.querySelector('nav');
        if (!nav) return;

        // Procura ou cria dinamicamente o botão hamburger caso não exista no HTML
        let toggle = navbar.querySelector('.menu-toggle');
        if (!toggle) {
            toggle = document.createElement('button');
            toggle.className = 'menu-toggle';
            toggle.setAttribute('type', 'button');
            toggle.setAttribute('aria-label', 'Alternar menu de navegação');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.innerHTML = '<span></span><span></span><span></span>';

            const headerActions = navbar.querySelector('.header-actions, .cart-icon');
            if (headerActions) {
                // Insere após as ações para manter a ordem visual
                headerActions.insertAdjacentElement('afterend', toggle);
            } else {
                navbar.appendChild(toggle);
            }
        }

        // Evento de clique no botão do menu
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = navbar.classList.toggle('nav-active');
            nav.classList.toggle('active', isOpen);
            toggle.classList.toggle('active', isOpen);
            toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        // Fechar ao clicar em qualquer link da navegação
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navbar.classList.remove('nav-active');
                nav.classList.remove('active');
                toggle.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
            });
        });

        // Fechar ao clicar fora do cabeçalho
        document.addEventListener('click', (e) => {
            if (!navbar.contains(e.target)) {
                navbar.classList.remove('nav-active');
                nav.classList.remove('active');
                toggle.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });

        // Fechar com a tecla ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navbar.classList.contains('nav-active')) {
                navbar.classList.remove('nav-active');
                nav.classList.remove('active');
                toggle.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
    });

    // 2. Fechar menu se a janela for redimensionada para desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 880) {
            navbars.forEach(navbar => {
                navbar.classList.remove('nav-active');
                const nav = navbar.querySelector('nav');
                const toggle = navbar.querySelector('.menu-toggle');
                if (nav) nav.classList.remove('active');
                if (toggle) {
                    toggle.classList.remove('active');
                    toggle.setAttribute('aria-expanded', 'false');
                }
            });
        }
    });

    // 3. Tornar tabelas responsivas (com scroll horizontal suave sem quebrar layout)
    document.querySelectorAll('table.admin-table, table').forEach(table => {
        if (!table.parentElement.classList.contains('table-responsive')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'table-responsive';
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        }
    });
});
