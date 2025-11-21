(() => {
  const USERS_KEY = 'techmatch-users';
  const SESSION_KEY = 'techmatch-active-user';
  const JOBS_KEY = 'techmatch-company-jobs';
  const DEFAULT_ROLE = 'candidate';
  const SKILL_OPTIONS = [
    { value: 'front-end', label: 'Front-end' },
    { value: 'back-end', label: 'Back-end' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'sql', label: 'SQL' },
    { value: 'css', label: 'CSS' },
    { value: 'html', label: 'HTML' },
    { value: 'devops', label: 'DevOps' },
    { value: 'cloud', label: 'Computação em nuvem' },
    { value: 'data-science', label: 'Ciência de Dados' },
    { value: 'ux-ui', label: 'UX/UI' },
    { value: 'qa-testes', label: 'QA e Testes' },
    { value: 'mobile', label: 'Desenvolvimento mobile' }
  ];
  const SKILL_VALUES = SKILL_OPTIONS.map((option) => option.value);
  const createEmptyProfile = () => ({
    headline: '',
    bio: '',
    availability: '',
    interests: [],
    skills: []
  });
  const normalizeRole = (role) => (role === 'company' ? 'company' : DEFAULT_ROLE);
    const seedUsers = [
    {
      username: 'eustaquio',
      password: 'eustaquio2005',
      favorites: [],
      role: DEFAULT_ROLE,
      profile: createEmptyProfile()
    },
    {
      username: 'techmatch',
      password: '123456',
      favorites: [],
      role: 'company',
      profile: createEmptyProfile()
    }
  ];

  const seedJobs = [
    {
      id: 'job_seed_techmatch_frontend',
      company: 'TechMatch',
      role: 'Front-end Engineer',
      seniority: 'Pleno',
      requirements:
        'Conduzir a construção de interfaces responsivas, garantindo acessibilidade e performance para o painel das candidatas.',
      differentials: 'Experiência com testes automatizados e colaboração próxima com squads de produto.',
      image: 'assets/images/logo-icon.svg',
      requiredSkills: ['front-end', 'javascript', 'css'],
      createdAt: '2024-12-01T12:00:00.000Z',
      createdBy: 'techmatch'
    }
  ];

  const safeParse = (value, label = 'os dados salvos') => {
    try {
      if (!value || value === 'undefined') {
        return [];
      }
      return JSON.parse(value);
    } catch (error) {
      console.warn(`Não foi possível ler ${label}.`, error);
      return [];
    }
  };

  const ensureArray = (value) => (Array.isArray(value) ? value : []);

  const announceAction = (message) => {
    if (typeof window === 'undefined' || typeof window.alert !== 'function' || !message) {
      return;
    }
    window.alert(message);
  };

  const getUsers = () => ensureArray(safeParse(localStorage.getItem(USERS_KEY), 'os usuários salvos'));
  const saveUsers = (users) => localStorage.setItem(USERS_KEY, JSON.stringify(ensureArray(users)));
  const getStoredJobs = () => ensureArray(safeParse(localStorage.getItem(JOBS_KEY), 'as vagas salvas'));
  const saveJobs = (jobs) => localStorage.setItem(JOBS_KEY, JSON.stringify(ensureArray(jobs)));
  const persistUser = (updatedUser) => {
    const users = getUsers();
    const index = users.findIndex((user) => user.username === updatedUser.username);
    if (index >= 0) {
      users[index] = updatedUser;
      saveUsers(users);
    }
  };
  const normalizeUsername = (username = '') => username.trim().toLowerCase();

  const ensureSeedUsers = () => {
    const users = getUsers();
    let needsSave = false;
    seedUsers.forEach((seed) => {
      if (!users.some((user) => user.username === seed.username)) {
        users.push({ ...seed, profile: { ...seed.profile }, favorites: [...seed.favorites] });
        needsSave = true;
      }
    });

    users.forEach((user) => {
      if (!user.role || (user.role !== 'candidate' && user.role !== 'company')) {
        user.role = DEFAULT_ROLE;
        needsSave = true;
      }
    });

    if (needsSave) {
      saveUsers(users);
    }
  };

   const ensureSeedJobs = () => {
    const jobs = getStoredJobs();
    const existingIds = new Set(jobs.map((job) => job.id));
    let needsSave = false;

    seedJobs.forEach((job) => {
      if (!existingIds.has(job.id)) {
        jobs.push({ ...job, requiredSkills: [...job.requiredSkills] });
        needsSave = true;
      }
    });

    if (needsSave) {
      saveJobs(jobs);
    }
  };

  ensureSeedUsers();
  ensureSeedJobs();

  const ensureProfileShape = (user) => {
    if (!user) {
      return null;
    }

    let needsPersist = false;
    if (!Array.isArray(user.favorites)) {
      user.favorites = [];
      needsPersist = true;
    }

    if (!user.profile) {
      user.profile = createEmptyProfile();
      needsPersist = true;
    } else {
      user.profile.headline = user.profile.headline ?? '';
      user.profile.bio = user.profile.bio ?? '';
      user.profile.availability = user.profile.availability ?? '';
      if (!Array.isArray(user.profile.interests)) {
        user.profile.interests = [];
        needsPersist = true;
      }
      if (!Array.isArray(user.profile.skills)) {
        user.profile.skills = [];
        needsPersist = true;
      }
    }

    if (needsPersist) {
      persistUser(user);
    }

    return user.profile;
  };

  const findUser = (username) => getUsers().find((user) => user.username === username);

  const setActiveUser = (username) => {
    if (username) {
      localStorage.setItem(SESSION_KEY, username);
    }
  };

  const getActiveUser = () => {
    const username = localStorage.getItem(SESSION_KEY);
    if (!username) {
      return null;
    }

    const user = findUser(username);
    if (!user) {
      localStorage.removeItem(SESSION_KEY);
    }
    ensureProfileShape(user);
    if (user) {
      const normalizedRole = normalizeRole(user.role);
      if (user.role !== normalizedRole) {
        user.role = normalizedRole;
        persistUser(user);
      }
    }
    return user ?? null;
  };

  const login = (username, password) => {
    const normalized = normalizeUsername(username);
    if (!normalized) {
      return { success: false, message: 'Informe o usuário.' };
    }

    const user = findUser(normalized);
    if (!user || user.password !== password) {
      return { success: false, message: 'Usuário ou senha inválidos.' };
    }

    setActiveUser(user.username);
    return { success: true, message: 'Login realizado com sucesso!', user };
  };

  const register = (username, password, role) => {
    const normalized = normalizeUsername(username);
    if (!normalized) {
      return { success: false, message: 'Informe o usuário.' };
    }

    if (!password || password.length < 6) {
      return { success: false, message: 'Use pelo menos 6 caracteres na senha.' };
    }

    if (findUser(normalized)) {
      return { success: false, message: 'Este usuário já existe.' };
    }

    const newUser = {
      username: normalized,
      password,
      favorites: [],
      role: normalizeRole(role),
      profile: createEmptyProfile()
    };

    const users = getUsers();
    users.push(newUser);
    saveUsers(users);
    setActiveUser(newUser.username);
    announceAction('Conta criada com sucesso! Seja bem-vindo(a) ao TechMatch.');

    return { success: true, message: 'Cadastro concluído!', user: newUser };
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
  };

  const getFavorites = () => {
    const user = getActiveUser();
    return user?.favorites ? [...user.favorites] : [];
  };

  const getJobs = () => getStoredJobs();

  const getProfile = () => {
    const user = getActiveUser();
    if (!user) {
      return null;
    }

    ensureProfileShape(user);
    return {
      headline: user.profile.headline,
      bio: user.profile.bio,
      availability: user.profile.availability,
      interests: [...user.profile.interests],
      skills: [...user.profile.skills]
    };
  };

  const updateProfile = (updates = {}) => {
    const user = getActiveUser();
    if (!user) {
      return { success: false, message: 'Faça login para atualizar seu perfil.' };
    }

    ensureProfileShape(user);
    user.profile = {
      ...user.profile,
      headline: (updates.headline ?? user.profile.headline ?? '').trim(),
      bio: (updates.bio ?? user.profile.bio ?? '').trim(),
      availability: updates.availability ?? user.profile.availability ?? '',
      lastUpdated: new Date().toISOString()
    };
    persistUser(user);

    return {
      success: true,
      message: 'Perfil atualizado!',
      profile: {
        ...user.profile,
        interests: [...user.profile.interests],
        skills: [...user.profile.skills]
      }
    };
  };

  const sanitizeSkills = (skills = []) => {
    if (!Array.isArray(skills)) {
      return [];
    }
    const seen = new Set();
    const normalized = [];
    skills.forEach((skill) => {
      const value = (skill ?? '').toString().trim().toLowerCase();
      if (!value) {
        return;
      }
      const match = SKILL_VALUES.find((option) => option === value);
      if (!match || seen.has(match)) {
        return;
      }
      seen.add(match);
      normalized.push(match);
    });
    return normalized;
  };

  const setProfileSkills = (skills = []) => {
    const user = getActiveUser();
    if (!user) {
      return { success: false, message: 'Faça login para atualizar habilidades.' };
    }

    ensureProfileShape(user);
    const sanitizedSkills = sanitizeSkills(skills);
    user.profile.skills = sanitizedSkills;
    user.profile.lastUpdated = new Date().toISOString();
    persistUser(user);

    return {
      success: true,
      message: sanitizedSkills.length
        ? 'Habilidades atualizadas!'
        : 'Habilidades removidas. Selecione novas opções para visualizar vagas.',
      skills: [...sanitizedSkills]
    };
  };

  const addProfileInterest = (interest) => {
    const user = getActiveUser();
    if (!user) {
      return { success: false, message: 'Faça login para adicionar interesses.' };
    }

    ensureProfileShape(user);
    const normalizedInterest = (interest ?? '').trim();
    if (!normalizedInterest) {
      return { success: false, message: 'Informe um interesse antes de salvar.' };
    }

    const exists = user.profile.interests.some(
      (current) => current.toLowerCase() === normalizedInterest.toLowerCase()
    );
    if (exists) {
      return { success: false, message: 'Este interesse já foi cadastrado.', interests: [...user.profile.interests] };
    }

    user.profile.interests.push(normalizedInterest);
    persistUser(user);

    return { success: true, message: 'Interesse adicionado!', interests: [...user.profile.interests] };
  };

  const removeProfileInterest = (interest) => {
    const user = getActiveUser();
    if (!user) {
      return { success: false, message: 'Faça login para remover interesses.' };
    }

    ensureProfileShape(user);
    const normalizedInterest = (interest ?? '').trim().toLowerCase();
    const index = user.profile.interests.findIndex(
      (current) => current.toLowerCase() === normalizedInterest
    );

    if (index === -1) {
      return { success: false, message: 'Não encontramos este interesse.', interests: [...user.profile.interests] };
    }

    user.profile.interests.splice(index, 1);
    persistUser(user);

    return { success: true, message: 'Interesse removido.', interests: [...user.profile.interests] };
  };

  const addFavorite = (item) => {
    const user = getActiveUser();
    if (!user) {
      return { success: false, message: 'Faça login para favoritar.' };
    }

    if (!Array.isArray(user.favorites)) {
      user.favorites = [];
    }

    if (
      user.favorites.some((favorite) => {
        if (favorite.id && item.id) {
          return favorite.id === item.id;
        }
        return favorite.title === item.title;
      })
    ) {
      return { success: false, message: 'Este item já está nos favoritos.', favorites: [...user.favorites] };
    }

    user.favorites.push({ ...item, savedAt: new Date().toISOString() });
    persistUser(user);
    announceAction('Vaga adicionada aos favoritos!');

    return { success: true, message: 'Favorito salvo!', favorites: [...user.favorites] };
  };

  const removeFavorite = (identifier) => {
    const user = getActiveUser();
    if (!user) {
      return { success: false, message: 'Faça login para gerenciar favoritos.' };
    }

    if (!Array.isArray(user.favorites)) {
      user.favorites = [];
    }

    const index = user.favorites.findIndex(
      (favorite) => favorite.id === identifier || favorite.title === identifier
    );
    if (index === -1) {
      return { success: false, message: 'Não encontramos este favorito.', favorites: [...user.favorites] };
    }

    user.favorites.splice(index, 1);
    persistUser(user);

    return { success: true, message: 'Favorito removido.', favorites: [...user.favorites] };
  };

  const promptInlineAuth = () => {
    const overlay = document.querySelector('[data-auth-overlay]');
    if (!overlay) {
      return false;
    }

    overlay.hidden = false;
    document.body.classList.add('auth-locked');
    const firstInput = overlay.querySelector('input');
    firstInput?.focus();
    return true;
  };

  const dismissInlineAuth = () => {
    const overlay = document.querySelector('[data-auth-overlay]');
    if (!overlay) {
      return;
    }

    overlay.hidden = true;
    document.body.classList.remove('auth-locked');
  };

  const requireAuth = () => {
    if (getActiveUser()) {
      return true;
    }

    if (promptInlineAuth()) {
      return false;
    }

    const redirectTarget = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `login.html?redirect=${redirectTarget}`;
    return false;
  };

  const getDefaultDashboard = (user) => (user?.role === 'company' ? 'match-empresas.html' : 'match.html');

  const formatRoleName = (role) => (role === 'company' ? 'empresa' : 'candidata');
  const formatAreaName = (role) => (role === 'company' ? 'empresas' : 'candidatas');

  const alertRestrictedAccess = (requiredRole, currentRole) => {
    if (!requiredRole || !currentRole || requiredRole === currentRole) {
      return;
    }
    const areaLabel = formatAreaName(requiredRole);
    const currentLabel = formatRoleName(currentRole);
    window.alert(`A aba para ${areaLabel} é exclusiva para perfis desse tipo. Você está autenticado como ${currentLabel}.`);
  };

  const addJob = (jobData = {}) => {
    const user = getActiveUser();
    if (!user || user.role !== 'company') {
      return { success: false, message: 'Apenas empresas autenticadas podem cadastrar vagas.' };
    }

    const normalize = (value = '') => value.trim();
    const job = {
      id: `job_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
      company: normalize(jobData.company),
      role: normalize(jobData.role),
      seniority: normalize(jobData.seniority),
      requirements: normalize(jobData.requirements),
      differentials: normalize(jobData.differentials),
      image: normalize(jobData.image),
      roadmap: normalize(jobData.roadmap),
      requiredSkills: sanitizeSkills(jobData.requiredSkills),
      createdAt: new Date().toISOString(),
      createdBy: user.username
    };

    if (!job.company || !job.role) {
      return { success: false, message: 'Informe ao menos a empresa e o cargo.' };
    }

    if (!job.requiredSkills.length) {
      return {
        success: false,
        message: 'Selecione pelo menos uma habilidade necessária para esta vaga.'
      };
    }

    const jobs = getStoredJobs();
    jobs.push(job);
    saveJobs(jobs);
    announceAction('Vaga adicionada e publicada para as candidatas.');

    return { success: true, message: 'Vaga publicada e enviada para as candidatas!', job, jobs: [...jobs] };
  };

  const getCompanyDashboard = () => {
    const user = getActiveUser();
    if (!user || user.role !== 'company') {
      return { jobs: [], applicantsByJob: {} };
    }

    const jobs = getStoredJobs().filter((job) => job.createdBy === user.username);
    const applicantsByJob = {};
    const jobMap = new Map();
    jobs.forEach((job) => {
      applicantsByJob[job.id] = [];
      jobMap.set(job.id, job);
    });

    if (!jobs.length) {
      return { jobs: [], applicantsByJob };
    }

    const users = getUsers();
    users.forEach((candidate) => {
      if (candidate.role !== 'candidate') {
        return;
      }
      if (!Array.isArray(candidate.favorites) || !candidate.favorites.length) {
        return;
      }

      ensureProfileShape(candidate);
      const candidateSkills = Array.isArray(candidate.profile?.skills) ? [...candidate.profile.skills] : [];
      const headline = candidate.profile?.headline ?? '';

      candidate.favorites.forEach((favorite) => {
        if (!favorite?.id || !jobMap.has(favorite.id)) {
          return;
        }

        const job = jobMap.get(favorite.id);
        const matchedSkills = Array.isArray(job.requiredSkills)
          ? job.requiredSkills.filter((skill) => candidateSkills.includes(skill))
          : [];

        applicantsByJob[favorite.id].push({
          username: candidate.username,
          headline,
          matchedSkills,
          skills: candidateSkills.slice(),
          savedAt: favorite.savedAt
        });
      });
    });

    const jobsWithCounts = jobs.map((job) => ({
      ...job,
      applicantCount: applicantsByJob[job.id]?.length ?? 0
    }));

    return { jobs: jobsWithCounts, applicantsByJob };
  };

  const removeJob = (jobId) => {
    const user = getActiveUser();
    if (!user || user.role !== 'company') {
      return { success: false, message: 'Apenas empresas autenticadas podem gerenciar vagas.' };
    }

    if (!jobId) {
      return { success: false, message: 'Identificador da vaga inválido.' };
    }

    const jobs = getStoredJobs();
    const jobIndex = jobs.findIndex((job) => job.id === jobId && job.createdBy === user.username);
    if (jobIndex === -1) {
      return { success: false, message: 'Vaga não encontrada.' };
    }

    jobs.splice(jobIndex, 1);
    saveJobs(jobs);

    const users = getUsers();
    let favoritesUpdated = false;
    users.forEach((candidate) => {
      if (!Array.isArray(candidate.favorites) || !candidate.favorites.length) {
        return;
      }

      const filtered = candidate.favorites.filter((favorite) => favorite.id !== jobId);
      if (filtered.length !== candidate.favorites.length) {
        candidate.favorites = filtered;
        favoritesUpdated = true;
      }
    });

    if (favoritesUpdated) {
      saveUsers(users);
    }

    announceAction('Vaga removida do painel da empresa.');
    return {
      success: true,
      message: 'Vaga removida com sucesso.',
      jobs: jobs.filter((job) => job.createdBy === user.username)
    };
  };

  const toggleAuthControl = (element, shouldDisplay) => {
    if (!element) {
      return;
    }
    if (shouldDisplay) {
      element.hidden = false;
      element.removeAttribute('aria-hidden');
    } else {
      element.hidden = true;
      element.setAttribute('aria-hidden', 'true');
    }
  };

  const updateAuthUI = () => {
    const user = getActiveUser();
    const badge = document.querySelector('[data-user-badge]');
    const loginLink = document.querySelector('[data-login-link]');
    const logoutButton = document.querySelector('[data-logout]');

    if (badge) {
      if (user) {
        badge.textContent = `Olá, ${user.username}`;
        badge.hidden = false;
      } else {
        badge.hidden = true;
      }
    }

    toggleAuthControl(loginLink, !user);
    toggleAuthControl(logoutButton, Boolean(user));

    if (user) {
      dismissInlineAuth();
    }
  };

  const setFeedback = (element, message, state) => {
    if (!element) {
      return;
    }
    element.textContent = message;
    element.dataset.state = state;
  };

  const setupForms = () => {
    const params = new URLSearchParams(window.location.search);
    const redirectParam = params.get('redirect');
    const decodedRedirect = redirectParam ? decodeURIComponent(redirectParam) : null;
    const isAuthPage = document.body?.classList.contains('page-auth') || window.location.pathname.endsWith('login.html');
    const resolveRedirectTarget = (user) => {
      if (decodedRedirect) {
        return decodedRedirect;
      }
      if (isAuthPage) {
        return getDefaultDashboard(user);
      }
      return `${window.location.pathname}${window.location.search}`;
    };

    const loginForms = document.querySelectorAll('[data-login-form]');
    loginForms.forEach((loginForm) => {
      loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const username = loginForm.querySelector('[name="login-username"]').value;
        const password = loginForm.querySelector('[name="login-password"]').value;
        const feedback = loginForm.querySelector('[data-login-feedback]');
        const result = login(username, password);
        setFeedback(feedback, result.message, result.success ? 'success' : 'error');
        if (result.success) {
          updateAuthUI();
          dismissInlineAuth();
          window.location.href = resolveRedirectTarget(result.user);
        }
      });
    });

    const registerForms = document.querySelectorAll('[data-register-form]');
    registerForms.forEach((registerForm) => {
      registerForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const username = registerForm.querySelector('[name="register-username"]').value;
        const password = registerForm.querySelector('[name="register-password"]').value;
        const role = registerForm.querySelector('[name="register-role"]')?.value ?? 'candidate';
        const feedback = registerForm.querySelector('[data-register-feedback]');
        const result = register(username, password, role);
        setFeedback(feedback, result.message, result.success ? 'success' : 'error');
        if (result.success) {
          updateAuthUI();
          dismissInlineAuth();
          window.location.href = resolveRedirectTarget(result.user);
        }
      });
    });
  };

  const setupLogout = () => {
    const logoutButton = document.querySelector('[data-logout]');
    if (logoutButton) {
      logoutButton.addEventListener('click', () => {
        logout();
        updateAuthUI();
        window.location.href = 'login.html';
      });
    }
  };

  const setupRoleGuards = () => {
    const guardElements = document.querySelectorAll('[data-role-guard]');
    guardElements.forEach((element) => {
      element.addEventListener('click', (event) => {
        const guardValue = element.dataset.roleGuard;
        if (!guardValue) {
          return;
        }
        const allowedRoles = guardValue
          .split(',')
          .map((roleName) => roleName.trim())
          .filter(Boolean);
        if (!allowedRoles.length) {
          return;
        }
        const user = getActiveUser();
        if (!user || allowedRoles.includes(user.role)) {
          return;
        }
        event.preventDefault();
        alertRestrictedAccess(allowedRoles[0], user.role);
      });
    });
  };

  const enforcePageAccess = () => {
    const requiresAuth = document.body?.dataset.requireAuth === 'true';
    const requiredRole = document.body?.dataset.requiredRole;
    if (!requiresAuth && !requiredRole) {
      return;
    }

    let user = getActiveUser();
    if (!user) {
      if (!requireAuth()) {
        return;
      }
      user = getActiveUser();
    }

    if (user) {
      dismissInlineAuth();
    }

    if (!requiredRole) {
      return;
    }

    if (user && user.role !== requiredRole) {
      alertRestrictedAccess(requiredRole, user.role);
      window.location.href = getDefaultDashboard(user);
    }
  };

  const init = () => {
    updateAuthUI();
    setupForms();
    setupLogout();
    setupRoleGuards();
    enforcePageAccess();
  };

  document.addEventListener('DOMContentLoaded', init);

  window.TechMatchSkillOptions = SKILL_OPTIONS;

  window.TechMatchAuth = {
    login,
    register,
    logout,
    requireAuth,
    updateAuthUI,
    getActiveUser,
    getFavorites,
    addFavorite,
    removeFavorite,
    addJob,
    removeJob,
    getJobs,
    getCompanyDashboard,
    getProfile,
    updateProfile,
    addProfileInterest,
    removeProfileInterest,
    setProfileSkills,
    promptInlineAuth,
    dismissInlineAuth
  };
})();
