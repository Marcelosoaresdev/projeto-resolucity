// Verifica sessão e atualiza a navbar com o estado do usuário
async function initNavbar() {
    const navbarAuth = document.getElementById('navbar-auth');
    if (!navbarAuth) return; // página sem área de auth (ex: login)

    try {
        const response = await fetch('/api/auth/me');

        if (response.ok) {
            const user = await response.json();

            // Usuário logado: dropdown com nome + logout no desktop, hamburger com logout no mobile
            navbarAuth.innerHTML = `
                <!-- Desktop: nome do usuário com dropdown -->
                <div class="dropdown dropdown-end hidden sm:block">
                    <div tabindex="0" role="button" class="btn btn-ghost btn-sm gap-2">
                        <i data-lucide="user-circle" class="w-4 h-4 text-primary-500"></i>
                        <span class="font-medium text-sm">${user.nome}</span>
                        <i data-lucide="chevron-down" class="w-3 h-3 text-gray-400"></i>
                    </div>
                    <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-[1] w-48 p-2 shadow-lg border border-base-200 mt-2">
                        <li class="menu-title"><span class="text-xs text-gray-400">Olá, ${user.nome}</span></li>
                        <li>
                            <button id="logout-btn-desktop" class="text-error gap-2">
                                <i data-lucide="log-out" class="w-4 h-4"></i>
                                Sair
                            </button>
                        </li>
                    </ul>
                </div>

                <!-- Desktop: botão Fazer Relato -->
                <a href="/relatar" class="btn btn-sm bg-primary-500 hover:bg-primary-600 text-white border-none hidden sm:flex gap-2 rounded-xl normal-case shadow-sm font-semibold">
                    Fazer Relato
                    <i data-lucide="arrow-right" class="w-4 h-4"></i>
                </a>

                <!-- Mobile: hamburger com links + logout -->
                <div class="dropdown dropdown-end lg:hidden">
                    <button tabindex="0" class="btn btn-ghost btn-sm p-2 rounded-lg" aria-label="Menu">
                        <i data-lucide="menu" class="w-5 h-5 text-base-content/70"></i>
                    </button>
                    <ul tabindex="0" class="dropdown-content menu bg-base-100/95 backdrop-blur-lg rounded-box z-50 w-56 p-2 shadow-lg border border-base-200 mt-2">
                        <li><a href="/" class="rounded-lg text-sm">Início</a></li>
                        <li><a href="/categorias" class="rounded-lg text-sm">Categorias</a></li>
                        <li><a href="/estatisticas" class="rounded-lg text-sm">Estatísticas</a></li>
                        <li><a href="/sobre" class="rounded-lg text-sm">Sobre</a></li>
                        <li><a href="/contato" class="rounded-lg text-sm">Contato</a></li>
                        <li class="border-t border-base-200 mt-2 pt-2">
                            <a href="/relatar" class="rounded-xl bg-primary-500 text-white font-semibold justify-center">
                                Fazer Relato <i data-lucide="arrow-right" class="w-4 h-4"></i>
                            </a>
                        </li>
                        <li class="mt-2">
                            <button id="logout-btn-mobile" class="rounded-xl border border-error text-error justify-center w-full">
                                <i data-lucide="log-out" class="w-4 h-4"></i> Sair
                            </button>
                        </li>
                    </ul>
                </div>
            `;

            lucide.createIcons();

            // Logout funciona tanto pelo botão desktop quanto pelo mobile
            const handleLogout = async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                window.location.href = '/login';
            };

            document.getElementById('logout-btn-desktop').addEventListener('click', handleLogout);
            document.getElementById('logout-btn-mobile').addEventListener('click', handleLogout);

        } else {
            // Usuário não logado: mantém "Entrar" + "Fazer Relato" + hamburger padrão
            navbarAuth.innerHTML = `
                <a href="/login" class="btn btn-sm btn-outline border-primary-200 text-primary-500 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-600 hidden sm:flex gap-2 rounded-xl normal-case">
                    <i data-lucide="log-in" class="w-4 h-4"></i>
                    Entrar
                </a>
                <a href="/relatar" class="btn btn-sm bg-primary-500 hover:bg-primary-600 text-white border-none hidden sm:flex gap-2 rounded-xl normal-case shadow-sm font-semibold">
                    Fazer Relato
                    <i data-lucide="arrow-right" class="w-4 h-4"></i>
                </a>

                <!-- Mobile dropdown -->
                <div class="dropdown dropdown-end lg:hidden">
                    <button tabindex="0" class="btn btn-ghost btn-sm p-2 rounded-lg" aria-label="Menu">
                        <i data-lucide="menu" class="w-5 h-5 text-base-content/70"></i>
                    </button>
                    <ul tabindex="0" class="dropdown-content menu bg-base-100/95 backdrop-blur-lg rounded-box z-50 w-56 p-2 shadow-lg border border-base-200 mt-2">
                        <li><a href="/" class="rounded-lg text-sm">Início</a></li>
                        <li><a href="/categorias" class="rounded-lg text-sm">Categorias</a></li>
                        <li><a href="/estatisticas" class="rounded-lg text-sm">Estatísticas</a></li>
                        <li><a href="/sobre" class="rounded-lg text-sm">Sobre</a></li>
                        <li><a href="/contato" class="rounded-lg text-sm">Contato</a></li>
                        <li class="border-t border-base-200 mt-2 pt-2">
                            <a href="/relatar" class="rounded-xl bg-primary-500 text-white font-semibold justify-center">
                                Fazer Relato <i data-lucide="arrow-right" class="w-4 h-4"></i>
                            </a>
                        </li>
                        <li class="mt-2">
                            <a href="/login" class="rounded-xl border border-primary-200 text-primary-500 justify-center">
                                <i data-lucide="log-in" class="w-4 h-4"></i> Entrar
                            </a>
                        </li>
                    </ul>
                </div>
            `;
            lucide.createIcons();
        }

    } catch (err) {
        console.error('Erro ao verificar sessão:', err);
    }
}

document.addEventListener('DOMContentLoaded', initNavbar);
