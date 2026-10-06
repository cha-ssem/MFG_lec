/**
 * @file prompt-copy.js
 * @description 프롬프트 원클릭 복사 및 토스트 알림 컴포넌트
 */

/**
 * 토스트 메시지를 화면에 표시합니다.
 * @param {string} message - 표시할 텍스트
 * @param {string} [type='success'] - 토스트 종류 ('success' | 'info')
 */
function showToast(message, type = 'success') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>✓</span> <span>${message}</span>`;
  container.appendChild(toast);

  // 애니메이션 트리거
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // 3초 후 자동 제거
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 2500);
}

/**
 * 텍스트를 클립보드에 복사하고 버튼 상태를 갱신합니다.
 * @param {string} text - 복사할 텍스트
 * @param {HTMLElement} [buttonElement=null] - 복사를 트리거한 버튼
 */
async function copyToClipboard(text, buttonElement = null) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback for non-https or older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }

    showToast('프롬프트가 클립보드에 복사되었습니다!');

    if (buttonElement) {
      const originalText = buttonElement.innerHTML;
      buttonElement.innerHTML = '<span>✓</span> 복사완료!';
      buttonElement.classList.add('copied');

      setTimeout(() => {
        buttonElement.innerHTML = originalText;
        buttonElement.classList.remove('copied');
      }, 2000);
    }
  } catch (err) {
    console.error('클립보드 복사 실패:', err);
    showToast('복사에 실패했습니다. 직접 복사해주세요.', 'info');
  }
}

/**
 * 문서 내의 모든 .copy-btn 이벤트 리스너를 바인딩합니다.
 */
function initCopyButtons() {
  document.addEventListener('click', (event) => {
    const target = event.target.closest('.copy-btn');
    if (!target) return;

    let textToCopy = '';
    const targetSelector = target.getAttribute('data-target');

    if (targetSelector) {
      const targetEl = document.querySelector(targetSelector);
      if (targetEl) {
        textToCopy = targetEl.value !== undefined ? targetEl.value.trim() : targetEl.innerText.trim();
      }
    } else {
      const panel = target.closest('.prompt-panel-dark, .prompt-panel-light, .prompt-box');
      if (panel) {
        const textarea = panel.querySelector('.prompt-edit-textarea');
        if (textarea && textarea.value) {
          textToCopy = textarea.value.trim();
        } else {
          const contentEl = panel.querySelector('.prompt-panel-content, .prompt-content');
          if (contentEl) textToCopy = contentEl.innerText.trim();
        }
      }
    }

    if (textToCopy) {
      copyToClipboard(textToCopy, target);
    }
  });
}

// 스크립트 로드 시 버튼 이벤트 리스너 초기화
document.addEventListener('DOMContentLoaded', initCopyButtons);
