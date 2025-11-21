(() => {
  const Auth = window.TechMatchAuth;
  const SKILL_OPTIONS = window.TechMatchSkillOptions ?? [];
  const SKILL_LABEL_MAP = new Map(SKILL_OPTIONS.map((option) => [option.value, option.label]));
  const SKILL_DESCRIPTIONS = {
    'front-end': 'Interfaces e componentes visuais',
    'back-end': 'APIs e integrações',
    javascript: 'Linguagem base para o ecossistema web',
    typescript: 'Segurança e tipagem em escala',
    python: 'Automação e análise de dados',
    java: 'Aplicações corporativas robustas',
    sql: 'Estruturação e consultas em dados',
    css: 'Estilos responsivos e sistemas de design',
    html: 'Estruturação semântica das páginas',
    devops: 'Pipelines e observabilidade',
    cloud: 'Infraestrutura em nuvem',
    'data-science': 'Modelagem estatística e experimentos',
    'ux-ui': 'Pesquisa e prototipação centradas na pessoa',
    'qa-testes': 'Qualidade e testes automatizados',
    mobile: 'Aplicativos nativos e híbridos'
  };
  const SENIORITY_LABELS = {
    estagio: 'Estágio',
    junior: 'Júnior',
    pleno: 'Pleno',
    senior: 'Sênior',
    lider: 'Liderança'
  };
  let refreshJobQueue = null;
  let refreshCompanyDashboard = null;
  const menuToggle = document.querySelector('.menu-toggle');
  const mainNav = document.querySelector('.main-nav');

  if (menuToggle && mainNav) {
    const toggleNav = () => {
      const isOpen = mainNav.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    };

    menuToggle.addEventListener('click', toggleNav);

    const closeNav = () => {
      mainNav.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    };

    mainNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeNav);
    });
  }

  document.querySelectorAll('[data-scroll]').forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      const targetId = trigger.getAttribute('data-scroll');
      const element = targetId ? document.querySelector(targetId) : null;
      if (!element) {
        return;
      }

      event.preventDefault();
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  const accordionButtons = Array.from(document.querySelectorAll('[data-accordion]'));

  const toggleAccordionState = (button, isOpen) => {
    const container = button.closest('.faq-item');
    const answer = container?.querySelector('.faq-answer');
    const icon = button.querySelector('.faq-question__symbol');

    if (!container || !answer) {
      return;
    }

    answer.hidden = !isOpen;
    container.classList.toggle('is-open', isOpen);
    button.setAttribute('aria-expanded', String(isOpen));

    if (icon) {
      icon.textContent = isOpen ? '–' : '+';
    }
  };

  const closeAllAccordions = () => {
    accordionButtons.forEach((btn) => toggleAccordionState(btn, false));
  };

  accordionButtons.forEach((button) => {
    toggleAccordionState(button, false);

    const handleToggle = () => {
      const container = button.closest('.faq-item');
      const answer = container?.querySelector('.faq-answer');
      if (!answer) {
        return;
      }

      const willOpen = answer.hidden;
      closeAllAccordions();
      toggleAccordionState(button, willOpen);
    };

    button.addEventListener('click', handleToggle);
    button.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleToggle();
      }
    });
  });

  const profileSummary = document.querySelector('[data-profile-summary]');
  const profileForm = document.querySelector('[data-profile-form]');
  const profileFeedback = document.querySelector('[data-profile-feedback]');
  const profileInterestForm = document.querySelector('[data-interest-form]');
  const profileInterestFeedback = document.querySelector('[data-interest-feedback]');
  const profileInterestsList = document.querySelector('[data-profile-interests-list]');
  const profileHeadlineInput = profileForm?.querySelector('[name="profile-headline"]');
  const profileBioInput = profileForm?.querySelector('[name="profile-bio"]');
  const profileAvailabilitySelect = profileForm?.querySelector('[name="profile-availability"]');
  const profileInterestInput = profileInterestForm?.querySelector('[name="profile-interest"]');
  const skillForm = document.querySelector('[data-skill-form]');
  const skillOptionsContainer = document.querySelector('[data-skill-options]');
  const skillFeedback = document.querySelector('[data-skill-feedback]');

  const setInlineFeedback = (element, message, state = 'info') => {
    if (!element) {
      return;
    }
    element.textContent = message ?? '';
    element.dataset.state = state;
  };

  const toggleProfileForms = (isDisabled) => {
    [profileForm, profileInterestForm, skillForm].forEach((form) => {
      if (!form) {
        return;
      }
      form.querySelectorAll('input, textarea, select, button').forEach((field) => {
        field.disabled = isDisabled;
      });
    });
  };

  const getSkillValuesFromContainer = (container) => {
    if (!container) {
      return [];
    }
    return Array.from(container.querySelectorAll('input[type="checkbox"]:checked')).map(
      (input) => input.value
    );
  };

  const getSkillDescription = (value) =>
    SKILL_DESCRIPTIONS[value] ?? 'Competência essencial para o match.';

  const getSkillInitials = (label = '') => {
    const segments = label
      .split(/\s+/)
      .filter(Boolean)
      .map((segment) => segment[0]?.toUpperCase?.())
      .filter(Boolean);
    if (!segments.length) {
      return 'TM';
    }
    return segments.slice(0, 2).join('');
  };

  const renderSkillOptions = (container, selectedValues = [], { namePrefix, disabled } = {}) => {
    if (!container) {
      return;
    }
    container.innerHTML = '';
    if (!SKILL_OPTIONS.length) {
      const info = document.createElement('p');
      info.textContent = 'Nenhuma habilidade disponível no momento.';
      container.append(info);
      return;
    }
    const selectedSet = new Set(selectedValues);
    SKILL_OPTIONS.forEach((option, index) => {
      const label = document.createElement('label');
      label.className = 'skill-option';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = option.value;
      checkbox.name = namePrefix ?? 'skill-option';
      checkbox.id = `${namePrefix ?? 'skill-option'}-${index}`;
      checkbox.checked = selectedSet.has(option.value);
      checkbox.disabled = Boolean(disabled);

      const marker = document.createElement('span');
      marker.className = 'skill-option__marker';
      marker.setAttribute('aria-hidden', 'true');

      const badge = document.createElement('span');
      badge.className = 'skill-option__badge';
      badge.textContent = getSkillInitials(option.label);

      const copy = document.createElement('span');
      copy.className = 'skill-option__copy';
      copy.innerHTML = `
        <strong>${option.label}</strong>
        <small>${getSkillDescription(option.value)}</small>
      `;

      label.append(checkbox, marker, badge, copy);
      container.append(label);
    });
  };

  const renderProfileSummary = () => {
    if (!profileSummary) {
      return;
    }

    const user = Auth?.getActiveUser?.();
    if (!user) {
      profileSummary.innerHTML = '<p>Faça login para visualizar e personalizar seu perfil.</p>';
      toggleProfileForms(true);
      return;
    }

    toggleProfileForms(false);
    const profile = Auth?.getProfile?.() ?? {};
    const headline = profile.headline?.trim() || 'Defina um objetivo para liberar recomendações assertivas.';
    const bio = profile.bio?.trim() || 'Conte um pouco sobre seus estudos atuais e conquistas recentes.';
    const availability = profile.availability || 'não informada';
    const interestCount = Array.isArray(profile.interests) ? profile.interests.length : 0;
    const skillCount = Array.isArray(profile.skills) ? profile.skills.length : 0;

    profileSummary.innerHTML = `
      <p class="eyebrow">Olá, ${user.username}</p>
      <h4>${headline}</h4>
      <p>${bio}</p>
      <ul class="profile-summary__meta">
        <li><span>Disponibilidade</span><strong>${availability}</strong></li>
        <li><span>Interesses ativos</span><strong>${interestCount}</strong></li>
        <li><span>Habilidades selecionadas</span><strong>${skillCount}</strong></li>
      </ul>
    `;
  };

  const fillProfileForm = () => {
    if (!profileForm) {
      return;
    }

    const profile = Auth?.getProfile?.();
    if (!profile) {
      profileHeadlineInput && (profileHeadlineInput.value = '');
      profileBioInput && (profileBioInput.value = '');
      if (profileAvailabilitySelect) {
        profileAvailabilitySelect.value = '';
      }
      return;
    }

    if (profileHeadlineInput) {
      profileHeadlineInput.value = profile.headline || '';
    }
    if (profileBioInput) {
      profileBioInput.value = profile.bio || '';
    }
    if (profileAvailabilitySelect) {
      profileAvailabilitySelect.value = profile.availability || '';
    }
  };

  const renderProfileInterests = () => {
    if (!profileInterestsList) {
      return;
    }

    const user = Auth?.getActiveUser?.();
    if (!user) {
      profileInterestsList.innerHTML = '<li>Faça login para cadastrar interesses.</li>';
      return;
    }

    const profile = Auth?.getProfile?.();
    const interests = profile?.interests ?? [];

    profileInterestsList.innerHTML = '';
    if (!interests.length) {
      const li = document.createElement('li');
      li.textContent = 'Adicione interesses para acompanhar sua trilha.';
      profileInterestsList.append(li);
      return;
    }

    interests.forEach((interest) => {
      const li = document.createElement('li');
      const tag = document.createElement('span');
      tag.textContent = interest;
      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.setAttribute('data-remove-interest', interest);
      removeButton.setAttribute('aria-label', `Remover ${interest}`);
      removeButton.innerHTML = '&times;';
      li.append(tag, removeButton);
      profileInterestsList.append(li);
    });
  };

  const renderProfileSkills = () => {
    if (!skillOptionsContainer) {
      return;
    }

    const user = Auth?.getActiveUser?.();
    const profile = Auth?.getProfile?.();
    const selectedSkills = profile?.skills ?? [];
    renderSkillOptions(skillOptionsContainer, selectedSkills, {
      namePrefix: 'candidate-skill',
      disabled: !user
    });
  };

  const refreshProfilePanel = () => {
    renderProfileSummary();
    fillProfileForm();
    renderProfileInterests();
    renderProfileSkills();
  };

  profileForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const result = Auth?.updateProfile?.({
      headline: profileHeadlineInput?.value ?? '',
      bio: profileBioInput?.value ?? '',
      availability: profileAvailabilitySelect?.value ?? ''
    }) ?? { success: false, message: 'Não foi possível salvar.' };
    setInlineFeedback(profileFeedback, result.message, result.success ? 'success' : 'error');
    if (result.success) {
      refreshProfilePanel();
    }
  });

  profileInterestForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const result = Auth?.addProfileInterest?.(profileInterestInput?.value ?? '') ?? {
      success: false,
      message: 'Não foi possível adicionar este interesse.'
    };
    setInlineFeedback(profileInterestFeedback, result.message, result.success ? 'success' : 'error');
    if (result.success && profileInterestInput) {
      profileInterestInput.value = '';
      refreshProfilePanel();
    }
  });

  profileInterestsList?.addEventListener('click', (event) => {
    const target = event.target;
    const button = target?.closest?.('[data-remove-interest]');
    if (!button) {
      return;
    }

    const label = button.getAttribute('data-remove-interest');
    const result = Auth?.removeProfileInterest?.(label) ?? {
      success: false,
      message: 'Não foi possível remover este interesse.'
    };
    setInlineFeedback(profileInterestFeedback, result.message, result.success ? 'success' : 'error');
    if (result.success) {
      refreshProfilePanel();
    }
  });

  skillForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const selectedSkills = getSkillValuesFromContainer(skillOptionsContainer);
    const result =
      Auth?.setProfileSkills?.(selectedSkills) ?? {
        success: false,
        message: 'Não foi possível atualizar as habilidades.'
      };
    setInlineFeedback(skillFeedback, result.message, result.success ? 'success' : 'error');
    if (result.success) {
      refreshProfilePanel();
      refreshJobQueue?.();
    }
  });

  refreshProfilePanel();

  const jobForm = document.querySelector('[data-job-form]');
  const jobFeedback = document.querySelector('[data-job-feedback]');
  const jobSkillOptions = document.querySelector('[data-job-skill-options]');
  const companyJobList = document.querySelector('[data-company-job-list]');
  const companyJobSummary = document.querySelector('[data-company-job-summary]');
  const companyApplicantsPanel = document.querySelector('[data-company-applicants]');

  if (jobSkillOptions) {
    renderSkillOptions(jobSkillOptions, [], { namePrefix: 'job-skill' });
  }

  jobForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const selectedJobSkills = getSkillValuesFromContainer(jobSkillOptions);

    if (!selectedJobSkills.length) {
      setInlineFeedback(jobFeedback, 'Selecione pelo menos uma habilidade necessária para a vaga.', 'error');
      return;
    }

    const payload = {
      company: jobForm.querySelector('[name="company-name"]').value,
      role: jobForm.querySelector('[name="role-title"]').value,
      seniority: jobForm.querySelector('[name="role-seniority"]').value,
      requirements: jobForm.querySelector('[name="core-requirements"]').value,
      differentials: jobForm.querySelector('[name="nice-to-have"]').value,
      image: jobForm.querySelector('[name="role-image"]').value,
      requiredSkills: selectedJobSkills
    };

    const result = Auth?.addJob?.(payload) ?? {
      success: false,
      message: 'Não foi possível salvar esta vaga.'
    };

    setInlineFeedback(jobFeedback, result.message, result.success ? 'success' : 'error');
    if (result.success) {
      jobForm.reset();
      refreshCompanyDashboard?.();
    }
  });

  const formatDateTime = (value) => {
    if (!value) {
      return 'Data não informada';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return 'Data não informada';
    }
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  let selectedCompanyJob = null;

  const renderApplicantsPanel = (overview) => {
    if (!companyApplicantsPanel) {
      return;
    }

    if (!selectedCompanyJob) {
      companyApplicantsPanel.innerHTML = '<p>Selecione uma vaga para visualizar as candidatas interessadas.</p>';
      return;
    }

    const job = overview.jobs?.find?.((item) => item.id === selectedCompanyJob);
    const applicants = overview.applicantsByJob?.[selectedCompanyJob] ?? [];

    if (!job) {
      companyApplicantsPanel.innerHTML = '<p>Esta vaga não está mais disponível.</p>';
      return;
    }

    if (!applicants.length) {
      companyApplicantsPanel.innerHTML = `<p>Nenhuma candidata favoritou <strong>${job.role}</strong> ainda.</p>`;
      return;
    }

    const list = document.createElement('ul');
    list.className = 'job-dashboard__list job-dashboard__list--applicants';

    applicants.forEach((candidate) => {
      const li = document.createElement('li');
      const headline = candidate.headline?.trim();
      const skillCount = job.requiredSkills?.length ?? 0;
      const matchedCount = candidate.matchedSkills?.length ?? 0;
      const matchSummary = skillCount ? `${matchedCount}/${skillCount} habilidades atendidas` : 'Sem habilidades listadas';
      li.innerHTML = `
        <div>
          <strong>${candidate.username}</strong>
          ${headline ? `<p>${headline}</p>` : ''}
          <small>${matchSummary}</small>
        </div>
        <span>${formatDateTime(candidate.savedAt)}</span>
      `;
      list.append(li);
    });

    companyApplicantsPanel.innerHTML = '';
    companyApplicantsPanel.append(list);
  };

  const formatSeniority = (value) => SENIORITY_LABELS[value] ?? value;

  const renderCompanyDashboard = () => {
    if (!companyJobList) {
      return;
    }

    const overview = Auth?.getCompanyDashboard?.() ?? { jobs: [], applicantsByJob: {} };
    const jobs = overview.jobs ?? [];
    companyJobList.innerHTML = '';

    if (companyJobSummary) {
      if (!jobs.length) {
        companyJobSummary.textContent = 'Cadastre uma vaga e acompanhe o status por aqui.';
      } else {
        const totalApplicants = jobs.reduce((total, job) => total + (job.applicantCount ?? 0), 0);
        companyJobSummary.textContent = `${jobs.length} vaga(s) publicada(s) • ${totalApplicants} interação(ões) das candidatas`;
      }
    }

    if (!jobs.length) {
      const li = document.createElement('li');
      li.textContent = 'Você ainda não cadastrou nenhuma vaga.';
      companyJobList.append(li);
      selectedCompanyJob = null;
      renderApplicantsPanel(overview);
      return;
    }

    jobs.forEach((job) => {
      const li = document.createElement('li');
      li.className = 'job-dashboard__item';
      if (selectedCompanyJob === job.id) {
        li.classList.add('is-active');
      }

      const info = document.createElement('div');
      const previewSkills = (job.requiredSkills ?? []).slice(0, 4);
      const skillsList = previewSkills.length
        ? `<ul class="job-dashboard__tags">${previewSkills
            .map((skill) => `<li>${SKILL_LABEL_MAP.get(skill) ?? skill}</li>`)
            .join('')}</ul>`
        : '';
      const seniorityLabel = job.seniority ? formatSeniority(job.seniority) : '';
      info.innerHTML = `
        <div class="job-dashboard__role">
          <strong>${job.role || 'Vaga sem título'}</strong>
          ${seniorityLabel ? `<span class="job-dashboard__badge">${seniorityLabel}</span>` : ''}
        </div>
        <p>${job.company}</p>
        ${skillsList}
        <small>${job.applicantCount || 0} candidata(s) interessadas</small>
      `;

      const actions = document.createElement('div');
      actions.className = 'job-dashboard__actions';
      const dateLabel = document.createElement('small');
      dateLabel.textContent = formatDateTime(job.createdAt);
      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.className = 'button button-ghost button-compact';
      removeButton.textContent = 'Remover';
      removeButton.addEventListener('click', (event) => {
        event.stopPropagation();
        const result = Auth?.removeJob?.(job.id) ?? {
          success: false,
          message: 'Não foi possível remover a vaga.'
        };
        setInlineFeedback(jobFeedback, result.message, result.success ? 'success' : 'error');
        if (result.success) {
          if (selectedCompanyJob === job.id) {
            selectedCompanyJob = null;
          }
          renderCompanyDashboard();
          refreshJobQueue?.();
        }
      });
      actions.append(dateLabel, removeButton);

      li.append(info, actions);
      li.addEventListener('click', () => {
        selectedCompanyJob = job.id;
        renderCompanyDashboard();
      });
      companyJobList.append(li);
    });

    renderApplicantsPanel(overview);
  };

  renderCompanyDashboard();
  refreshCompanyDashboard = renderCompanyDashboard;

  const swipeCard = document.querySelector('[data-swipe-card]');
  const swipeImage = document.querySelector('[data-swipe-card-image]');
  const swipeCompany = document.querySelector('[data-swipe-card-company]');
  const swipeTitle = document.querySelector('[data-swipe-card-title]');
  const swipeDescription = document.querySelector('[data-swipe-card-description]');
  const swipeMeta = document.querySelector('[data-swipe-card-meta]');
  const swipeNote = document.querySelector('[data-swipe-card-note]');
  const swipeProgress = document.querySelector('[data-swipe-progress]');
  const swipeSkills = document.querySelector('[data-swipe-card-skills]');
  const favoritesFeed = document.querySelector('[data-favorites-feed]');
  const favoriteFeedback = document.querySelector('[data-favorite-feedback]');
  const interestList = document.querySelector('[data-interest-list]');
  const interestDetail = document.querySelector('[data-interest-detail]');
  const swipeButtons = document.querySelectorAll('.swipe-control');

  if (
    swipeCard &&
    swipeImage &&
    swipeCompany &&
    swipeTitle &&
    swipeDescription &&
    swipeMeta &&
    swipeProgress &&
    favoritesFeed
  ) {
    let favorites = Auth?.getFavorites?.() ?? [];

    const mapJobsToQueue = () => {
      const jobs = Auth?.getJobs?.() ?? [];
      return jobs.map((job) => ({
        id: job.id,
        title: job.role || 'Vaga sem título',
        company: job.company || 'Empresa confidencial',
        category: job.company || 'Empresa confidencial',
        description: job.requirements || 'A empresa não detalhou os requisitos prioritários.',
        differentials: job.differentials || '',
        seniority: job.seniority || '',
        image: job.image || '',
        requiredSkills: Array.isArray(job.requiredSkills) ? job.requiredSkills : [],
        createdAt: job.createdAt,
        createdBy: job.createdBy
      }));
    };

    let jobQueue = [];
    let totalJobs = 0;
    let viewedJobs = 0;
    let currentCard = null;
    let emptyStateReason = null;

    const toggleControls = (disabled) => {
      swipeButtons.forEach((button) => {
        button.disabled = disabled;
      });
    };

    const setImage = (job) => {
      if (!swipeImage) {
        return;
      }
      swipeImage.style.backgroundImage = '';
      swipeImage.style.backgroundSize = '';
      swipeImage.style.backgroundPosition = '';
      if (job?.image) {
        swipeImage.style.backgroundImage = `url(${job.image})`;
        swipeImage.style.backgroundSize = 'cover';
        swipeImage.style.backgroundPosition = 'center';
        swipeImage.textContent = '';
      } else {
        const initials = job?.company?.slice(0, 3).toUpperCase() || 'Vaga';
        swipeImage.textContent = initials;
      }
    };

    const renderEmptyCard = (message) => {
      swipeCard.classList.add('swipe-card--empty');
      swipeCompany.textContent = 'TechMatch';
      swipeTitle.textContent = 'Vagas indisponíveis';
      swipeMeta.textContent = 'Aguardando novos envios das empresas.';
      swipeDescription.textContent = message;
      if (swipeNote) {
        swipeNote.textContent = '';
        swipeNote.hidden = true;
      }
      if (swipeSkills) {
        swipeSkills.innerHTML = '';
        swipeSkills.hidden = true;
      }
      swipeImage.textContent = '—';
      swipeImage.style.backgroundImage = '';
      swipeProgress.textContent = 'Sem vagas ativas';
      toggleControls(true);
    };

    const renderCard = (job, reason = null) => {
      if (!job) {
        let message = 'Ainda não há vagas publicadas pelas empresas.';
        if (reason === 'missing-skills') {
          message = 'Selecione pelo menos uma habilidade no painel ao lado para desbloquear oportunidades compatíveis.';
        } else if (reason === 'no-matching-jobs') {
          message = 'Nenhuma vaga exige as habilidades escolhidas. Ajuste sua lista para descobrir novas oportunidades.';
        } else if (reason === 'no-jobs') {
          message = 'Ainda não há vagas publicadas pelas empresas.';
        } else if (totalJobs) {
          message = 'Você analisou todas as vagas disponíveis. Aguarde novas oportunidades.';
        }
        renderEmptyCard(message);
        return;
      }

      swipeCard.classList.remove('swipe-card--empty');
      swipeCompany.textContent = job.company;
      swipeTitle.textContent = job.title;
      swipeMeta.textContent = job.seniority ? `Senioridade: ${job.seniority}` : 'Senioridade não informada';
      swipeDescription.textContent = job.description;
      if (swipeSkills) {
        swipeSkills.innerHTML = '';
        if (job.requiredSkills?.length) {
          swipeSkills.hidden = false;
          job.requiredSkills.forEach((skill) => {
            const option = SKILL_OPTIONS.find((item) => item.value === skill);
            const label = option?.label || skill;
            const li = document.createElement('li');
            li.textContent = label;
            swipeSkills.append(li);
          });
        } else {
          swipeSkills.hidden = true;
        }
      }
      if (swipeNote) {
        if (job.differentials) {
          swipeNote.hidden = false;
          swipeNote.textContent = `Diferenciais: ${job.differentials}`;
        } else {
          swipeNote.hidden = true;
          swipeNote.textContent = '';
        }
      }
      setImage(job);
      const currentPosition = Math.min(viewedJobs + 1, Math.max(totalJobs, 1));
      swipeProgress.textContent = `Vaga ${currentPosition} de ${Math.max(totalJobs, 1)}`;
      toggleControls(false);
    };

    const showFeedback = (message, state = 'info') => {
      if (!favoriteFeedback) {
        return;
      }
      favoriteFeedback.textContent = message;
      favoriteFeedback.dataset.state = state;
    };

    const renderInterestDetail = (match = null) => {
      if (!interestDetail) {
        return;
      }

      if (!match) {
        interestDetail.innerHTML = '<p>Selecione uma área na lista para ver o resumo completo.</p>';
        return;
      }

      interestDetail.innerHTML = `
        <p class="eyebrow">${match.company || match.category || 'Empresa confidencial'}</p>
        <h4>${match.title || 'Favorito'}</h4>
        <p>${match.description || 'Sem descrição disponível.'}</p>
        ${match.differentials ? `<p><strong>Diferenciais:</strong> ${match.differentials}</p>` : ''}
      `;
    };

    const renderInterestList = () => {
      if (!interestList) {
        return;
      }

      interestList.innerHTML = '';
      const currentFavorites = favorites?.slice?.() ?? [];
      if (!currentFavorites.length) {
        const li = document.createElement('li');
        li.textContent = 'Ainda não há áreas salvas para gerenciar.';
        interestList.append(li);
        renderInterestDetail(null);
        return;
      }

      currentFavorites.forEach((match) => {
        const li = document.createElement('li');

        const info = document.createElement('div');
        info.className = 'interest-list__info';
        const title = document.createElement('strong');
        title.textContent = match.title || 'Favorito';
        const category = document.createElement('span');
        category.textContent = match.company || match.category || 'Empresa confidencial';
        info.append(title, category);

        const actions = document.createElement('div');
        actions.className = 'interest-actions';

        const detailButton = document.createElement('button');
        detailButton.type = 'button';
        detailButton.className = 'button button-ghost button-compact';
        detailButton.textContent = 'Ver detalhes';
        detailButton.addEventListener('click', () => {
          renderInterestDetail(match);
        });

        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.className = 'button button-primary button-compact';
        removeButton.textContent = 'Remover';
        removeButton.addEventListener('click', () => {
          const result = Auth.removeFavorite?.(match.id ?? match.title) ?? {
            success: false,
            message: 'Não foi possível remover.'
          };
          favorites = result.favorites ?? favorites;
          updateFeed();
          showFeedback(result.message, result.success ? 'success' : 'error');
          if (result.success) {
            renderInterestDetail(null);
          }
        });

        actions.append(detailButton, removeButton);
        li.append(info, actions);
        interestList.append(li);
      });
    };

    const updateFeed = () => {
      favoritesFeed.innerHTML = '';
      const currentFavorites = favorites?.slice?.() ?? [];
      if (!currentFavorites.length) {
        const li = document.createElement('li');
        li.textContent = 'Ainda não há favoritos. Clique em Favoritar para salvar.';
        favoritesFeed.append(li);
        renderInterestList();
        return;
      }

      currentFavorites.slice(-5).reverse().forEach((match) => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${match.title || 'Favorito'}</strong> • ${match.company || match.category || 'Empresa'}`;
        favoritesFeed.append(li);
      });
      renderInterestList();
    };

    const advanceCard = (initial = false) => {
      if (!initial && currentCard) {
        viewedJobs += 1;
      }

      if (!jobQueue.length) {
        currentCard = null;
        renderCard(null, emptyStateReason);
        return;
      }

      currentCard = jobQueue.shift();
      renderCard(currentCard);
    };

    const computeFilteredQueue = () => {
      const jobs = mapJobsToQueue();
      const profileSkills = Auth?.getProfile?.()?.skills ?? [];
      const skillSet = new Set(profileSkills.map((skill) => skill.toLowerCase()));
      const hasSkills = Boolean(skillSet.size);
      const filteredJobs = hasSkills
        ? jobs.filter((job) => {
            const jobSkills = Array.isArray(job.requiredSkills)
              ? job.requiredSkills.map((skill) => skill.toLowerCase())
              : [];
            if (!jobSkills.length) {
              return false;
            }
            return jobSkills.some((skill) => skillSet.has(skill));
          })
        : [];

      let reason = null;
      if (!jobs.length) {
        reason = 'no-jobs';
      } else if (!hasSkills) {
        reason = 'missing-skills';
      } else if (!filteredJobs.length) {
        reason = 'no-matching-jobs';
      }

      return { queue: filteredJobs, reason };
    };

    const rebuildJobQueue = () => {
      const { queue, reason } = computeFilteredQueue();
      jobQueue = queue;
      totalJobs = queue.length;
      viewedJobs = 0;
      emptyStateReason = reason;
      if (!jobQueue.length) {
        renderCard(null, reason);
      } else {
        advanceCard(true);
      }
    };

    const handleSkip = () => {
      if (!currentCard) {
        showFeedback('Não há vagas disponíveis para pular no momento.', 'info');
        return;
      }
      const skippedCompany = currentCard.company;
      advanceCard();
      showFeedback(`Vaga ignorada. Você verá as próximas oportunidades enviadas por ${skippedCompany}.`, 'info');
    };

    const handleFavorite = () => {
      if (!Auth || !Auth.getActiveUser?.()) {
        const redirectPath = `${window.location.pathname}${window.location.search || ''}`;
        if (!Auth?.promptInlineAuth?.()) {
          window.location.href = `login.html?redirect=${encodeURIComponent(redirectPath)}`;
        }
        return;
      }

      if (!currentCard) {
        showFeedback('Não há vagas disponíveis para favoritar.', 'info');
        return;
      }

      const favoritePayload = {
        ...currentCard,
        category: currentCard.company
      };
      const result = Auth.addFavorite?.(favoritePayload) ?? { success: false, message: 'Não foi possível salvar.' };
      favorites = result.favorites ?? favorites;
      updateFeed();
      showFeedback(result.message, result.success ? 'success' : 'error');
      if (result.success) {
        advanceCard();
      }
    };

    document.querySelectorAll('[data-action="skip"]').forEach((button) => {
      button.addEventListener('click', handleSkip);
    });

    document.querySelectorAll('[data-action="favorite"]').forEach((button) => {
      button.addEventListener('click', handleFavorite);
    });

    rebuildJobQueue();
    updateFeed();
    renderInterestDetail(null);
    refreshJobQueue = rebuildJobQueue;
  }
})();
