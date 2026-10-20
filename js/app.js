/**
 * @file app.js
 * @description 웹페이지 메인 애플리케이션 로직 (탭 전환, 다듬기 팁, 아코디언, 도구 비교, 스크롤스파이 등)
 * Strictly aligned with Apple Web Design Language (design.md)
 */

document.addEventListener('DOMContentLoaded', () => {
  renderServices();
  renderDeptTabs();
  renderRefineChips();
  renderSafetyRules();
  renderComparisonTable();
  renderGlossary();
  setupScrollSpy();
  setupTabEvents();
  setupDropdownEvents();
  setupLightbox();
  setupPromptCompareEvents();
  setupEmailCopy();
  setupFloatingQuickNav();
});

/**
 * 글로벌 네비게이션 드롭다운 메뉴 이벤트 처리 (마우스 호버 & 클릭 완벽 지원)
 */
function setupDropdownEvents() {
  const dropdown = document.getElementById('llmDropdown');
  const dropdownBtn = document.getElementById('llmDropdownBtn');
  if (!dropdown || !dropdownBtn) return;

  let closeTimer = null;

  const openDropdown = () => {
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
    dropdown.classList.add('open');
    dropdownBtn.setAttribute('aria-expanded', 'true');
  };

  const closeDropdown = (delay = 0) => {
    if (delay > 0) {
      closeTimer = setTimeout(() => {
        dropdown.classList.remove('open');
        dropdownBtn.setAttribute('aria-expanded', 'false');
        closeTimer = null;
      }, delay);
    } else {
      dropdown.classList.remove('open');
      dropdownBtn.setAttribute('aria-expanded', 'false');
    }
  };

  // 버튼 클릭 시 토글
  dropdownBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropdown.classList.contains('open')) {
      closeDropdown(0);
    } else {
      openDropdown();
    }
  });

  // 마우스 진입 시 즉시 열기
  dropdown.addEventListener('mouseenter', () => {
    openDropdown();
  });

  // 마우스 이탈 시 300ms 딜레이 후 닫기
  dropdown.addEventListener('mouseleave', () => {
    closeDropdown(300);
  });

  // 드롭다운 내부 링크 클릭 시 닫기
  dropdown.querySelectorAll('.dropdown-item').forEach((link) => {
    link.addEventListener('click', () => {
      closeDropdown(0);
    });
  });

  // 외부 영역 클릭 시 닫기
  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target)) {
      closeDropdown(0);
    }
  });

  // ESC 키 누를 시 닫기
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && dropdown.classList.contains('open')) {
      closeDropdown(0);
    }
  });
}

/**
 * LLM 서비스 비교 카드 렌더링
 */
function renderServices() {
  const container = document.getElementById('servicesContainer');
  if (!container || !LECTURE_DATA.services) return;

  container.innerHTML = LECTURE_DATA.services.map((item) => {
    const badgeHtml = item.isRecommended
      ? '<span style="font-size: 12px; font-weight: 600; color: var(--colors-primary);">추천 도구</span>'
      : `<span style="font-size: 12px; color: var(--colors-ink-muted-48);">${item.tag}</span>`;

    const featureItems = item.features.map(f => `<li>• ${f}</li>`).join('');

    return `
      <div class="store-card">
        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px;">
          <h3 style="font-size: 20px; font-weight: 600; letter-spacing: -0.2px;">${item.name}</h3>
          ${badgeHtml}
        </div>
        <ul style="list-style: none; display: flex; flex-direction: column; gap: 8px; margin-block: 16px; font-size: 14px; color: var(--colors-ink-muted-80); flex-grow: 1;">
          ${featureItems}
        </ul>
        <div style="margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--colors-hairline); font-size: 13px; color: var(--colors-ink-muted-80);">
          <strong style="color: var(--colors-ink);">최적 활용:</strong> ${item.bestFor}
        </div>
      </div>
    `;
  }).join('');
}

// 기존 로컬스토리지에 저장되어 있던 커스텀 프롬프트 캐시 초기화
try {
  localStorage.removeItem('manufacture_custom_dept_prompts');
} catch (e) {
  // no-op
}

/**
 * 부서별 맞춤 프롬프트 탭 및 콘텐츠 렌더링 (기본 프롬프트 및 ✨ 프롬프트 개선 비교 뷰)
 */
function renderDeptTabs() {
  const navContainer = document.getElementById('deptTabNav');
  const contentContainer = document.getElementById('deptTabContent');
  if (!navContainer || !contentContainer || !LECTURE_DATA.deptPrompts) return;

  const depts = Object.keys(LECTURE_DATA.deptPrompts);

  navContainer.innerHTML = depts.map((key, index) => {
    const activeClass = index === 0 ? 'active' : '';
    return `
      <button class="tab-btn ${activeClass}" data-dept="${key}">
        ${LECTURE_DATA.deptPrompts[key].label}
      </button>
    `;
  }).join('');

  contentContainer.innerHTML = depts.map((key, index) => {
    const activeClass = index === 0 ? 'active' : '';
    const deptInfo = LECTURE_DATA.deptPrompts[key];

    const cardsHtml = deptInfo.prompts.map((item, pIndex) => {
      const promptId = `${key}_${pIndex}`;
      const displayText = item.text;
      const improvedText = item.improvedText || item.text;

      return `
        <div class="prompt-panel-dark" id="prompt-panel-${promptId}" data-prompt-id="${promptId}" data-default-text="${encodeURIComponent(item.text)}" data-improved-text="${encodeURIComponent(improvedText)}" style="margin-bottom: var(--spacing-md); text-align: left;">
          <div class="prompt-panel-header">
            <div>
              <span class="prompt-panel-title">${item.title}</span>
              ${item.situation ? `<div style="font-size: 12px; color: #a1a1a6; margin-top: 2px;">상황: ${item.situation}</div>` : ''}
            </div>
            <div class="prompt-panel-actions">
              <button type="button" class="btn-compare-prompt" title="개선된 프롬프트와 기본 설정 프롬프트 나란히 비교">✨ 프롬프트 개선</button>
              <button type="button" class="copy-btn">복사</button>
            </div>
          </div>

          <!-- 기본 1단 뷰: 기본 설정 프롬프트 -->
          <div class="prompt-panel-content">${displayText}</div>

          <!-- Side-by-Side 비교 뷰 (프롬프트 개선 클릭 시 표시) -->
          <div class="prompt-compare-view" style="display: none;">
            <div class="prompt-compare-grid">
              <!-- 왼쪽: 기본 설정 프롬프트 -->
              <div class="compare-col compare-col-default">
                <div class="compare-col-header">
                  <span class="compare-col-tag compare-tag-default">기본 설정 프롬프트</span>
                  <button type="button" class="copy-btn btn-mini-copy" data-target="#current-default-text-${promptId}">복사</button>
                </div>
                <div class="compare-col-body" id="current-default-text-${promptId}">${displayText}</div>
              </div>

              <!-- 오른쪽: 개선된 프롬프트 (AI 추천 고도화 버전) -->
              <div class="compare-col compare-col-improved">
                <div class="compare-col-header">
                  <span class="compare-col-tag compare-tag-improved">개선된 프롬프트 (추천)</span>
                  <button type="button" class="copy-btn btn-mini-copy" data-target="#improved-text-${promptId}">복사</button>
                </div>
                <div class="compare-col-body" id="improved-text-${promptId}">${improvedText}</div>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="tab-pane ${activeClass}" id="dept-pane-${key}">
        ${cardsHtml}
      </div>
    `;
  }).join('');
}

/**
 * 프롬프트 개선 비교 뷰 토글 이벤트 바인딩
 */
function setupPromptCompareEvents() {
  const contentContainer = document.getElementById('deptTabContent');
  if (!contentContainer) return;

  contentContainer.addEventListener('click', (e) => {
    // [✨ 프롬프트 개선] 비교 버튼 클릭 시 토글
    const compareBtn = e.target.closest('.btn-compare-prompt');
    if (compareBtn) {
      const panel = compareBtn.closest('.prompt-panel-dark');
      if (!panel) return;

      const contentEl = panel.querySelector('.prompt-panel-content');
      const compareView = panel.querySelector('.prompt-compare-view');
      const isOpen = compareView.style.display === 'block';

      if (isOpen) {
        // 비교 뷰 닫기
        compareView.style.display = 'none';
        contentEl.style.display = 'block';
        compareBtn.innerHTML = '✨ 프롬프트 개선';
        compareBtn.classList.remove('active');
      } else {
        // 비교 뷰 열기
        contentEl.style.display = 'none';
        compareView.style.display = 'block';
        compareBtn.innerHTML = '✕ 비교 닫기';
        compareBtn.classList.add('active');
      }
    }
  });
}

/**
 * 다듬기 팁 칩 렌더링 (후속 대화 원클릭 복사)
 */
function renderRefineChips() {
  const container = document.getElementById('refineChipsContainer');
  if (!container || !LECTURE_DATA.refineTips) return;

  container.innerHTML = LECTURE_DATA.refineTips.map(item => `
    <button type="button" class="refine-chip" data-prompt="${encodeURIComponent(item.prompt)}">
      <span class="refine-chip-icon">💬</span>
      <span>${item.label}</span>
    </button>
  `).join('');

  // 칩 클릭 시 즉시 클립보드 복사
  container.addEventListener('click', (e) => {
    const chip = e.target.closest('.refine-chip');
    if (!chip) return;

    const rawPrompt = decodeURIComponent(chip.getAttribute('data-prompt') || '');
    if (!rawPrompt) return;

    navigator.clipboard.writeText(rawPrompt).then(() => {
      if (window.showToast) {
        window.showToast(`후속 프롬프트 복사됨: "${rawPrompt}"`);
      }
    }).catch(() => {
      const textarea = document.createElement('textarea');
      textarea.value = rawPrompt;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      if (window.showToast) {
        window.showToast(`후속 프롬프트 복사됨: "${rawPrompt}"`);
      }
    });
  });
}

/**
 * 할루시네이션 및 기업 보안 유의사항 렌더링
 */
function renderSafetyRules() {
  const container = document.getElementById('safetyRulesContainer');
  if (!container || !LECTURE_DATA.safetyRules) return;

  container.innerHTML = LECTURE_DATA.safetyRules.map((item, idx) => {
    const badgeClass = idx === 0 ? 'safety-badge-warning' : 'safety-badge-danger';
    const badgeText = idx === 0 ? '환각 주의' : '보안 필수';

    return `
      <div class="safety-card">
        <div class="safety-card-header">
          <span class="safety-badge ${badgeClass}">${badgeText}</span>
          <h3 class="safety-card-title">${item.category}</h3>
        </div>
        <p class="safety-desc"><strong>위험 요소:</strong> ${item.risk}</p>
        <div class="safety-actions">
          <div class="safety-actions-title">실무 행동 수칙</div>
          <div class="safety-actions-text">${item.action}</div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Claude.ai vs Claude Code 업무 상황별 비교 테이블 렌더링
 */
function renderComparisonTable() {
  const container = document.getElementById('comparisonTableBody');
  if (!container || !LECTURE_DATA.comparisonTable) return;

  container.innerHTML = LECTURE_DATA.comparisonTable.map(row => `
    <tr>
      <td><strong>${row.task}</strong></td>
      <td>${row.claudeWeb}</td>
      <td class="col-highlight"><strong style="color: var(--colors-primary);">${row.claudeCode}</strong></td>
    </tr>
  `).join('');
}

/**
 * 탭 전환 이벤트 바인딩
 */
function setupTabEvents() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.tab-btn');
    if (!btn) return;

    const nav = btn.closest('.tab-nav');
    if (!nav) return;

    const deptKey = btn.getAttribute('data-dept');
    if (!deptKey) return;

    nav.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const contentContainer = document.getElementById('deptTabContent');
    if (contentContainer) {
      contentContainer.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
      const activePane = document.getElementById(`dept-pane-${deptKey}`);
      if (activePane) activePane.classList.add('active');
    }
  });
}

/**
 * 핵심 실무 용어 사전 2열 인터랙티브 그리드 렌더링
 */
function renderGlossary() {
  const container = document.getElementById('glossaryContainer');
  if (!container || !LECTURE_DATA.glossary) return;

  container.innerHTML = LECTURE_DATA.glossary.map((item, index) => {
    const num = String(index + 1).padStart(2, '0');
    return `
      <div class="glossary-card">
        <div class="glossary-card-header">
          <span class="glossary-card-num">${num}</span>
          <h3 class="glossary-card-term">${item.term}</h3>
        </div>
        <p class="glossary-card-desc">${item.desc}</p>
      </div>
    `;
  }).join('');
}

/**
 * 스크롤 스파이 및 네비게이션 활성화
 */
function setupScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.global-nav-link');

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollY = window.pageYOffset;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 140;
      const sectionHeight = section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  });
}

/**
 * 인포그래픽 이미지 확대 라이트박스 모달 제어
 */
function setupLightbox() {
  const modal = document.getElementById('imageLightbox');
  const img = document.getElementById('lightboxImg');
  const caption = document.getElementById('lightboxCaption');
  const closeBtn = document.getElementById('lightboxClose');
  const backdrop = document.getElementById('lightboxBackdrop');
  const downloadLink = document.getElementById('lightboxDownload');
  if (!modal || !img || !caption) return;

  const openLightbox = (src, title) => {
    img.src = src;
    img.alt = title || '확대 이미지';
    caption.textContent = title || '';
    if (downloadLink) {
      downloadLink.href = src;
      const fileName = src.split('/').pop() || 'sample-image.png';
      downloadLink.setAttribute('download', fileName);
    }

    // QR코드 등 컴팩트 뷰가 필요한 경우 전용 클래스 적용
    if (src.toLowerCase().includes('qrcode')) {
      modal.classList.add('is-compact-mode');
    } else {
      modal.classList.remove('is-compact-mode');
    }

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    modal.classList.remove('active');
    modal.classList.remove('is-compact-mode');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(() => {
      if (!modal.classList.contains('active')) {
        img.src = '';
      }
    }, 250);
  };

  // [data-full] 속성을 가진 모든 이미지 카드 및 미리보기 버튼 클릭 시 모달 열기
  document.querySelectorAll('[data-full]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const fullSrc = trigger.getAttribute('data-full');
      const title = trigger.getAttribute('data-title');
      if (fullSrc) {
        openLightbox(fullSrc, title);
      }
    });
  });

  // 닫기 버튼 클릭
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeLightbox();
    });
  }

  // 백드롭 배경 클릭
  if (backdrop) {
    backdrop.addEventListener('click', () => {
      closeLightbox();
    });
  }

  // ESC 키 누를 시 닫기
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeLightbox();
    }
  });
}

/**
 * 푸터 '강의 문의하기' 클릭 시 이메일 주소 복사
 */
function setupEmailCopy() {
  const emailLink = document.getElementById('copyEmailLink');
  if (!emailLink) return;

  const targetEmail = 'jjung9935@naver.com';

  emailLink.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(targetEmail);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = targetEmail;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      if (typeof showToast === 'function') {
        showToast(`이메일 주소(${targetEmail})가 클립보드에 복사되었습니다!`);
      } else {
        alert(`이메일 주소(${targetEmail})가 클립보드에 복사되었습니다.`);
      }
    } catch (err) {
      console.error('이메일 복사 실패:', err);
      window.location.href = `mailto:${targetEmail}`;
    }
  });
}

/**
 * 플로팅 퀵 내비게이션 (우측 하단 메뉴) 인터랙션 제어
 */
function setupFloatingQuickNav() {
  const nav = document.getElementById('floatingQuickNav');
  const toggleBtn = document.getElementById('floatingNavToggleBtn');
  const closeBtn = document.getElementById('floatingNavCloseBtn');
  const menuLinks = document.querySelectorAll('.floating-nav-link');
  if (!nav || !toggleBtn) return;

  const toggleMenu = (e) => {
    e.stopPropagation();
    nav.classList.toggle('open');
  };

  const closeMenu = () => {
    nav.classList.remove('open');
  };

  toggleBtn.addEventListener('click', toggleMenu);

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeMenu();
    });
  }

  // 메뉴 항목 클릭 시 메뉴 닫기
  menuLinks.forEach((link) => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  // 외부 클릭 시 닫기
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) {
      closeMenu();
    }
  });

  // ESC 키 누를 시 닫기
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('open')) {
      closeMenu();
    }
  });
}
